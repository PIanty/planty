import {
  StyleFunctionProps,
  createMultiStyleConfigHelpers,
} from "@chakra-ui/react";
import { cardAnatomy } from "@chakra-ui/anatomy";

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(cardAnatomy.keys);

// Define the base component styles
const baseStyle = definePartsStyle({
  // Define styles for the card container
  container: {
    backgroundColor: 'white',
    borderRadius: 'lg',
    boxShadow: 'md',
    overflow: 'hidden',
    border: '1px solid',
    borderColor: 'green.100',
    position: 'relative',
    _before: {
      content: '""',
      position: 'absolute',
      top: '-3px',
      left: '10px',
      right: '10px',
      height: '3px',
      background: 'linear-gradient(90deg, transparent 0%, #AED581 50%, transparent 100%)',
      borderRadius: '2px 2px 0 0',
      opacity: 0.7,
    },
  },
  // Define styles for the header
  header: {
    padding: '4',
    borderBottom: '1px dashed',
    borderBottomColor: 'green.100',
  },
  // Define styles for the body
  body: {
    padding: '4',
  },
  // Define styles for the footer
  footer: {
    padding: '4',
    borderTop: '1px dashed',
    borderTopColor: 'green.100',
  },
});

// Define custom variants
const variants = {
  elevated: definePartsStyle({
    container: {
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      _hover: {
        boxShadow: '0 6px 10px rgba(0, 0, 0, 0.15)',
      },
      _after: {
        content: '""',
        position: 'absolute',
        bottom: '0',
        right: '0',
        width: '40px',
        height: '40px',
        background: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 25c0 0 5-3 10-3s5 3 0 5S10 25 10 25z' stroke='%238BC34A' stroke-width='0.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'bottom right',
        opacity: 0.5,
        pointerEvents: 'none',
      },
    },
  }),
  outline: definePartsStyle({
    container: {
      border: '1px dashed',
      borderColor: 'green.200',
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(4px)',
      position: 'relative',
      _before: {
        content: '""',
        position: 'absolute',
        top: '-10px',
        left: '20px',
        width: '40px',
        height: '20px',
        background: '#DCEDC8',
        borderRadius: '5px',
        transform: 'rotate(-3deg)',
        boxShadow: '0 0 0 1px rgba(0,0,0,0.05)',
        zIndex: -1,
      },
    },
  }),
  filled: definePartsStyle({
    container: {
      backgroundColor: 'rgba(237, 247, 237, 0.8)',
      boxShadow: 'sm',
    },
  }),
};

// Define sizes
const sizes = {
  sm: definePartsStyle({
    container: {
      borderRadius: 'md',
    },
    header: {
      padding: '2',
    },
    body: {
      padding: '2',
    },
    footer: {
      padding: '2',
    },
  }),
  md: definePartsStyle({
    container: {
      borderRadius: 'lg',
    },
  }),
  lg: definePartsStyle({
    container: {
      borderRadius: 'xl',
    },
    header: {
      padding: '6',
    },
    body: {
      padding: '6',
    },
    footer: {
      padding: '6',
    },
  }),
};

// export the component theme
export const cardTheme = defineMultiStyleConfig({
  baseStyle,
  variants,
  sizes,
  defaultProps: {
    variant: 'outline',
    size: 'md',
  },
});
