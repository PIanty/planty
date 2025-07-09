import {
  Modal,
  ModalContent,
  ModalOverlay,
  VStack,
  Text,
  HStack,
  Image,
  Box,
  Progress,
  keyframes,
  Button,
  Flex,
  Icon,
  Circle,
  Fade,
} from "@chakra-ui/react";
import { useDisclosure, useSubmission } from "../hooks";
import { FaCat, FaTree, FaSeedling, FaLeaf } from "react-icons/fa";
import { RiPencilLine, RiCloseLine } from "react-icons/ri";
import { BsCheck } from "react-icons/bs";
import { useMemo, useState, useEffect } from "react";

// Simple animation for leaf
const simpleGrowAnimation = keyframes`
  0% { transform: scale(0.9); }
  100% { transform: scale(1); }
`;

// Simple pulse animation
const pulseAnimation = keyframes`
  0% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 0.7; }
`;

// Fade in animation
const fadeInAnimation = keyframes`
  0% { opacity: 0; transform: translateY(5px); }
  100% { opacity: 1; transform: translateY(0); }
`;

// Leaf SVG component
const Leaf = ({ size = 30, color = "#4CAF50", style = {} }) => (
  <Box style={style}>
    <Icon as={FaLeaf} boxSize={size} color={color} />
  </Box>
);

// Create a LeafStatic component that doesn't animate for decorations
const LeafStatic = ({ size = 30, color = "#4CAF50", style = {}, rotation = 0 }) => (
  <Box 
    style={{
      ...style,
      transform: `rotate(${rotation}deg)`
    }}
  >
    <Icon as={FaLeaf} boxSize={size} color={color} />
  </Box>
);

// Success messages with planting trees and cat themes
const successMessages = [
  "Purr-fect! 😸 This kitty approves your tree planting efforts!",
  "Meow-velous! 🐱 Your eco-friendly planting makes this cat purr with joy!",
  "Paw-some tree! 😻 This cat is impressed by your green thumb!",
  "Meow! 🐱 This cat thinks your planting deserves extra treats!",
  "Feline good about your green efforts! 😸 This kitty approves!",
  "Purr-fectly green choice! 😻 This cat is impressed by your tree planting!",
  "Meow-gical! 🐱 Your environmental efforts make this kitty very happy!",
  "Paw-sitively delightful planting! 😸 This cat is giving you a high-five!",
  "Cat-tastic! 😻 Your tree planting is making a difference!",
  "Meow-nificent! 🐱 This kitty loves your green initiatives!"
];

// Error messages with planting and cat themes
const errorMessages = [
  "Meow? 🙀 This kitty can't find any planting here!",
  "Purr-plexing! 😿 This cat needs to see actual tree planting!",
  "Hiss! 🙀 This doesn't look like planting to this picky cat!",
  "Meow-ch! 😾 This cat was expecting to see trees or plants!",
  "Fur-get it! 🙀 This kitty can't approve without seeing proper planting!",
  "Cat-astrophe! 😿 Where's the greenery? This kitty is confused!",
  "Paw-sitively not planting! 🙀 This cat needs to see your environmental efforts!",
  "Meow-stake! 😾 This doesn't look like tree planting to this cat!",
  "Hiss-appointment! 🙀 This cat was hoping to see some green efforts!"
];

