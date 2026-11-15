import React from "react";
import { Flex } from "@chakra-ui/react";

const SectionDivider = ({ children, ...props }) => (
  <Flex
    // px={{ base: 4, md: 5 }}
    // py={6}
    justify="space-between"
    align="center"
    mb="16px"
    position="relative"
    _after={{
      content: '""',
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: "2px",
      backgroundImage:
        "repeating-linear-gradient(to right, #C7C7C7 0 6px, transparent 6px 14px)",
    }}
    {...props}
  >
    {children}
  </Flex>
);

export default SectionDivider;