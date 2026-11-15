// theme.js
import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  fonts: {
    heading: "Poppins, sans-serif",
    body: "Poppins, sans-serif",
  },

  components: {
    Input: {
      baseStyle: {
        field: {
          _disabled: {
            opacity: 1,
            color: "#000",
            WebkitTextFillColor: "#000",
          },
        },
      },
    },
    Select: {
      baseStyle: {
        field: {
          _disabled: {
            opacity: 1,
            color: "#000",
            WebkitTextFillColor: "#000",
          },
        },
      },
    },

  },
});

export default theme;





