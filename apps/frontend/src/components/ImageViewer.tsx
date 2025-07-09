import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  Image,
  useDisclosure,
  Box,
} from "@chakra-ui/react";

interface ImageViewerProps {
  imageUrl: string;
  alt?: string;
  boxSize?: string | object;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  borderRadius?: string | object;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  imageUrl,
  alt = "Image",
  boxSize = "90px",
  objectFit = "cover",
  borderRadius = "0",
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Box 
        cursor="pointer" 
        overflow="hidden"
        borderRadius={borderRadius}
        onClick={onOpen}
        transition="transform 0.2s"
        _hover={{ transform: "scale(1.02)" }}
      >
        <Image
          src={imageUrl}
          alt={alt}
          boxSize={boxSize}
          objectFit={objectFit}
        />
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay backdropFilter="blur(3px)" bg="rgba(0, 0, 0, 0.7)" />
        <ModalContent bg="transparent" boxShadow="none" maxW="90vw" maxH="90vh">
          <ModalCloseButton 
            color="white" 
            bg="rgba(0, 0, 0, 0.3)" 
            borderRadius="full" 
            _hover={{ bg: "rgba(0, 0, 0, 0.5)" }}
          />
          <ModalBody p={0} display="flex" justifyContent="center" alignItems="center">
            <Image
              src={imageUrl}
              alt={alt}
              maxH="85vh"
              maxW="85vw"
              objectFit="contain"
              borderRadius="md"
              boxShadow="dark-lg"
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}; 