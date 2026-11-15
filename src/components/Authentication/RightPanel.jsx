import { Box, Image, Link, Text, Flex } from "@chakra-ui/react";
import React from "react";
import ToggleButton from "./Mytab";
import LoginForm from "./LoginForm";
import { MyDivider } from "./Divider";
import QRCode from "../../assets/QRCode.png";
import { Link as RouterLink } from "react-router-dom";

export const RightPanel = () => {
  return (
    <Box
      as="section"
      display="flex"
      flexDirection="column"
      flex="1 1 auto"
      minW={{ base: "320px", md: "480px" }} 
      // minH="90vh"
      border="1px solid #00000033"
      borderRadius={8}
      // p={[3, 4, 6]}
      paddingTop='20px'
      px={{ base: 4, md: 24 }}
      bg="white"
      boxSizing="border-box"
      // m={2}
      mt={2}
      mb={2}
      mr={2}
      justifyContent="space-between"

    >
      {/* Header area */}
      {/* <Box w="100%" mb={2}>
        <ToggleButton />
      </Box> */}

      {/* Middle content (no scroll) */}
      <Box flex="1 1 auto" alignItems='center'>
        {/* Login Form */}
          <LoginForm />

        {/* Divider between login and QR */}
        <Box mb={6} mt={10} height='28px' width='100%'>
          <MyDivider />
        </Box>

        {/* QR Code section */}
        <Box mb={4} width='100%' justifyContent={'center'}>
          <Flex
            direction={["column", "row"]}
            align="center"
            gap={[4, 6]}
            mb={4}
            flexWrap="wrap"
            boxSizing="border-box"
            alignSelf={'center'}
            ml={8}
          // backgroundColor={'green'}
          // border={"1px solid blue"}
          >
            <Box flexShrink={0} w="150px" h="150px" ml={[0, 4, 8]}>
              <Image
                src={QRCode}
                objectFit="contain"
                width="100%"
                height="100%"
                alt="QR code"
                loading="lazy"
              />
            </Box>

            <Box flex="1 1 0">
              <Text
                fontFamily="'Poppins', sans-serif"
                fontWeight="600"
                fontSize={"16px"}
                letterSpacing={"-0.04em"}
                color='#000'
              >
                Log In with QR Code
              </Text>
              <Text fontSize="13px" color="#757575" letterSpacing={"-0.04em"} fontFamily='poppins'>
                Use your <b>mobile app</b> to scan and log in seamlessly.
              </Text>
            </Box>

          </Flex>
          <Flex as="footer" justify={'center'} justifyContent={'center'}  py={3} mt={-3} fontFamily={"Poppins"}>
            <Text
              textAlign="center"
              fontSize="14px"
              color="#757575"
              fontWeight={"400"}
            >
              Don't have a HRMSnap account?{" "}
              <Link
                color="#274167"
                fontWeight="600"
                as={RouterLink}
                to="/register"
              >
                Register now
              </Link>
            </Text>
          </Flex>
          {/* Footer / Register text - sticks at bottom */}

        </Box>
      </Box>
    </Box>
  );
};
