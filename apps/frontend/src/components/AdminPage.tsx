import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Text,
  VStack,
  Icon,
  Badge,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Switch,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useBreakpointValue,
  IconButton,
  Tooltip,
  Spinner,
  Skeleton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import { useWallet } from "@vechain/dapp-kit-react";
import { 
  FaDownload,
  FaSync,
  FaMagic,
  FaCrown,
  FaGift,
  FaRocket,
  FaInfoCircle,
  FaIdCard,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle
} from "react-icons/fa";
import axios from "axios";
import { backendURL } from "../config";

// Admin address that is authorized to access this page
const ADMIN_ADDRESS = "0x43b9a364a593316facceb21bc905e2d877f5bc7c";

interface ContractStats {
  currentCycle: number;
  nextCycleBlock: number;
  maxSubmissions: number;
  totalSubmissions: number;
  rewardsLeft: string;
  passportRequired: boolean;
  totalPassports: number;
}

interface PopupNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  status: 'success' | 'error' | 'warning' | 'info';
}

// Custom popup notification component to replace toast
const PopupNotification: React.FC<PopupNotificationProps> = ({
  isOpen,
  onClose,
  title,
  message,
  status
}) => {
  // Icon based on status
  const getIcon = () => {
    switch (status) {
      case 'success':
        return <Icon as={FaCheckCircle} color="green.500" boxSize="6" />;
      case 'error':
        return <Icon as={FaTimesCircle} color="red.500" boxSize="6" />;
      case 'warning':
        return <Icon as={FaExclamationTriangle} color="orange.500" boxSize="6" />;
      default:
        return <Icon as={FaInfoCircle} color="blue.500" boxSize="6" />;
    }
  };

  // Background color based on status
  const getBgColor = () => {
    switch (status) {
      case 'success':
        return 'green.50';
      case 'error':
        return 'red.50';
      case 'warning':
        return 'orange.50';
      default:
        return 'blue.50';
    }
  };

  // Border color based on status
  const getBorderColor = () => {
    switch (status) {
      case 'success':
        return 'green.200';
      case 'error':
        return 'red.200';
      case 'warning':
        return 'orange.200';
      default:
        return 'blue.200';
    }
  };

  const getEmoji = () => {
    switch (status) {
      case 'success':
        return '😸';
      case 'error':
        return '🙀';
      case 'warning':
        return '😼';
      default:
        return '😺';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent 
        borderRadius="xl"
        boxShadow="xl"
        border="2px solid"
        borderColor={getBorderColor()}
        bg={getBgColor()}
        mx={4}
        width="90%"
        maxWidth="450px"
      >
        <ModalHeader 
          display="flex" 
          alignItems="center" 
          justifyContent="center" 
          gap={3}
          borderBottomWidth="1px"
          borderColor={getBorderColor()}
          pb={3}
          px={6}
        >
          {getIcon()}
          <Text fontWeight="bold" fontSize="lg">{title}</Text>
          <Text fontSize="xl">{getEmoji()}</Text>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody py={4} px={6}>
          <Text textAlign="center">{message}</Text>
        </ModalBody>
        
        <ModalFooter px={6}>
          <Button 
            colorScheme={status === 'error' ? 'red' : 'green'} 
            onClick={onClose} 
            size="sm"
            width="full"
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// Sketch-style card component
const SketchCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Card
    bg="white"
    border="2px dashed"
    borderColor="green.300"
    borderRadius="12px"
    boxShadow="0 4px 8px rgba(0,0,0,0.1)"
    transform="rotate(-0.5deg)"
    transition="all 0.2s ease"
    _hover={{
      transform: "rotate(0deg) scale(1.02)",
    }}
    position="relative"
    overflow="visible"
    _before={{
      content: '""',
      position: "absolute",
      top: "-8px",
      left: "15px",
      width: "50px",
      height: "12px",
      bg: "#AED581",
      borderRadius: "6px",
      transform: "rotate(-2deg)",
      boxShadow: "0 0 0 1px rgba(0,0,0,0.05)",
      zIndex: -1,
    }}
    _after={{
      content: '""',
      position: "absolute",
      bottom: "-5px",
      right: "15px",
      width: "70px",
      height: "5px",
      background: "linear-gradient(90deg, transparent, #AED581, transparent)",
      opacity: 0.7,
    }}
  >
    {children}
  </Card>
);

// Compact button component
const CompactButton: React.FC<any> = ({ children, icon, ...props }) => (
  <Button
    size="sm"
    height="40px"
    borderRadius="md"
    variant="sketchyLeaf"
    transition="all 0.15s ease"
    leftIcon={icon ? <Icon as={icon} /> : undefined}
    fontWeight="bold"
    fontSize="sm"
    fontFamily="'Caveat', cursive"
    {...props}
  >
    {children}
  </Button>
);

export const AdminPage: React.FC = () => {
  const { account } = useWallet();
  
  // All hooks must be called at the top level
  const spacing = useBreakpointValue({ base: 3, md: 4 });
  const headingSize = useBreakpointValue({ base: "md", md: "lg" });
  
  const [userAddress, setUserAddress] = useState("");
  const [rewardAmount, setRewardAmount] = useState("1000");
  const [maxSubmissions, setMaxSubmissions] = useState("10");

  const [withdrawCycle, setWithdrawCycle] = useState("1");
  const [passportRequired, setPassportRequired] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState<ContractStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [currentBlock, setCurrentBlock] = useState<number | null>(null);
  
  // Notification popup state
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [notification, setNotification] = useState({
    title: "",
    message: "",
    status: "info" as 'success' | 'error' | 'warning' | 'info'
  });

  // Check if current user is admin
  useEffect(() => {
    if (account) {
      setIsAdmin(account.toLowerCase() === ADMIN_ADDRESS.toLowerCase());
      if (account.toLowerCase() === ADMIN_ADDRESS.toLowerCase()) {
        loadContractStats();
      }
    } else {
      setIsAdmin(false);
    }
  }, [account]);

  // Periodically refresh stats
  useEffect(() => {
    if (isAdmin) {
      const interval = setInterval(() => {
        loadContractStats();
      }, 30000); // Refresh every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  const loadContractStats = async () => {
    setLoadingStats(true);
    try {
      const response = await axios.get(`${backendURL}/contractStats`);
      setStats(response.data);
      setPassportRequired(response.data.passportRequired);
      setMaxSubmissions(response.data.maxSubmissions.toString());
      
      // Get current block for cycle estimation
      try {
        const blockResponse = await axios.get(`${backendURL}/currentBlock`);
        if (blockResponse.data && blockResponse.data.blockNum) {
          setCurrentBlock(blockResponse.data.blockNum);
        }
      } catch (error) {
        console.error("Failed to get current block:", error);
      }
    } catch (error) {
      console.error("Failed to load contract stats:", error);
      showNotification("Stats Failed 🙀", "Couldn't fetch contract data", "error");
    } finally {
      setLoadingStats(false);
    }
  };

  const showNotification = (title: string, message: string, status: 'success' | 'error' | 'warning' | 'info') => {
    setNotification({ title, message, status });
    onOpen();
  };

  const handleMintPassport = async () => {
    if (!account || !userAddress || !isAdmin) return;

    setIsLoading(true);
    try {
      const response = await axios.post(`${backendURL}/mintPassport`, {
        adminAddress: account,
        userAddress: userAddress,
      });

      if (response.data.success) {
        showNotification(
          "Katty Minted! 😸", 
          response.data.catMessage || "New Katty passport created!",
          "success"
        );
        setUserAddress("");
        loadContractStats();
      }
    } catch (error) {
      let errorMessage = "Failed to mint passport";
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      showNotification("Mint Failed 🙀", errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTriggerCycle = async () => {
    if (!account || !isAdmin) return;

    setIsLoading(true);
    try {
      const response = await axios.post(`${backendURL}/triggerCycle`, {
        adminAddress: account,
      });

      if (response.data.success) {
        showNotification("New Cycle! 🔄", "Fresh cycle started!", "success");
        loadContractStats();
      }
    } catch (error) {
      let errorMessage = "Failed to trigger cycle";
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      showNotification("Cycle Failed 🙀", errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetRewards = async () => {
    if (!account || !isAdmin || !rewardAmount) return;

    setIsLoading(true);
    try {
      const response = await axios.post(`${backendURL}/setRewards`, {
        adminAddress: account,
        amount: rewardAmount,
      });

      if (response.data.success) {
        showNotification(
          "Rewards Set! 💰", 
          `${rewardAmount} tokens allocated!`,
          "success"
        );
        loadContractStats();
      }
    } catch (error) {
      let errorMessage = "Failed to set rewards";
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      showNotification("Rewards Failed 🙀", errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdrawRewards = async () => {
    if (!account || !isAdmin || !withdrawCycle) return;

    setIsLoading(true);
    try {
      const response = await axios.post(`${backendURL}/withdrawRewards`, {
        adminAddress: account,
        cycle: withdrawCycle,
      });

      if (response.data.success) {
        showNotification(
          "Withdrawn! 💸", 
          `Cycle ${withdrawCycle} rewards retrieved!`,
          "success"
        );
        loadContractStats();
      }
    } catch (error) {
      let errorMessage = "Failed to withdraw";
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      showNotification("Withdrawal Failed 🙀", errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetMaxSubmissions = async () => {
    if (!account || !isAdmin || !maxSubmissions) return;

    setIsLoading(true);
    try {
      const response = await axios.post(`${backendURL}/setMaxSubmissions`, {
        adminAddress: account,
        maxSubmissions: parseInt(maxSubmissions),
      });

      if (response.data.success) {
        showNotification(
          "Limit Updated! 📊", 
          `Max ${maxSubmissions} submissions!`,
          "success"
        );
        loadContractStats();
      }
    } catch (error) {
      let errorMessage = "Failed to update limit";
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      showNotification("Update Failed 🙀", errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePassportRequirement = async () => {
    if (!account || !isAdmin) return;

    setIsLoading(true);
    try {
      const response = await axios.post(`${backendURL}/setPassportRequired`, {
        adminAddress: account,
        required: !passportRequired,
      });

      if (response.data.success) {
        const newStatus = !passportRequired;
        setPassportRequired(newStatus);
        showNotification(
          newStatus ? "Locked! 🔒" : "Unlocked! 🔓", 
          newStatus ? "Passport required!" : "Open access!",
          "success"
        );
        loadContractStats();
      }
    } catch (error) {
      let errorMessage = "Failed to toggle";
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      showNotification("Toggle Failed 🙀", errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to check total passport count directly from contract
  const handleCheckPassportCount = async () => {
    try {
      const response = await axios.get(`${backendURL}/totalPassports`);
      
      showNotification(
        "Passport Count 🎫", 
        response.data.catMessage || `Total passports: ${response.data.totalPassports}`,
        "info"
      );
    } catch (error) {
      let errorMessage = "Failed to get passport count";
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      showNotification("Counting Failed 🙀", errorMessage, "error");
    }
  };

  // Calculate blocks remaining until next cycle
  const getBlocksRemaining = () => {
    if (!stats || !currentBlock) return "Unknown";
    
    const blocksRemaining = stats.nextCycleBlock - currentBlock;
    if (blocksRemaining <= 0) return "Ready for new cycle";
    
    return `${blocksRemaining} blocks`;
  };

  // If not admin, show access denied with cat theme
  if (!isAdmin) {
    return (
      <Container maxW="container.md" py={6}>
        <VStack spacing={4} align="center" justify="center" minH="60vh">
          <Text fontSize="6xl">🙀</Text>
          <Heading size="lg" textAlign="center" color="gray.700">
            Hiss! Access Denied
          </Heading>
          <Text textAlign="center" color="gray.600" fontSize="sm" px={4}>
            Only the head kitty can access this panel! 
          </Text>
          <Badge 
            colorScheme="red" 
            p={2} 
            borderRadius="12px" 
            fontSize="xs"
            border="2px solid"
            borderColor="red.500"
          >
            <Icon as={FaCrown} mr={1} />
            {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "Not connected"}
          </Badge>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={spacing}>
      <VStack spacing={spacing} align="stretch">
        {/* Header */}
        <Box textAlign="center" py={2}>
          <Flex align="center" justify="center" gap={2} flexWrap="wrap" mb={2}>
            <Text fontSize="3xl">😸</Text>
            <Heading size={headingSize} color="gray.800">
              Planty Admin Panel
            </Heading>
            <IconButton
              aria-label="Refresh"
              icon={<FaSync />}
              size="sm"
              variant="outline"
              borderRadius="50%"
              onClick={loadContractStats}
              isLoading={loadingStats}
              border="2px solid"
              borderColor="gray.800"
            />
          </Flex>
          
          <Badge 
            colorScheme="green" 
            p={2} 
            borderRadius="12px" 
            fontSize="xs"
            border="2px solid"
            borderColor="green.500"
          >
            <Icon as={FaCrown} mr={1} />
            Head Kitty: {account?.slice(0, 6)}...{account?.slice(-4)}
          </Badge>
        </Box>

        {/* Stats Overview */}
        <SketchCard>
          <CardHeader py={3}>
            <Flex align="center" justify="center" gap={2}>
              <Text fontSize="xl">📊</Text>
              <Heading size="sm" color="gray.800">Kingdom Stats</Heading>
            </Flex>
          </CardHeader>
          <CardBody py={3}>
            <SimpleGrid columns={2} spacing={3}>
              {loadingStats ? (
                <>
                  {[1, 2, 3, 4].map(i => (
                    <Skeleton key={i} height="60px" borderRadius="8px" />
                  ))}
                </>
              ) : stats ? (
                <>
                  <Tooltip label={`Current cycle: ${stats.currentCycle}`}>
                    <Box textAlign="center" p={2} bg="blue.50" borderRadius="8px" border="1px solid" borderColor="blue.200">
                      <Flex align="center" justify="space-between" px={1}>
                        <Text fontSize="xs" color="gray.600">Cycle</Text>
                        <Icon as={FaInfoCircle} color="blue.400" fontSize="10px" />
                      </Flex>
                      <Text fontSize="lg" fontWeight="bold" color="blue.600">{stats.currentCycle}</Text>
                      <Text fontSize="9px" color="gray.500">{getBlocksRemaining()}</Text>
                    </Box>
                  </Tooltip>
                  
                  <Tooltip label={`Total submissions: ${stats.totalSubmissions} out of ${stats.maxSubmissions} max per user`}>
                    <Box textAlign="center" p={2} bg="green.50" borderRadius="8px" border="1px solid" borderColor="green.200">
                      <Flex align="center" justify="space-between" px={1}>
                        <Text fontSize="xs" color="gray.600">Submissions</Text>
                        <Icon as={FaInfoCircle} color="green.400" fontSize="10px" />
                      </Flex>
                      <Text fontSize="lg" fontWeight="bold" color="green.600">{stats.totalSubmissions}</Text>
                      <Text fontSize="9px" color="gray.500">Max: {stats.maxSubmissions}/user</Text>
                    </Box>
                  </Tooltip>
                  
                  <Tooltip label={`Rewards left: ${stats.rewardsLeft} tokens`}>
                    <Box textAlign="center" p={2} bg="purple.50" borderRadius="8px" border="1px solid" borderColor="purple.200">
                      <Flex align="center" justify="space-between" px={1}>
                        <Text fontSize="xs" color="gray.600">Rewards Left</Text>
                        <Icon as={FaInfoCircle} color="purple.400" fontSize="10px" />
                      </Flex>
                      <Text fontSize="lg" fontWeight="bold" color="purple.600">{parseFloat(stats.rewardsLeft).toFixed(1)}</Text>
                      <Text fontSize="9px" color="gray.500">Tokens available</Text>
                    </Box>
                  </Tooltip>
                  
                  <Tooltip label={`Total passports: ${stats.totalPassports} issued`}>
                    <Box textAlign="center" p={2} bg="orange.50" borderRadius="8px" border="1px solid" borderColor="orange.200">
                      <Flex align="center" justify="space-between" px={1}>
                        <Text fontSize="xs" color="gray.600">Passports</Text>
                        <Icon as={FaInfoCircle} color="orange.400" fontSize="10px" />
                      </Flex>
                      <Text fontSize="lg" fontWeight="bold" color="orange.600">{stats.totalPassports}</Text>
                      <Text fontSize="9px" color="gray.500">{stats.passportRequired ? "Required" : "Optional"}</Text>
                    </Box>
                  </Tooltip>
                </>
              ) : (
                <Box textAlign="center" gridColumn="span 2" p={4}>
                  <Text color="gray.500">Could not load contract stats</Text>
                </Box>
              )}
            </SimpleGrid>
          </CardBody>
        </SketchCard>

        {/* Admin Functions */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={spacing}>
          
          {/* Passport Management */}
          <SketchCard>
            <CardHeader py={3}>
              <Flex align="center" justify="center" gap={2}>
                <Text fontSize="xl">🎫</Text>
                <Heading size="sm" color="gray.800">Mint Katty</Heading>
              </Flex>
            </CardHeader>
            <CardBody py={3}>
              <VStack spacing={3}>
                <FormControl>
                  <FormLabel fontSize="xs" color="gray.600">User Address</FormLabel>
                  <Input
                    placeholder="0x..."
                    value={userAddress}
                    onChange={(e) => setUserAddress(e.target.value)}
                    fontSize="xs"
                    size="sm"
                    borderRadius="8px"
                    border="2px solid"
                    borderColor="gray.300"
                  />
                </FormControl>
                
                <CompactButton
                  colorScheme="teal"
                  isLoading={isLoading}
                  onClick={handleMintPassport}
                  isDisabled={!userAddress || userAddress.length < 10}
                  icon={FaMagic}
                  width="full"
                >
                  Mint Passport
                </CompactButton>
                
                <CompactButton
                  colorScheme="teal"
                  variant="outline"
                  onClick={handleCheckPassportCount}
                  icon={FaIdCard}
                  width="full"
                >
                  Check Total Passports
                </CompactButton>
              </VStack>
            </CardBody>
          </SketchCard>

          {/* Passport Requirement */}
          <SketchCard>
            <CardHeader py={3}>
              <Flex align="center" justify="center" gap={2}>
                <Text fontSize="xl">{passportRequired ? "🔒" : "🔓"}</Text>
                <Heading size="sm" color="gray.800">Access Control</Heading>
              </Flex>
            </CardHeader>
            <CardBody py={3}>
              <VStack spacing={3}>
                <Box 
                  p={3} 
                  bg={passportRequired ? "orange.50" : "blue.50"} 
                  borderRadius="8px" 
                  border="1px solid" 
                  borderColor={passportRequired ? "orange.200" : "blue.200"}
                  textAlign="center"
                >
                  <Text fontSize="xs" fontWeight="bold" color="gray.700">
                    {passportRequired ? "Passport Required" : "Open Access"}
                  </Text>
                  <Text fontSize="xs" color="gray.600">
                    {passportRequired ? "Only Katty holders" : "All kitties welcome"}
                  </Text>
                </Box>
                
                <Flex justify="space-between" align="center" width="full">
                  <Text fontSize="xs" color="gray.600">Require Passport</Text>
                  <Switch
                    isChecked={passportRequired}
                    onChange={handleTogglePassportRequirement}
                    isDisabled={isLoading}
                    colorScheme="teal"
                    size="md"
                  />
                </Flex>
              </VStack>
            </CardBody>
          </SketchCard>

          {/* Cycle Management */}
          <SketchCard>
            <CardHeader py={3}>
              <Flex align="center" justify="center" gap={2}>
                <Text fontSize="xl">🔄</Text>
                <Heading size="sm" color="gray.800">New Cycle</Heading>
              </Flex>
            </CardHeader>
            <CardBody py={3}>
              <VStack spacing={3}>
                <Text textAlign="center" fontSize="xs" color="gray.600">
                  Start fresh cycle for submissions
                </Text>
                
                {currentBlock && stats && (
                  <Box textAlign="center" fontSize="xs" mb={2}>
                    <Text color={currentBlock >= stats.nextCycleBlock ? "green.500" : "orange.500"}>
                      {currentBlock >= stats.nextCycleBlock 
                        ? "Ready for new cycle!" 
                        : `Blocks remaining: ${stats.nextCycleBlock - currentBlock}`}
                    </Text>
                  </Box>
                )}
                
                <CompactButton
                  colorScheme="blue"
                  isLoading={isLoading}
                  onClick={handleTriggerCycle}
                  icon={FaRocket}
                  width="full"
                >
                  Start New Cycle
                </CompactButton>
              </VStack>
            </CardBody>
          </SketchCard>

          {/* Rewards Management */}
          <SketchCard>
            <CardHeader py={3}>
              <Flex align="center" justify="center" gap={2}>
                <Text fontSize="xl">💰</Text>
                <Heading size="sm" color="gray.800">Set Rewards</Heading>
              </Flex>
            </CardHeader>
            <CardBody py={3}>
              <VStack spacing={3}>
                <FormControl>
                  <FormLabel fontSize="xs" color="gray.600">Amount (tokens)</FormLabel>
                  <NumberInput value={rewardAmount} onChange={setRewardAmount} size="sm">
                    <NumberInputField fontSize="xs" borderRadius="8px" border="2px solid" borderColor="gray.300" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                
                <CompactButton
                  colorScheme="green"
                  isLoading={isLoading}
                  onClick={handleSetRewards}
                  isDisabled={!rewardAmount || parseFloat(rewardAmount) <= 0}
                  icon={FaGift}
                  width="full"
                >
                  Set Rewards
                </CompactButton>
              </VStack>
            </CardBody>
          </SketchCard>

          {/* Withdraw Rewards */}
          <SketchCard>
            <CardHeader py={3}>
              <Flex align="center" justify="center" gap={2}>
                <Text fontSize="xl">💸</Text>
                <Heading size="sm" color="gray.800">Withdraw</Heading>
              </Flex>
            </CardHeader>
            <CardBody py={3}>
              <VStack spacing={3}>
                <FormControl>
                  <FormLabel fontSize="xs" color="gray.600">Cycle Number</FormLabel>
                  <NumberInput value={withdrawCycle} onChange={setWithdrawCycle} min={1} size="sm">
                    <NumberInputField fontSize="xs" borderRadius="8px" border="2px solid" borderColor="gray.300" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                
                <CompactButton
                  colorScheme="orange"
                  isLoading={isLoading}
                  onClick={handleWithdrawRewards}
                  isDisabled={!withdrawCycle || (stats && Number(withdrawCycle) >= stats.currentCycle)}
                  icon={FaDownload}
                  width="full"
                >
                  Withdraw
                </CompactButton>
              </VStack>
            </CardBody>
          </SketchCard>

          {/* Max Submissions */}
          <SketchCard>
            <CardHeader py={3}>
              <Flex align="center" justify="center" gap={2}>
                <Text fontSize="xl">📊</Text>
                <Heading size="sm" color="gray.800">Submission Limit</Heading>
              </Flex>
            </CardHeader>
            <CardBody py={3}>
              <VStack spacing={3}>
                <FormControl>
                  <FormLabel fontSize="xs" color="gray.600">Max per Cycle</FormLabel>
                  <NumberInput value={maxSubmissions} onChange={setMaxSubmissions} min={1} size="sm">
                    <NumberInputField fontSize="xs" borderRadius="8px" border="2px solid" borderColor="gray.300" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                
                <CompactButton
                  colorScheme="purple"
                  isLoading={isLoading}
                  onClick={handleSetMaxSubmissions}
                  isDisabled={!maxSubmissions || parseInt(maxSubmissions) <= 0}
                  icon={FaRocket}
                  width="full"
                >
                  Update Limit
                </CompactButton>
              </VStack>
            </CardBody>
          </SketchCard>
        </SimpleGrid>

        {/* Footer */}
        <Text textAlign="center" fontSize="xs" color="gray.500" py={2}>
          😸 Made with love by JusCat kitties 😸
        </Text>
      </VStack>

      {/* Custom popup notification */}
      <PopupNotification
        isOpen={isOpen}
        onClose={onClose}
        title={notification.title}
        message={notification.message}
        status={notification.status}
      />
    </Container>
  );
}; 