export const SubmissionModal = () => {
  const { isLoading, response } = useSubmission();
  const { isOpen, onClose } = useDisclosure();
  const [canClose, setCanClose] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  // Verification steps for loading screen
  const verificationSteps = [
    "Checking image clarity",
    "Verifying tree planting",
    "Confirming water presence",
    "Validating authenticity"
  ];

  // Simulate verification steps progression
  useEffect(() => {
    if (isLoading && currentStep < verificationSteps.length) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => (prev < verificationSteps.length - 1) ? prev + 1 : prev);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isLoading, currentStep, verificationSteps.length]);

  // Update canClose when loading is complete
  useMemo(() => {
    if (!isLoading && response) {
      // Only allow closing when loading is complete and we have a response
      setCanClose(true);
      // Reset step counter for next time
      setCurrentStep(0);
    } else {
      setCanClose(false);
    }
  }, [isLoading, response]);

  // Get a random success message
  const getRandomSuccessMessage = () => {
    const randomIndex = Math.floor(Math.random() * successMessages.length);
    return successMessages[randomIndex];
  };

  // Get a random error message
  const getRandomErrorMessage = () => {
    const randomIndex = Math.floor(Math.random() * errorMessages.length);
    return errorMessages[randomIndex];
  };

  const renderContent = useMemo(() => {
    // Handle case when response is null or undefined
    if (!response) return null;

    // Periksa apakah ada error duplikat image
    if (response.error && response.errorType === 'duplicate_image') {
      // Tampilkan pesan error duplikat dengan tema kucing
      return (
        <VStack
          minH={{ base: "300px", md: "350px" }}
          w="full"
          borderRadius="lg"
          p={{ base: 4, md: 5 }}
          bg="rgba(255, 255, 255, 0.85)"
          backdropFilter="blur(10px)"
          border="1px solid #e0e0e0"
          overflow="hidden"
          justifyContent="center"
          alignItems="center"
          position="relative"
        >
          {/* Notebook paper lines */}
          <Box 
            position="absolute" 
            top={0} 
            bottom={0} 
            left="20px" 
            width="1px" 
            bg="orange.100"
            zIndex={0}
          />
          {/* Horizontal lines */}
          {[...Array(8)].map((_, i) => (
            <Box 
              key={`line-${i}`} 
              position="absolute" 
              top={`${80 + i * 40}px`} 
              left={0} 
              right={0} 
              height="1px" 
              bg="orange.50"
              zIndex={0}
            />
          ))}
          
          {/* Content */}
          <Box 
            position="relative"
            zIndex={1}
            transform="rotate(1deg)"
          >
            <VStack spacing={5}>
              <Box
                position="relative"
                bg="orange.50"
                p={4}
                borderRadius="md"
                border="1px dashed #f4a261"
                boxShadow="0 4px 6px rgba(0,0,0,0.05)"
                transform="rotate(-1deg)"
              >
                <FaCat 
                  size={60} 
                  color="#f4a261" 
                  style={{
                    filter: "drop-shadow(1px 1px 1px rgba(0,0,0,0.2))"
                  }}
                />
                
                {/* Cat paw prints */}
                <Box position="absolute" top="-10px" right="-15px">
                  <LeafStatic size={22} color="#f4a261" rotation={45} />
                </Box>
              </Box>
              
              <VStack spacing={2}>
                <Text
                  fontSize={{ base: "xl", md: "2xl" }}
                  fontWeight={600}
                  fontFamily="'Caveat', cursive"
                  color="#e76f51"
                  textAlign="center"
                >
                  Meow-nope! Déjà vu!
                </Text>
                
                <Text 
                  fontSize={{ base: "lg", md: "xl" }}
                  fontWeight={500} 
                  textAlign={"center"} 
                  px={4}
                  fontFamily="'Caveat', cursive"
                  color="#444"
                >
                  {response.catMessage || "This kitty has seen this image before! Please submit a different one."}
                </Text>
                
                <Text 
                  fontSize={{ base: "md", md: "lg" }} 
                  fontWeight={400} 
                  textAlign={"center"} 
                  px={2} 
                  color="gray.600"
                  fontFamily="'Caveat', cursive"
                  mt={2}
                >
                  Try uploading a different planting photo! 🌱
                </Text>
              </VStack>
            </VStack>
          </Box>
          
          {/* Cat paw corner decoration */}
          <Box position="absolute" bottom="20px" right="20px" transform="rotate(-15deg)">
            <LeafStatic size={20} color="rgba(231, 111, 81, 0.5)" rotation={30} />
          </Box>
          
          {/* Decorative elements */}
          <Box
            position="absolute"
            top={0}
            right={0}
            p={3}
            opacity={0.7}
          >
            <RiPencilLine size={24} color="#aaa" />
          </Box>
        </VStack>
      );
    }

    // Original logic for success/error
    const validation = response.validation || { validityFactor: 0, descriptionOfAnalysis: "" };
    const isValid = validation.validityFactor === 1;
    const catMessage = response.catMessage || 
      (isValid ? getRandomSuccessMessage() : getRandomErrorMessage());

    // Common style for both success and error modals
    const containerProps = {
      minH: { base: "300px", md: "350px" },
      w: "full",
      borderRadius: "lg",
      p: { base: 4, md: 5 },
      bg: "rgba(255, 255, 255, 0.85)",
      backdropFilter: "blur(10px)",
      border: "1px solid #e0e0e0",
      overflow: "hidden",
      justifyContent: "center",
      alignItems: "center",
      position: "relative" as const,
    };

    // Success modal
    if (isValid) {
      return (
        <VStack {...containerProps}>
          {/* Notebook paper lines */}
          <Box 
            position="absolute" 
            top={0} 
            bottom={0} 
            left="20px" 
            width="1px" 
            bg="blue.100"
            zIndex={0}
          />
          {/* Horizontal lines */}
          {[...Array(8)].map((_, i) => (
            <Box 
              key={`line-${i}`} 
              position="absolute" 
              top={`${80 + i * 40}px`} 
              left={0} 
              right={0} 
              height="1px" 
              bg="blue.50"
              zIndex={0}
            />
          ))}
          
          {/* Content */}
          <Box 
            position="relative"
            zIndex={1}
            transform="rotate(-1deg)"
          >
            <VStack spacing={5}>
              <Box
                position="relative"
                bg="green.50"
                p={4}
                borderRadius="md"
                border="1px dashed #83c5be"
                boxShadow="0 4px 6px rgba(0,0,0,0.05)"
                transform="rotate(1deg)"
              >
                <FaCat size={60} color="#2a9d8f" style={{filter: "drop-shadow(1px 1px 1px rgba(0,0,0,0.2))"}}/>
                
                {/* Cat paw prints */}
                <Box position="absolute" top="-15px" left="-20px">
                  <LeafStatic size={25} color="#2a9d8f" rotation={15} />
                </Box>
                <Box position="absolute" bottom="-10px" right="-15px">
                  <LeafStatic size={20} color="#2a9d8f" rotation={-45} />
                </Box>
              </Box>
              
              <VStack spacing={2}>
                <Text
                  fontSize={{ base: "xl", md: "2xl" }}
                  fontWeight={600}
                  fontFamily="'Caveat', cursive"
                  color="#2a9d8f"
                  textAlign="center"
                >
                  Meow! Success!
                </Text>
                
                <Text 
                  fontSize={{ base: "lg", md: "xl" }}
                  fontWeight={500} 
                  textAlign="center" 
                  px={4}
                  fontFamily="'Caveat', cursive"
                  color="#444"
                >
                  {catMessage}
                </Text>
                
                <HStack mt={3} spacing={2} alignItems="center">
                  <Text
                    fontSize={{ base: "xl", md: "2xl" }}
                    fontWeight={600}
                    fontFamily="'Caveat', cursive"
                    color="#2a9d8f"
                    textShadow="0px 1px 1px rgba(0,0,0,0.1)"
                  >
                    You've earned 3
                  </Text>
                  <Image src="b3tr-token.svg" h={{ base: 6, md: 8 }} />
                </HStack>
              </VStack>
            </VStack>
          </Box>
          
          {/* Cat paw corner decorations */}
          <Box position="absolute" bottom="15px" left="15px" transform="rotate(30deg)">
            <LeafStatic size={22} color="rgba(42, 157, 143, 0.5)" rotation={30} />
          </Box>
          <Box position="absolute" top="15px" right="15px" transform="rotate(-15deg)">
            <LeafStatic size={18} color="rgba(42, 157, 143, 0.5)" rotation={-15} />
          </Box>
          
          {/* Decorative elements */}
          <Box
            position="absolute"
            top={0}
            right={0}
            p={3}
            opacity={0.7}
          >
            <RiPencilLine size={24} color="#aaa" />
          </Box>
        </VStack>
      );
    } 
    
    // Error modal
    return (
      <VStack {...containerProps}>
        {/* Notebook paper lines */}
        <Box 
          position="absolute" 
          top={0} 
          bottom={0} 
          left="20px" 
          width="1px" 
          bg="red.100"
          zIndex={0}
        />
        {/* Horizontal lines */}
        {[...Array(8)].map((_, i) => (
          <Box 
            key={`line-${i}`} 
            position="absolute" 
            top={`${80 + i * 40}px`} 
            left={0} 
            right={0} 
            height="1px" 
            bg="red.50"
            zIndex={0}
          />
        ))}
        
        {/* Content */}
        <Box 
          position="relative"
          zIndex={1}
          transform="rotate(1deg)"
        >
          <VStack spacing={5}>
            <Box
              position="relative"
              bg="red.50"
              p={4}
              borderRadius="md"
              border="1px dashed #e5989b"
              boxShadow="0 4px 6px rgba(0,0,0,0.05)"
              transform="rotate(-1deg)"
            >
              <FaCat 
                size={60} 
                color="#e63946" 
                style={{
                  filter: "drop-shadow(1px 1px 1px rgba(0,0,0,0.2))"
                }}
              />
              
              {/* Cat paw prints */}
              <Box position="absolute" top="-10px" right="-15px">
                <LeafStatic size={22} color="#e63946" rotation={45} />
              </Box>
            </Box>
            
            <VStack spacing={2}>
              <Text
                fontSize={{ base: "xl", md: "2xl" }}
                fontWeight={600}
                fontFamily="'Caveat', cursive"
                color="#e63946"
                textAlign="center"
              >
                Meow? Something's wrong!
              </Text>
              
              <Text 
                fontSize={{ base: "lg", md: "xl" }}
                fontWeight={500} 
                textAlign={"center"} 
                px={4}
                fontFamily="'Caveat', cursive"
                color="#444"
              >
                {catMessage}
              </Text>
              
              <Text 
                fontSize={{ base: "md", md: "lg" }} 
                fontWeight={400} 
                textAlign={"center"} 
                px={2} 
                color="gray.600"
                fontFamily="'Caveat', cursive"
              >
                {validation.descriptionOfAnalysis}
              </Text>
            </VStack>
          </VStack>
        </Box>
        
        {/* Cat paw corner decoration */}
        <Box position="absolute" bottom="20px" right="20px" transform="rotate(-15deg)">
          <LeafStatic size={20} color="rgba(230, 57, 70, 0.5)" rotation={-15} />
        </Box>
        
        {/* Decorative elements */}
        <Box
          position="absolute"
          top={0}
          right={0}
          p={3}
          opacity={0.7}
        >
          <RiPencilLine size={24} color="#aaa" />
        </Box>
      </VStack>
    );
  }, [response]);

  // Handle close attempts - only allow closing when not loading
  const handleClose = () => {
    if (!isLoading && canClose) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      trapFocus={true}
      isCentered={true}
      closeOnOverlayClick={!isLoading && canClose}
      closeOnEsc={!isLoading && canClose}
      size={{ base: "sm", md: "md" }}
      motionPreset="slideInBottom"
    >
      <ModalOverlay backdropFilter="blur(2px)" bg="rgba(0,0,0,0.3)" />
      <ModalContent 
        borderRadius="lg" 
        overflow="hidden" 
        boxShadow="lg"
        bg="transparent"
        maxW={{ base: "90%", md: "450px" }}
        mx={{ base: 4, md: "auto" }}
        my="auto"
      >
        {isLoading ? (
          <VStack
            p={6}
            justifyContent="center"
            alignItems="center"
            minH="280px"
            bg="rgba(255, 255, 255, 0.85)"
            backdropFilter="blur(10px)"
            border="1px solid #e0e0e0"
            borderRadius="lg"
            position="relative"
            overflow="hidden"
            mx={6}
          >
            {/* Notebook paper lines */}
            <Box 
              position="absolute" 
              top={0} 
              bottom={0} 
              left="20px" 
              width="1px" 
              bg="green.100" 
            />
            {/* Horizontal lines */}
            {[...Array(6)].map((_, i) => (
              <Box 
                key={`line-${i}`} 
                position="absolute" 
                top={`${80 + i * 40}px`} 
                left={0} 
                right={0} 
                height="1px" 
                bg="green.50" 
              />
            ))}
            
            {/* Loading content with single verification step */}
            <Box position="relative" width="100%" px={4} zIndex={1}>
              <VStack spacing={5}>
                <Text
                  fontFamily="'Caveat', cursive"
                  fontSize={{ base: "xl", md: "2xl" }}
                  textAlign="center"
                  mb={2}
                  color="#2E7D32"
                >
                  Verifying your planting...
                </Text>
                
                {/* Tree icon */}
                <Box
                  position="relative"
                  animation={`${simpleGrowAnimation} 1.5s infinite alternate`}
                  mb={4}
                >
                  <Icon as={FaTree} boxSize={8} color="#2a9d8f" />
                </Box>
                
                {/* Single verification step with animation */}
                <Box 
                  height="60px" 
                  width="100%" 
                  display="flex" 
                  flexDirection="column"
                  alignItems="center" 
                  justifyContent="center"
                >
                  <Flex
                    key={`step-${currentStep}`}
                    width="100%"
                    alignItems="center"
                    justifyContent="center"
                    animation={`${fadeInAnimation} 0.5s ease-in-out`}
                  >
                    <Circle 
                      size="24px" 
                      bg="green.100"
                      border="1px solid"
                      borderColor="green.500"
                      animation={`${pulseAnimation} 1.5s infinite`}
                      mr={3}
                    />
                    <Text
                      fontFamily="'Caveat', cursive"
                      fontSize={{ base: "lg", md: "xl" }}
                      color="#2E7D32"
                      fontWeight="bold"
                      sx={{
                        animation: `${fadeInAnimation} 0.5s ease-in-out`,
                        animationDelay: "0.1s",
                        animationFillMode: "both"
                      }}
                    >
                      {verificationSteps[currentStep]}
                    </Text>
                  </Flex>
                  
                  {/* Small dots to indicate progress */}
                  <Flex mt={3} justifyContent="center">
                    {verificationSteps.map((_, index) => (
                      <Box
                        key={`dot-${index}`}
                        w="8px"
                        h="8px"
                        borderRadius="full"
                        bg={index === currentStep ? "green.500" : "green.200"}
                        mx={1}
                        transition="all 0.2s ease"
                      />
                    ))}
                  </Flex>
                </Box>
                
                <Text
                  fontFamily="'Caveat', cursive"
                  fontSize={{ base: "md", md: "lg" }}
                  textAlign="center"
                  mt={2}
                  color="#558B2F"
                >
                  Katty is inspecting your photo...
                </Text>
              </VStack>
            </Box>
          </VStack>
        ) : (
          <>
            {renderContent}
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
