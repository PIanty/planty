import {
  Box,
  Card,
  Image,
  VStack,
} from "@chakra-ui/react";

export const InfoCard = () => {
  return (
    <Card w={"full"} bg="transparent" boxShadow="none">
      <Box p={{ base: 2, md: 3 }}>
        <VStack w={"full"} spacing={{ base: 2, md: 3 }}>
          <Image 
            src="/planty-banner.png" 
            fallbackSrc="/planty-banner.png"
            borderRadius={16} 
            maxH={{ base: "250px", md: "250px" }}
            objectFit="contain"
            bg="transparent"
          />
        </VStack>
      </Box>
    </Card>
  );
};
