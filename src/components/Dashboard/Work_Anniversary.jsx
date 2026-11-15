import React from "react";
import {
  Box,
  Heading,
  Text,
  Flex,
  Avatar,
  Button,
  VStack,
  HStack,
  Divider,
  IconButton,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";

const WorkAnniversary = () => {
  const anniversaries = [
    { name: "Brandon Lily", date: "September 7", years: 3, highlight: true },
    {
      name: "Neil Davidson",
      date: "July 10",
      years: 3,
      timeRemaining: "in 2 days",
    },
    {
      name: "Frank Roosevelt",
      date: "July 27",
      years: 5,
      timeRemaining: "in 10 days",
    },
    {
      name: "Peter Thomas",
      date: "August 7",
      years: 11,
      timeRemaining: "next month",
    },
    {
      name: "Frank David",
      date: "August 29",
      years: 1,
      timeRemaining: "next month",
    },
  ];

  return (
    <Box bg="white" borderRadius="2xl" boxShadow="md" p={5} w="100%" mt={3}>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md" color="gray.700" fontFamily="'Poppins', sans-serif">
          Work Anniversaries
        </Heading>
        <IconButton
          size="sm"
          variant="ghost"
          icon={<HamburgerIcon />}
          aria-label="More options"
        />
      </Flex>

      {/* Highlighted Anniversary */}
      {anniversaries
        .filter((a) => a.highlight)
        .map((a, idx) => (
          <Box
            key={idx}
            borderWidth="1px"
            rounded="2xl"
            shadow="md"
            p={4}
            bg="white"
            w="100%"
            mt={3}
          >
            <Flex align="center" spacing={4}>
              <Avatar
                name={a.name}
                size="lg"
                src={`https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face`}
              />
              <Box ml={4}>
                <Text fontSize="lg" fontWeight="bold" color="gray.700" fontFamily="'Poppins', sans-serif">
                  {a.name}
                </Text>
                <Text fontSize="sm" color="gray.500" mb={1} fontFamily="'Poppins', sans-serif">
                  {a.date}
                </Text>
                <Text fontSize="sm" color="blue.500" fontWeight="medium" fontFamily="'Poppins', sans-serif">
                  Completed {a.years} years
                </Text>
              </Box>
            </Flex>
          </Box>
        ))}

      {/* Upcoming list */}
      <VStack align="stretch" spacing={3}>
        {anniversaries
          .filter((a) => !a.highlight)
          .map((a, idx) => (
            <Box
              key={idx}
              bg="white"
              border="1px solid"
              borderColor="gray.200"
              borderRadius="xl"
              p={3}
              boxShadow="sm"
            >
              <Flex justify="space-between" align="center">
                <HStack spacing={3}>
                  <Avatar
                    name={a.name}
                    size="sm"
                    src={`https://images.unsplash.com/photo-${
                      1500000000000 + idx * 100000000
                    }?w=50&h=50&fit=crop&crop=face`}
                  />
                  <Box>
                    <Text fontSize="sm" fontWeight="medium" color="gray.700" fontFamily="'Poppins', sans-serif">
                      {a.name}
                    </Text>
                    <Text fontSize="xs" color="gray.500" fontFamily="'Poppins', sans-serif">
                      {a.years} years
                    </Text>
                  </Box>
                </HStack>
                <Box textAlign="right">
                  <Text fontSize="sm" color="gray.700" fontFamily="'Poppins', sans-serif">
                    {a.date}
                  </Text>
                  <Text fontSize="xs" color="gray.500" fontFamily="'Poppins', sans-serif">
                    {a.timeRemaining}
                  </Text>
                </Box>
              </Flex>
            </Box>
          ))}
      </VStack>

      {/* View All Button */}
      <Button
        size="sm"
        mt={4}
        w="full"
        fontSize="sm"
        bg="blue.700"
        color="white"
        borderRadius="md"
        _hover={{ bg: "blue.800" }}
      >
        View All Work Anniversaries
      </Button>
    </Box>
  );
};

export default WorkAnniversary;
