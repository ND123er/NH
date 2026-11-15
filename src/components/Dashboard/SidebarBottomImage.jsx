import React from "react";
import { Box, Image } from "@chakra-ui/react";

const SidebarBottomImage = ({ src, isCollapsed }) => {
  return (
    <Box
      mt={2}
      mb={4}
      display="flex"
      justifyContent="center"
      width={'100%'}
      borderRadius={10}
      overflow={"hidden"}
    >
      <Image
        src={src}
        maxW={isCollapsed ? "40px" : "300px"}
        transition="all 0.3s ease"
        objectFit="contain"
      />
    </Box>
  );
};

export default SidebarBottomImage;
