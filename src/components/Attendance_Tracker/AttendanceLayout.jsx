import React, { useState } from "react";
import { Box, Flex, Button, Heading } from "@chakra-ui/react";

const AttendaceLayout = ({
  definitionsContent,
  patternContent,
  headingAction,
}) => {
  const [activeTab, setActiveTab] = useState("shift_definitions");

  const isDefinitions = activeTab === "shift_definitions";

  return (
    <Box
      bg="white"
      borderRadius="14px"
      // boxShadow="sm"
      // mt="12px"
      p={6}
      pl={0}
      pr={0}
      h="78vh"
      overflowY="auto"
      sx={{
        scrollbarWidth: "none",
        "&::-webkit-scrollbar": {
          display: "none",
        },
      }}
    >
      {/* COMMON TABS */}

      {/* COMMON HEADING */}
      {/* <Heading
        display="inline-block"
        fontSize="18px"
        fontWeight="600"
        fontFamily="poppins"
        color="#1F2937"
        mt={5}
        ml={6}
      >
        {isDefinitions ? "Shift Definitions" : "Add pattern"}
      </Heading> */}
      <Flex
        align="center"
        justify="space-between"
        mb="12px"
        ml="28px"
        pr="12px"
        minH="47px"
      >
        <Heading
          fontSize="22px"
          fontWeight="700"
          fontFamily="poppins"
          color="#000000"
        >
          {isDefinitions ? "Shift Settings" : "Add pattern"}
        </Heading>

        {isDefinitions && headingAction}
      </Flex>
      <Box
        w="100%"
        h="2px"
        bgImage="repeating-linear-gradient(to right,#C7C7C7 0 6px,transparent 6px 14px)"
      />
      <Flex
        px={6}
        position="relative"
        gap={{ base: 5, md: 7 }}
        mb="28px"
        _after={{
          content: '""',
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "1.5px",
          backgroundImage:
            "repeating-linear-gradient(to right, #C7C7C7 0 6px, transparent 6px 14px)",
        }}
      >
        <Button
          variant="unstyled"
          position="relative"
          zIndex="2"
          h="58px"
          px={1}
          borderRadius="unset"
          fontSize="16px"
          fontWeight={isDefinitions ? "700" : "700"}
          color={isDefinitions ? "#274066" : "#000000"}
          borderBottom={
            isDefinitions ? "3px solid #274066" : "3px solid gray.800"
          }
          onClick={() => setActiveTab("shift_definitions")}
        >
          Shift Definitions
        </Button>

        <Button
          variant="unstyled"
          borderRadius="unset"
          position="relative"
          zIndex="2"
          h="58px"
          px={1}
          fontSize="16px"
          fontWeight={!isDefinitions ? "700" : "700"}
          color={!isDefinitions ? "#274066" : "#000000"}
          borderBottom={
            !isDefinitions ? "3px solid #274066" : "3px solid gray.800"
          }
          onClick={() => setActiveTab("shift_pattern")}
        >
          Shift Patterns
        </Button>
        {/* <Box
        w="100%"
        h="2px"
        bgImage="repeating-linear-gradient(to right,#C7C7C7 0 6px,transparent 6px 14px)"
        mb={4}
      /> */}
      </Flex>

      {/* COMPONENT BODY */}
      {isDefinitions ? definitionsContent : patternContent}
    </Box>
  );
};

export default AttendaceLayout;
