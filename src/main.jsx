// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'

// import "@fontsource/poppins/400.css";
// import "@fontsource/poppins/700.css";

// import { ChakraProvider } from '@chakra-ui/react'
// import { App } from './App'
// import { Provider } from 'react-redux'
// import { store } from './store'
// import theme from './theme'

// createRoot(document.getElementById('root')).render(
//     <Provider store={store} theme={theme}>
//       <ChakraProvider>
//         <App/>
//       </ChakraProvider>
//     </Provider>
// )

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

// Load fonts
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/700.css";

import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import { App } from "./App";
import { Provider } from "react-redux";
import { store } from "./store";
import theme from "./theme";

createRoot(document.getElementById("root")).render(
  // <StrictMode>
    <Provider store={store}>
      <ChakraProvider theme={theme}>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <App />
      </ChakraProvider>
    </Provider>
  //  </StrictMode>
);