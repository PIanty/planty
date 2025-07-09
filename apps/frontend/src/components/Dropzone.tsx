import { useCallback, useEffect, useRef, useState } from "react";
import { Box, Text, VStack, Button, useToast, Flex, Icon } from "@chakra-ui/react";
import { blobToBase64, getDeviceId, resizeImage } from "../util";
import { getImageFingerprint } from "../util/imageHash";
import { useWallet } from "@vechain/dapp-kit-react";
import { submitReceipt } from "../networking";
import { checkPassportStatus, PassportStatus } from "../networking/checkPassportStatus";
import { useDisclosure, useSubmission } from "../hooks";
import { FaCat, FaCameraRetro, FaPassport } from "react-icons/fa";
import Webcam from "react-webcam";

// Cat-themed error messages
const errorMessages = {
  multipleFiles: "Meow? 🙀 This kitty can only handle one image at a time!",
  noFiles: "Hiss! 😾 This cat needs to see your tree planting photo!",
  noWallet: "Purr-lease connect your wallet first! 😸 This kitty needs to know who you are!",
  submitError: "Meow-ch! 😿 Something went wrong with this kitty's analysis. Please try again!",
  duplicateImage: "Meow-nope! 😼 This kitty has seen this image before! Please submit a different one.",
  cameraError: "Meow-oh-no! 😿 This kitty couldn't access your camera. Please check permissions!",
  noPassport: "Meow! 🙀 This kitty needs to see your Katty passport before accepting submissions!"
};

