import { 
  Box, 
  VStack, 
  Image, 
  Text, 
  Button, 
  Container,
  Flex,
  Icon
} from "@chakra-ui/react";
import { useWalletModal } from "@vechain/dapp-kit-react";
import { FaArrowRight, FaSeedling, FaCat } from "react-icons/fa";

export const WelcomeScreen = () => {
  const { open } = useWalletModal();

  return (
    <Box 
      height="100vh" 
      width="100%" 
      bg="#f1f8e9"
      backgroundImage="radial-gradient(circle at 50% 20%, #ffffff 0%, #f1f8e9 100%)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      overflow="hidden"
      position="relative"
    >
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        opacity={0.05}
        backgroundImage="url('/planty-banner.png')"
        backgroundSize="cover"
        backgroundPosition="center"
        backgroundRepeat="no-repeat"
        zIndex={0}
      />

      <Container 
        maxW="container.sm" 
        py={12} 
        px={6} 
        position="relative" 
        zIndex={1}
        my="auto"
        height="80vh"
        display="flex"
        alignItems="center"
      >
        <VStack spacing={8} align="center" width="100%" my="auto">
          <Flex alignItems="center" justifyContent="center">
            <Icon as={FaSeedling} color="green.500" mr={2} boxSize={6} />
            <Image 
              src="/logo.png" 
              alt="Planty Logo" 
              maxW={{ base: "140px", md: "180px" }} 
              mt={3}
              mb={1}
              filter="drop-shadow(0px 4px 6px rgba(0,0,0,0.1))"
            />
            <Icon as={FaCat} color="green.500" ml={2} boxSize={6} />
          </Flex>
          
          <Button
            onClick={open}
            bg="green.500"
            color="white"
            size="md"
            fontSize="md"
            fontFamily="'Caveat', cursive"
            fontWeight="600"
            px={7}
            py={4}
            borderRadius="full"
            _hover={{ 
              bg: "green.600", 
              transform: "translateY(-2px)",
              boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)"
            }}
            _active={{ 
              bg: "green.700", 
              transform: "translateY(0)"
            }}
            transition="all 0.2s"
            boxShadow="0 4px 10px rgba(0, 0, 0, 0.1)"
            rightIcon={<FaArrowRight />}
            leftIcon={<FaSeedling />}
            letterSpacing="1px"
          >
            Connect Wallet
          </Button>
          
          <VStack spacing={5}>
            <Text
              fontSize={{ base: "3xl", md: "4xl" }}
              fontWeight="bold"
              fontFamily="'Caveat', cursive"
              textAlign="center"
              color="#2E7D32"
              letterSpacing="1px"
              transform="rotate(-1deg)"
              textShadow="1px 1px 1px rgba(0,0,0,0.1)"
            >
              Welcome to Planty.id!
            </Text>
            
            <Text
              fontSize={{ base: "xl", md: "2xl" }}
              fontFamily="'Caveat', cursive"
              textAlign="center"
              px={{ base: 2, md: 8 }}
              lineHeight={1.4}
              color="#33691E"
              maxW="500px"
              transform="rotate(0.5deg)"
            >
              Planty is a tree planting app that rewards you with B3TR tokens.
              Plant trees and earn rewards for your eco-friendly efforts!
            </Text>
            
            <Text
              fontSize={{ base: "xl", md: "2xl" }}
              fontFamily="'Caveat', cursive"
              textAlign="center"
              px={{ base: 2, md: 8 }}
              lineHeight={1.4}
              color="#33691E"
              transform="rotate(-0.5deg)"
              maxW="500px"
              mb={2}
            >
              Login with VeWorld now to start collecting rewards for your environmental contributions.
            </Text>
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
}; 