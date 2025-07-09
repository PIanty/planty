import { extendTheme } from "@chakra-ui/react";
import { lightThemeColors } from "./colors";
import { cardTheme } from "./card";
import { ButtonStyle } from "./button";

const themeConfig = {
  components: {
    Card: cardTheme,
    Button: ButtonStyle,
  },

  // 2. Add your color mode config
  initialColorMode: "system",
  useSystemColorMode: true,

  semanticTokens: {
    colors: {
      "chakra-body-text": {
        _light: "#2E582C",
      },
      "chakra-body-bg": {
        _light: "#F7FAF5",
      },
    },
  },
  colors: {
    //dynamic primary coor based on the light/dark

    green: {
      "50": "#f0f7ed",
      "100": "#ddecd6",
      "200": "#c3dcb7",
      "300": "#a0c990",
      "400": "#7fb768",
      "500": "#5a9f40",
      "600": "#478c33",
      "700": "#3a732c",
      "800": "#325c27",
      "900": "#274a20",
    },
    
    brown: {
      "50": "#f9f6f1",
      "100": "#e8d8c3",
      "200": "#d7bb97",
      "300": "#c79e6d",
      "400": "#b78344",
      "500": "#96682f",
      "600": "#7d5526",
      "700": "#64431e",
      "800": "#4c3417",
      "900": "#33230f",
    }
  },
  fonts: {
    heading: `'Caveat', cursive`,
    body: `system-ui, sans-serif`,
  },
};

export const lightTheme = extendTheme({
  ...themeConfig,
  colors: lightThemeColors,
});
