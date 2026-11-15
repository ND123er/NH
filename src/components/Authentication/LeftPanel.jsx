import { Box, Image, AspectRatio } from "@chakra-ui/react";
import React from "react";
import nav_logo from "../../assets/nav_logo.png";
import laptop from "../../assets/laptop.png";
import Carousel from "./Caraosel";

export const Leftpanel = () => {
  return (
    <Box
      as="aside"
      display="flex"
      flexDirection="column"
      flexBasis={["100%", "40%", "34%", "28%"]}
      flexShrink={0}
      minW={["220px", "260px", "300px"]}
      border="1px solid #00000033"
      borderRadius="8px"
      bg="white"
      boxSizing="border-box"
      gap={4}
      minH={["480px", "520px", "560px"]}
      overflow="hidden"
      m={2}
    >
      <Box width={["32%", "28%", "24%"]} mt={4} ml={4}>
        {" "}
        <Image src={nav_logo} alt="Logo" w="100%" objectFit="contain" />
      </Box>

      {/* <Box width={"100%"} mt={-10}>
       <Image src={laptop} alt="Laptop" />
      </Box> */}
      <Box w="100%" mt={-10} px={0}>
        {" "}
        <Image
          src={laptop}
          alt="Laptop"
          w="100%"
          h="auto"
          display="block"
          objectFit="cover"
        />
      </Box>

      <Box width="100%" display="flex" justifyContent="center" mt={-6} mb={5}>
        <Image
          src={nav_logo}
          alt="Logo center"
          w={["36%", "30%"]}
          objectFit="contain"
        />
      </Box>

      <Box mt={-8} mb={20}>
        <Carousel />
      </Box>
    </Box>
  );
};
