// import React from 'react'
// import { Box, Button, Text, useColorModeValue } from '@chakra-ui/react'
// import { AllRoutes } from './routes/AllRoutes'
// import { BrowserRouter } from 'react-router-dom'
// import SessionInitializer from "./routes/SessionInitializer";

// export const App = () => {
//   const bg = useColorModeValue("#f4f7fb", "#000");
//   return (
//     <BrowserRouter>
//        <SessionInitializer>
//       <Box minH="100vh" bg={bg}>
//         <AllRoutes />
//       </Box>
//       </SessionInitializer>
//     </BrowserRouter>
//   )
// }

import React from "react";
import {
  Box,
  useColorModeValue,
} from "@chakra-ui/react";

import { AllRoutes } from "./routes/AllRoutes";
import { BrowserRouter } from "react-router-dom";
import SessionInitializer from "./routes/SessionInitializer";
import PendingCompanySetup from "./pages/PendingCompanySetup";

export const App = () => {
  const bg = useColorModeValue("#f4f7fb", "#000");

  return (
    <BrowserRouter>
      <SessionInitializer>
        <PendingCompanySetup />

        <Box minH="100vh" bg={bg}>
          <AllRoutes />
        </Box>
      </SessionInitializer>
    </BrowserRouter>
  );
};