export const Dropzone = () => {
  const { account } = useWallet();
  const { setIsLoading, setResponse } = useSubmission();
  const { onOpen } = useDisclosure();
  const inputRef = useRef<HTMLInputElement>(null);
  const webcamRef = useRef<Webcam>(null);
  const toast = useToast();
  const [showCamera, setShowCamera] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [passportStatus, setPassportStatus] = useState<PassportStatus | null>(null);
  const [isCheckingPassport, setIsCheckingPassport] = useState(false);

  const videoConstraints = {
    width: 720,
    height: 1280,
    facingMode: "environment" // Use back camera if available
  };

  // Check passport status when account changes
  useEffect(() => {
    const fetchPassportStatus = async () => {
      if (account) {
        setIsCheckingPassport(true);
        try {
          const status = await checkPassportStatus(account);
          setPassportStatus(status);
        } catch (error) {
          console.error("Error checking passport status:", error);
        } finally {
          setIsCheckingPassport(false);
        }
      } else {
        setPassportStatus(null);
      }
    };

    fetchPassportStatus();
  }, [account]);

  const showCatToast = (message: string, status: "error" | "warning" | "info" = "error") => {
    toast({
      description: message,
      status: status,
      duration: 5000,
      isClosable: true,
      position: "top",
      icon: <FaCat />,
    });
  };

  const handleUserMediaError = () => {
    showCatToast(errorMessages.cameraError);
    setShowCamera(false);
  };

  const handleUserMedia = () => {
    setIsCameraReady(true);
  };

  const processImage = async (imageData: string) => {
    if (!account) {
      showCatToast(errorMessages.noWallet, "warning");
      return;
    }

    // Check passport status if required - always check regardless of passportStatus.required setting
    if (!passportStatus?.hasPassport) {
      showCatToast(errorMessages.noPassport, "warning");
      return;
    }

    setIsLoading(true);
    onOpen();

    try {
      // Convert base64 to blob for processing
      const fetchRes = await fetch(imageData);
      const blob = await fetchRes.blob();
      
      // Create a File object from the Blob
      const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
      
      const resizedBlob = await resizeImage(file);
      const base64Image = await blobToBase64(resizedBlob as Blob);
      
      // Generate image fingerprint/hash
      const imageHash = await getImageFingerprint(base64Image);

      const deviceID = await getDeviceId();

      const response = await submitReceipt({
        address: account,
        deviceID,
        image: base64Image,
        imageHash
      });
      
      setResponse(response);
    } catch (error) {
      showCatToast(errorMessages.submitError);
    } finally {
      setIsLoading(false);
      setShowCamera(false);
    }
  };

  const capturePhoto = useCallback(() => {
    if (!webcamRef.current) return;
    
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      processImage(imageSrc);
    } else {
      showCatToast(errorMessages.noFiles);
    }
  }, [webcamRef, account]);

  const onFileUpload = useCallback(
    async (files: File[]) => {
      if (files.length > 1) {
        showCatToast(errorMessages.multipleFiles);
        return;
      }
      
      if (files.length === 0) {
        showCatToast(errorMessages.noFiles);
        return;
      }

      if (!account) {
        showCatToast(errorMessages.noWallet, "warning");
        return;
      }

      // Check passport status - always check regardless of passportStatus.required setting
      if (!passportStatus?.hasPassport) {
        showCatToast(errorMessages.noPassport, "warning");
        return;
      }

      setIsLoading(true);
      onOpen();

      const file = files[0];

      const resizedBlob = await resizeImage(file);
      const base64Image = await blobToBase64(resizedBlob as Blob);
      
      // Generate image fingerprint/hash
      const imageHash = await getImageFingerprint(base64Image);

      const deviceID = await getDeviceId();

      try {
        const response = await submitReceipt({
          address: account,
          deviceID,
          image: base64Image,
          imageHash
        });
        
        setResponse(response);
      } catch (error) {
        showCatToast(errorMessages.submitError);
      } finally {
        setIsLoading(false);
      }
    },
    [account, onOpen, setIsLoading, setResponse, toast, passportStatus],
  );

  const handleButtonClick = () => {
    if (!passportStatus?.hasPassport) {
      showCatToast(errorMessages.noPassport, "warning");
      return;
    }
    setShowCamera(true);
  };

  const handleFileButtonClick = () => {
    if (!passportStatus?.hasPassport) {
      showCatToast(errorMessages.noPassport, "warning");
      return;
    }
    
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.click();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFileUpload(Array.from(e.target.files));
    }
  };

  // Render passport status indicator
  const renderPassportStatus = () => {
    if (!account) {
      return (
        <Flex align="center" justify="center" mt={2}>
          <Text color="#e57373" fontSize="sm" fontStyle="italic">
            Connect your wallet to check passport status
          </Text>
        </Flex>
      );
    }
    
    if (isCheckingPassport) {
      return (
        <Flex align="center" justify="center" mt={2}>
          <Text color="gray.600" fontSize="sm" fontStyle="italic">
            Checking passport status...
          </Text>
        </Flex>
      );
    }
    
    if (passportStatus) {
      return (
        <Flex 
          align="center" 
          justify="center" 
          mt={2} 
          p={2} 
          borderRadius="md" 
          bg={passportStatus.hasPassport ? "rgba(102, 187, 106, 0.1)" : "rgba(229, 115, 115, 0.1)"}
        >
          <Icon 
            as={FaPassport} 
            color={passportStatus.hasPassport ? "#66bb6a" : "#e57373"} 
            mr={2} 
          />
          <Text 
            color={passportStatus.hasPassport ? "#2e7d32" : "#c62828"} 
            fontSize="sm" 
            fontWeight="medium"
          >
            {passportStatus.hasPassport 
              ? "Planty verified! Time to plant trees with Kitty! " 
              : "Katty required! Connect with kats to get one."}
          </Text>
        </Flex>
      );
    }
    
    return null;
  };

  return (
    <VStack 
      w="full" 
      mt={8} 
      spacing={6}
      bg="rgba(255, 255, 255, 0.7)"
      borderRadius="lg"
      backdropFilter="blur(4px)"
      boxShadow="md"
      border="2px dashed"
      borderColor="green.200"
      p={8}
      position="relative"
      _before={{
        content: '""',
        position: "absolute",
        top: "-12px",
        left: "20px",
        transform: "rotate(-3deg)",
        width: "60px",
        height: "12px",
        bg: "#AED581",
        borderRadius: "6px",
        boxShadow: "0 0 0 1px rgba(0,0,0,0.05)",
        zIndex: -1
      }}
      _after={{
        content: '""',
        position: "absolute",
        bottom: "-5px",
        right: "30px",
        width: "100px",
        height: "10px",
        bg: "linear-gradient(90deg, transparent, #AED581, transparent)",
        opacity: 0.6
      }}
    >
      <Text
        fontFamily="'Caveat', cursive"
        fontSize={{ base: "2xl", md: "3xl" }}
        color="#2E7D32"
        textAlign="center"
        fontWeight="bold"
      >
        {showCamera ? "Take a Photo of Your Planting" : "Upload Your Planting Photo!"}
      </Text>

      {/* Passport Status Indicator */}
      {renderPassportStatus()}

      {showCamera ? (
        <Box 
          w="full" 
          display="flex" 
          flexDirection="column" 
          alignItems="center"
          position="relative"
        >
          <Box 
            width="100%" 
            maxWidth="500px" 
            borderRadius="md" 
            overflow="hidden" 
            boxShadow="md"
            border="4px solid white"
            transform="rotate(-1deg)"
          >
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              onUserMediaError={handleUserMediaError}
              onUserMedia={handleUserMedia}
              style={{ width: '100%', height: '100%', borderRadius: 'md' }}
            />
          </Box>
          
          <Flex mt={4} gap={4}>
            <Button
              onClick={() => setShowCamera(false)}
              variant="outline"
              colorScheme="red"
              borderRadius="lg"
              px={6}
              py={4}
              fontFamily="'Caveat', cursive"
              fontSize="lg"
              fontWeight="600"
            >
              Cancel
            </Button>
            
            <Button
              onClick={capturePhoto}
              variant="sketchyLeaf"
              borderRadius="lg"
              px={6}
              py={4}
              fontFamily="'Caveat', cursive"
              fontSize="lg"
              fontWeight="600"
              leftIcon={<Icon as={FaCameraRetro} />}
              isDisabled={!isCameraReady}
            >
              Take Photo
            </Button>
          </Flex>
        </Box>
      ) : (
        <>
          <Box w="full" display="flex" justifyContent="center" gap={4} flexWrap="wrap">
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleInputChange}
            />
            <Button
              onClick={handleButtonClick}
              borderRadius="lg"
              px={8}
              py={7}
              variant="sketchyLeaf"
              leftIcon={<Icon as={FaCameraRetro} mr={2} />}
              fontFamily="'Caveat', cursive"
              fontSize={{ base: "xl", md: "2xl" }}
              fontWeight="600"
              isDisabled={!account || !passportStatus?.hasPassport}
            >
              Use Camera
            </Button>
            
            <Button
              onClick={handleFileButtonClick}
              borderRadius="lg"
              px={8}
              py={7}
              variant="sketchyLeaf"
              fontFamily="'Caveat', cursive"
              fontSize={{ base: "xl", md: "2xl" }}
              fontWeight="600"
              isDisabled={!account || !passportStatus?.hasPassport}
            >
              Upload Photo
            </Button>
          </Box>
          
          <Text
            fontFamily="'Caveat', cursive"
            fontSize="md"
            color="green.800"
            textAlign="center"
            mt={2}
          >
            Take a photo of your tree planting to earn rewards!
          </Text>
          
          <Flex mt={4} justifyContent="center">
            <FaCat size={30} color="#388E3C" style={{ opacity: 0.7 }} />
          </Flex>
        </>
      )}
    </VStack>
  );
};
