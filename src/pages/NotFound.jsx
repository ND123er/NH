
import React from "react";
import { Box, Button, Heading, Text, VStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="#F8FAFC"
      px={4}
    >
      <VStack spacing={5} textAlign="center">
        <Heading
          fontSize={{ base: "90px", md: "140px" }}
          fontWeight="800"
          color="#274167"
        >
          404
        </Heading>

        <Heading fontSize="26px" color="#1E293B">
          Page Not Found
        </Heading>

        <Text color="#64748B" fontSize="15px">
          The page you're looking for doesn't exist
          or may have been moved.
        </Text>

      </VStack>
    </Box>
  );
}
