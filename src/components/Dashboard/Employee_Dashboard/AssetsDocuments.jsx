// src/components/Dashboard/employee/AssetsDocuments.jsx
import React from "react";
import { Box, Text, HStack, VStack, Button } from "@chakra-ui/react";

const items = [
  // { id: 1, title: "Assigned Laptop", subtitle: "MacBook Pro" },
  // { id: 2, title: "ID Card", subtitle: "Park ops-bowit" },
  // { id: 3, title: "Offer Letter", subtitle: "joined docs" },
];

export default function AssetsDocuments() {
  return (
    <Box
      p={5}
      borderWidth="1px"
      borderRadius="16px"
      bg="white"
      border="1px solid #cccccc"
    >
      <Text fontWeight="600" mb={3}>
        Assets & Documents
      </Text>

      <HStack spacing={4} overflowX="auto">
        {items.map((it) => (
          <Box
            key={it.id}
            p={3}
            minW="180px"
            borderWidth="1px"
            borderRadius="12px"
            bg="#fafafa"
          >
            <VStack align="start" spacing={1}>
              <Text fontWeight="600">{it.title}</Text>
              <Text fontSize="sm" color="gray.600">
                {it.subtitle}
              </Text>
            </VStack>
          </Box>
        ))}
      </HStack>

      <Button size="sm" variant="ghost" mt={3}>
        View All Assets
      </Button>
    </Box>
  );
}
