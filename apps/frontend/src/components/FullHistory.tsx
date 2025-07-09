import { useEffect, useState } from "react";
import { 
  Box, 
  Container, 
  Text, 
  Heading, 
  Flex, 
  HStack, 
  Badge, 
  Button, 
  SimpleGrid,
  Icon
} from "@chakra-ui/react";
import { useWallet } from "@vechain/dapp-kit-react";
import { SubmissionHistoryItem } from "../networking/type";
import { getSubmissionHistory } from "../networking/getSubmissionHistory";
import { BsArrowLeft, BsCalendarCheck } from "react-icons/bs";
import { FaCat, FaRegStickyNote } from "react-icons/fa";
import { format } from "date-fns";
import { ImageViewer } from "./ImageViewer";
import { navEvents } from "./BottomNavBar";

export const FullHistory = ({ onBack }: { onBack: () => void }) => {
  const { account } = useWallet();
  const [history, setHistory] = useState<SubmissionHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!account) return;
      
      setLoading(true);
      try {
        const response = await getSubmissionHistory(account);
        setHistory(response.history);
      } catch (error) {
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [account]);

  // Format date nicely
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "d MMMM yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  // Format time nicely
  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "h:mm a");
    } catch (error) {
      return "";
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navEvents.emit("navigateToHistory");
    }
  };

  if (loading) {
    return (
      <Container 
        maxW="container.md" 
        p={4} 
        mt={6}
        bg="rgba(255, 255, 255, 0.7)"
        borderRadius="lg"
        backdropFilter="blur(4px)"
        boxShadow="md"
        border="1px dashed #8BC34A"
      >
        <Button 
          leftIcon={<BsArrowLeft />} 
          onClick={handleBack}
          mb={6} 
          variant="outline" 
          color="#388E3C"
          borderColor="#388E3C"
          fontFamily="'Caveat', cursive"
          _hover={{
            bg: "rgba(255,255,255,0.9)",
            transform: "translateY(-2px)"
          }}
        >
          Back to History
        </Button>
        
        <Flex direction="column" alignItems="center" justifyContent="center" h="50vh">
          <FaCat size={40} color="#4CAF50" />
          <Text mt={4} fontFamily="'Caveat', cursive" fontSize="xl" color="#388E3C">
            Loading your planting history...
          </Text>
        </Flex>
      </Container>
    );
  }

  if (!account) {
    return (
      <Container 
        maxW="container.md" 
        p={4} 
        mt={6}
        bg="rgba(255, 255, 255, 0.7)"
        borderRadius="lg"
        backdropFilter="blur(4px)"
        boxShadow="md"
        border="1px dashed #8BC34A"
      >
        <Button 
          leftIcon={<BsArrowLeft />} 
          onClick={handleBack} 
          mb={6} 
          variant="outline" 
          color="#388E3C"
          borderColor="#388E3C"
          fontFamily="'Caveat', cursive"
          _hover={{
            bg: "rgba(255,255,255,0.9)",
            transform: "translateY(-2px)"
          }}
        >
          Back to History
        </Button>
        
        <Flex direction="column" alignItems="center" justifyContent="center" h="50vh">
          <Text fontFamily="'Caveat', cursive" fontSize="xl" color="#388E3C">
            Please connect your wallet to see your planting history.
          </Text>
        </Flex>
      </Container>
    );
  }

  if (history.length === 0) {
    return (
      <Container 
        maxW="container.md" 
        p={4} 
        mt={6}
        bg="rgba(255, 255, 255, 0.7)"
        borderRadius="lg"
        backdropFilter="blur(4px)"
        boxShadow="md"
        border="1px dashed #8BC34A"
      >
        <Button 
          leftIcon={<BsArrowLeft />} 
          onClick={handleBack}
          mb={6} 
          variant="outline" 
          color="#388E3C"
          borderColor="#388E3C"
          fontFamily="'Caveat', cursive"
          _hover={{
            bg: "rgba(255,255,255,0.9)",
            transform: "translateY(-2px)"
          }}
        >
          Back to History
        </Button>
        
        <Flex direction="column" alignItems="center" justifyContent="center" h="50vh">
          <FaCat size={40} color="#e63946" />
          <Text mt={4} fontFamily="'Caveat', cursive" fontSize="xl" color="#388E3C">
            No planting history yet. Submit your first tree planting photo!
          </Text>
        </Flex>
      </Container>
    );
  }

  return (
    <Container 
      maxW="container.md" 
      p={4} 
      mt={6}
      bg="rgba(255, 255, 255, 0.8)"
      borderRadius="lg"
      backdropFilter="blur(4px)"
      boxShadow="md"
      border="2px dashed"
      borderColor="green.200"
      position="relative"
      _before={{
        content: '""',
        position: "absolute",
        top: "-12px",
        left: "30px",
        width: "60px",
        height: "14px",
        bg: "#AED581",
        borderRadius: "7px",
        transform: "rotate(-3deg)",
        boxShadow: "0 0 0 1px rgba(0,0,0,0.05)",
        zIndex: -1
      }}
      _after={{
        content: '""',
        position: "absolute",
        top: "50%",
        right: "-5px",
        width: "10px",
        height: "80px",
        bg: "#AED581",
        borderRadius: "5px",
        transform: "translateY(-50%) rotate(3deg)",
        opacity: 0.4,
        zIndex: -1
      }}
    >
      <Button 
        leftIcon={<BsArrowLeft />} 
        onClick={handleBack}
        mb={6} 
        variant="secondary" 
        fontFamily="'Caveat', cursive"
      >
        Back to History
      </Button>
      
      <Flex align="center" justify="center" mb={6}>
        <Icon as={FaRegStickyNote} color="#388E3C" mr={2} />
        <Heading 
          size="lg" 
          fontFamily="'Caveat', cursive" 
          textAlign="center"
          color="#388E3C"
        >
          Your Complete Planting History
        </Heading>
      </Flex>
      
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={8}>
        {history.map((item, index) => (
          <Flex
            key={item.id}
            bg="white"
            borderRadius="md"
            overflow="hidden"
            boxShadow="sm"
            borderWidth="1px"
            borderColor="#e0d6c2"
            direction="column"
            h="100%"
            transform={`rotate(${index % 2 === 0 ? '-1deg' : '1deg'})`}
            transition="all 0.2s"
            _hover={{
              transform: "rotate(0deg) translateY(-3px)",
              boxShadow: "md"
            }}
          >
            <Box
              width="100%"
              height="180px"
              borderTopLeftRadius="md"
              borderTopRightRadius="md"
              overflow="hidden"
              borderBottom="4px solid white"
            >
              <ImageViewer 
                imageUrl={item.image_url}
                alt="Juice"
                boxSize="100%"
                objectFit="cover"
                borderRadius="0"
              />
            </Box>
            
            <Flex 
              p={4} 
              direction="column" 
              flex="1"
              bgGradient="linear(to-b, white, #f9f7f1)"
              position="relative"
              _after={{
                content: '""',
                position: "absolute",
                top: "12px",
                right: "12px",
                width: "12px",
                height: "12px",
                bg: item.validity_factor > 0.5 ? "#81c784" : "#e57373",
                borderRadius: "full",
                opacity: 0.7
              }}
            >
              <Flex justify="space-between" alignItems="flex-start" mb={2}>
                <HStack>
                  <Icon as={BsCalendarCheck} color="#5d4037" />
                  <Text 
                    fontSize="md" 
                    fontWeight="600" 
                    color="#5d4037"
                    fontFamily="'Caveat', cursive"
                  >
                    {formatDate(item.timestamp)}
                  </Text>
                </HStack>
                
                <Badge 
                  colorScheme={item.validity_factor > 0.5 ? "green" : "red"}
                  borderRadius="full"
                  px={2}
                  py={0.5}
                  fontSize="xs"
                  fontFamily="'Caveat', cursive"
                  transform="rotate(2deg)"
                >
                  {item.validity_factor > 0.5 ? "Approved" : "Wtf bro?!"}
                </Badge>
              </Flex>
              
              <Text 
                fontSize="sm" 
                color="gray.500"
                fontFamily="'Caveat', cursive"
              >
                {formatTime(item.timestamp)}
              </Text>
            </Flex>
          </Flex>
        ))}
      </SimpleGrid>
    </Container>
  );
}; 