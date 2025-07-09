import { useEffect, useState } from "react";
import { Box, Text, VStack, Heading, Flex, Button, HStack, Badge } from "@chakra-ui/react";
import { useWallet } from "@vechain/dapp-kit-react";
import { SubmissionHistoryItem } from "../networking/type";
import { getSubmissionHistory } from "../networking/getSubmissionHistory";
import { BsChevronRight } from "react-icons/bs";
import { format } from "date-fns";
import { ImageViewer } from "./ImageViewer";
import { navEvents } from "./BottomNavBar";

interface SubmissionHistoryProps {
  maxItems?: number;
  showViewMore?: boolean;
  onViewMore?: () => void;
}

export const SubmissionHistory = ({
  maxItems = 4,
  showViewMore = true,
  onViewMore
}: SubmissionHistoryProps) => {
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
    
    return () => {
      // Cleanup
    };
  }, [account]);

  // Format date nicely
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "d/M/yyyy");
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

  const displayHistory = history.slice(0, maxItems);
  const hasMoreItems = history.length > maxItems;

  if (loading) {
    return (
      <Box w="full" p={4} textAlign="center">
        <Text fontFamily="'Caveat', cursive" fontSize="md" color="gray.600">Loading your planting history...</Text>
      </Box>
    );
  }

  if (!account) {
    return null;
  }

  if (history.length === 0) {
    return (
      <Box 
        w="full" 
        p={4} 
        textAlign="center" 
        mt={2}
        bg="rgba(255, 255, 255, 0.7)"
        borderRadius="lg"
        backdropFilter="blur(4px)"
        boxShadow="md"
        border="2px dashed"
        borderColor="green.200"
      >
        <Text fontFamily="'Caveat', cursive" fontSize="lg" color="green.600">
          No planting history yet. Submit your first tree planting photo!
        </Text>
      </Box>
    );
  }

  const handleViewMore = () => {
    if (onViewMore) {
      onViewMore();
    } else {
      navEvents.emit("navigateToFullHistory");
    }
  };

  return (
    <Box 
      w="full" 
      px={2} 
      py={4} 
      mt={4}
      bg="rgba(255, 255, 255, 0.7)"
      borderRadius="lg"
      backdropFilter="blur(4px)"
      boxShadow="md"
      border="2px dashed"
      borderColor="green.200"
      position="relative"
      _before={{
        content: '""',
        position: "absolute",
        top: "-8px",
        left: "20px",
        width: "40px",
        height: "10px",
        bg: "#AED581",
        borderRadius: "5px",
        transform: "rotate(-3deg)",
        boxShadow: "0 0 0 1px rgba(0,0,0,0.05)",
        zIndex: -1
      }}
      _after={{
        content: '""',
        position: "absolute",
        bottom: "-5px",
        right: "20px",
        width: "70px",
        height: "5px",
        background: "linear-gradient(90deg, transparent, #AED581, transparent)",
        opacity: 0.6
      }}
    >
      <Heading 
        size="md" 
        mb={3} 
        fontFamily="'Caveat', cursive" 
        textAlign="center"
        color="#2E7D32"
      >
        Your Planting History
      </Heading>
      
      <VStack spacing={4} align="stretch">
        {displayHistory.map((item) => (
          <Flex
            key={item.id}
            bg="white"
            borderRadius="md"
            overflow="hidden"
            boxShadow="sm"
            borderWidth="1px"
            borderColor="#e0d6c2"
            transform="rotate(-0.5deg)"
            transition="all 0.2s"
            _hover={{
              transform: "rotate(0deg) translateY(-2px)",
              boxShadow: "md"
            }}
          >
            <Box 
              width="90px"
              height="90px"
              overflow="hidden"
              borderTopLeftRadius="md"
              borderBottomLeftRadius="md"
              border="4px solid white"
            >
              <ImageViewer
                imageUrl={item.image_url}
                alt="Juice"
                boxSize="100%"
                objectFit="cover"
              />
            </Box>
            
            <Flex 
              flex="1" 
              p={3} 
              flexDirection="column" 
              justifyContent="center"
              bg="#fff"
              position="relative"
              _after={{
                content: '""',
                position: "absolute",
                top: "8px",
                right: "8px",
                width: "10px",
                height: "10px",
                bg: item.validity_factor > 0.5 ? "#81c784" : "#e57373",
                borderRadius: "full",
                opacity: 0.7
              }}
            >
              <HStack justifyContent="space-between" alignItems="flex-start">
                <Text 
                  fontSize="md" 
                  fontWeight="600" 
                  color="#5d4037"
                  fontFamily="'Caveat', cursive"
                >
                  {formatDate(item.timestamp)}
                </Text>
                
                <Badge 
                  colorScheme={item.validity_factor > 0.5 ? "green" : "red"}
                  fontSize="xs"
                  borderRadius="full"
                  px={2}
                  variant="subtle"
                  fontFamily="'Caveat', cursive"
                  transform="rotate(2deg)"
                >
                  {item.validity_factor > 0.5 ? "Approved" : "Rejected!"}
                </Badge>
              </HStack>
              
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
        
        {showViewMore && hasMoreItems && (
          <Button 
            variant="secondary" 
            size="sm" 
            rightIcon={<BsChevronRight />}
            alignSelf="center"
            fontFamily="'Caveat', cursive"
            fontSize="md"
            mt={1}
            onClick={handleViewMore}
          >
            See more planting history
          </Button>
        )}
      </VStack>
    </Box>
  );
}; 