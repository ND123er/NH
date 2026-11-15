
import { AbsoluteCenter, Box, Divider } from "@chakra-ui/react";

export const MyDivider = () => {
  return (
    <Box position="relative" width="95%" px={[2, 4]} py={5} boxSizing="border-box" ml={5} mr={5}>
      <Divider borderColor="rgba(0,0,0,0.2)" />
      <AbsoluteCenter
        bg="white"
        px={3}
        fontFamily={"'Poppins', sans-serif"}
        color={"#8692a6"}
        fontSize={"20px"}
        fontWeight={400}
        letterSpacing={"-0.3px"}
      >
        or
      </AbsoluteCenter>
    </Box>
  );
};

