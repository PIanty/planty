import { defineStyle, defineStyleConfig } from '@chakra-ui/react';

const baseStyle = defineStyle({
  borderRadius: 'md',
  fontWeight: 'semibold',
  transition: 'all 0.2s',
  _focus: {
    boxShadow: 'outline',
  },
  _disabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  _hover: {
    transform: 'translateY(-2px)',
  }
});

const sizes = {
  sm: defineStyle({
    fontSize: 'sm',
    px: 3,
    py: 1,
  }),
  md: defineStyle({
    fontSize: 'md',
    px: 4,
    py: 2,
  }),
  lg: defineStyle({
    fontSize: 'lg',
    px: 5,
    py: 3,
  }),
};

// Styles for the visual appearance of the button
const variants = {
  primary: defineStyle({
    bg: 'green.500',
    color: 'white',
    border: '1px solid',
    borderColor: 'green.600',
    _hover: {
      bg: 'green.600',
      borderColor: 'green.700',
      boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
    },
    _active: {
      bg: 'green.700',
      boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
    },
  }),

  secondary: defineStyle({
    bg: 'white',
    color: 'green.600',
    border: '2px dashed',
    borderColor: 'green.300',
    _hover: {
      bg: 'green.50',
      borderColor: 'green.400',
      boxShadow: '0 4px 12px rgba(76, 175, 80, 0.15)',
    },
    _active: {
      bg: 'green.100',
      boxShadow: 'none',
    },
  }),

  outline: defineStyle({
    bg: 'transparent',
    color: 'green.500',
    border: '1px solid',
    borderColor: 'green.500',
    _hover: {
      bg: 'green.50',
      color: 'green.600',
    },
    _active: {
      bg: 'green.100',
      color: 'green.700',
    },
  }),

  sketchyLeaf: defineStyle({
    bg: 'white',
    color: 'green.600',
    border: '1px solid',
    borderColor: 'green.300',
    position: 'relative',
    overflow: 'visible',
    px: 6,
    py: 3,
    borderRadius: 'lg',
    _before: {
      content: '""',
      position: 'absolute',
      top: '-5px',
      left: '10px',
      width: '30px',
      height: '5px',
      background: '#AED581',
      borderRadius: '5px 5px 0 0',
      opacity: 0.7,
    },
    _after: {
      content: '""',
      position: 'absolute',
      bottom: '-3px',
      right: '10px',
      width: '40%',
      height: '3px',
      background: 'linear-gradient(90deg, transparent 0%, #AED581 100%)',
      borderRadius: '0 0 5px 5px',
      opacity: 0.7,
    },
    _hover: {
      bg: '#F1F8E9',
      transform: 'translateY(-3px)',
      boxShadow: '0 6px 12px rgba(76, 175, 80, 0.15)',
    },
    _active: {
      transform: 'translateY(0)',
      boxShadow: 'none',
    },
  }),

  ghost: defineStyle({
    bg: 'transparent',
    color: 'green.500',
    _hover: {
      bg: 'green.50',
    },
    _active: {
      bg: 'green.100',
    },
  }),
};

export const ButtonStyle = defineStyleConfig({
  baseStyle,
  sizes,
  variants,
  defaultProps: {
    size: 'md',
    variant: 'sketchyLeaf',
  },
});
