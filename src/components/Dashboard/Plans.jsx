import React from "react";
import { Box, Flex, Text, Button, Icon } from "@chakra-ui/react";

// Simple rocket icon using Chakra's built-in Icon (you can replace later)
const RocketIcon = (props) => (
  <Icon viewBox="0 0 24 24" boxSize={4} color="white" {...props}>
    <path
      fill="currentColor"
      d="M12 2c3.866 0 7 3.134 7 7 0 1.657-.563 3.18-1.5 4.389l2.121 2.121a1 1 0 01-1.414 1.414l-2.121-2.121A6.962 6.962 0 0112 16c-3.866 0-7-3.134-7-7s3.134-7 7-7Zm-2.5 13a3.5 3.5 0 0 1 5 0l3.5 3.5c.471.471.138 1.5-.5 1.5H7.5c-.638 0-.971-1.029-.5-1.5l2.5-2.5Z"
    />
  </Icon>
);

const Plans = () => {
  // Dummy background image; replace later
  const bgImage =
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop";

  return (
    <Box
      position="relative"
      overflow="hidden"
      borderRadius="2xl"
      boxShadow="md"
      w="100%"
      mt={3}
      bgImage={`url(${bgImage})`}
      bgSize="cover"
      bgPos="center"
      minH="220px"
      maxH="430px"
    >
      {/* scrollable content wrapper */}
      <Box
        overflowY="auto" // 🔹 now the content inside this card can scroll
        maxH="430px"
      >
        {/* Dark overlay */}
        <Box
          position="absolute"
          inset={0}
          bgGradient="linear(to-b, rgba(7,11,25,0.75), rgba(7,11,25,0.85))"
        />

        {/* Content */}
        <Flex position="relative" direction="column" p={5} gap={5} h="100%">
          {/* Icon badge */}
          <Box
            bg="whiteAlpha.200"
            borderRadius="md"
            w="28px"
            h="28px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            backdropFilter="auto"
            backdropBlur="2px"
          >
            <RocketIcon />
          </Box>

          {/* Headline */}
          <Box color="white">
            <Text
              fontSize={{ base: "lg", md: "xl" }}
              fontWeight="semibold"
              lineHeight="1.15"
              fontFamily="'Poppins', sans-serif"
            >
              Go beyond the basics.
            </Text>
            <Text
              fontSize={{ base: "lg", md: "xl" }}
              fontWeight="semibold"
              lineHeight="1.15"
              fontFamily="'Poppins', sans-serif"
            >
              unlock premium tools built
            </Text>
            <Text
              fontSize={{ base: "lg", md: "xl" }}
              fontWeight="semibold"
              lineHeight="1.15"
              fontFamily="'Poppins', sans-serif"
            >
              for growing teams.
            </Text>

            <Text
              mt={3}
              fontSize="sm"
              color="whiteAlpha.800"
              fontFamily="'Poppins', sans-serif"
            >
              Upgrade to access advanced reports,
            </Text>
            <Text
              fontSize="sm"
              color="whiteAlpha.800"
              fontFamily="'Poppins', sans-serif"
            >
              automation & integrations.
            </Text>
          </Box>

          {/* CTA */}
          <Box mt="auto">
            <Button
              size="sm"
              mt={4}
              w="full"
              fontSize="sm"
              bg="white"
              color="gray.800"
              borderRadius="md"
              fontFamily="'Poppins', sans-serif"
              _hover={{ bg: "whiteAlpha.900" }}
            >
              View Plans
            </Button>
          </Box>
        </Flex>
      </Box>
    </Box>
  );
};

export default Plans;
