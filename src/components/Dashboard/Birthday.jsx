import React from "react";
import {
  Box,
  Button,
  Flex,
  Text,
  VStack,
  HStack,
  Avatar,
  Divider,
  IconButton,
  Heading,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";

const Birthday = () => {
  const birthdays = [
    {
      name: "Neil Davidson",
      date: "July 10",
      timeRemaining: "in 2 days",
      upcoming: true,
    },
    {
      name: "James Scott",
      date: "July 10",
      timeRemaining: "in 2 days",
      upcoming: true,
    },
    {
      name: "Frank Roosevelt",
      date: "July 27",
      timeRemaining: "in 10 days",
      upcoming: false,
    },
    {
      name: "Peter Thomas",
      date: "August 7",
      timeRemaining: "next month",
      upcoming: false,
    },
    {
      name: "Frank David",
      date: "August 29",
      timeRemaining: "next month",
      upcoming: false,
    },
  ];

  return (
    <Box
      borderWidth="1px"
      rounded="2xl"
      shadow="md"
      p={4}
      bg="white"
      w="100%"
      mt={3}
    >
      {/* Header */}
      <Flex justify="space-between" align="center" mb={2}>
        <Heading size="md" color="gray.700" fontFamily="'Poppins', sans-serif">
          Upcoming Birthdays
        </Heading>
        <IconButton
          aria-label="More"
          icon={<HamburgerIcon />}
          size="sm"
          variant="ghost"
        />
      </Flex>
      <Divider borderStyle="dashed" mb={3} />

      {/* Highlight upcoming (top 2) */}
      <VStack spacing={3} align="stretch">
        {birthdays
          .filter((b) => b.upcoming)
          .map((b, idx) => (
            <Flex
              key={idx}
              justify="space-between"
              align="center"
              p={3}
              rounded="xl"
              borderWidth="1px"
              borderColor="gray.200"
            >
              <HStack spacing={3}>
                <Avatar
                  size="md"
                  bg="blue.200"
                  color="blue.700"
                  fontWeight="semibold"
                  name={b.name}
                />
                <Text fontWeight="bold" fontSize="lg" fontFamily="'Poppins', sans-serif">
                  {b.name}
                </Text>
              </HStack>
              <Box textAlign="right">
                <Text color="gray.700" fontWeight="semibold" fontFamily="'Poppins', sans-serif">
                  {b.date}
                </Text>
                <Text color="gray.500" fontSize="xs" fontFamily="'Poppins', sans-serif">
                  {b.timeRemaining}
                </Text>
              </Box>
            </Flex>
          ))}
      </VStack>

      {/* Upcoming list */}
      <Box mt={4}>
        <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={2} fontFamily="'Poppins', sans-serif">
          Upcoming
        </Text>

        {/* Column Headers */}
        <Flex
          justify="space-between"
          fontSize="sm"
          fontWeight="semibold"
          color="gray.600"
          mb={2}
          px={1}
        >
          <Text fontFamily="'Poppins', sans-serif">Name of employee</Text>
          <Text fontFamily="'Poppins', sans-serif">Dates</Text>
        </Flex>

        <VStack spacing={2} align="stretch">
          {birthdays
            .filter((b) => !b.upcoming)
            .map((b, idx) => (
              <Flex
                key={idx}
                justify="space-between"
                align="center"
                fontSize="sm"
                color="gray.700"
              >
                <HStack spacing={3}>
                  <Avatar
                    size="sm"
                    bg="blue.200"
                    color="blue.700"
                    fontWeight="semibold"
                    name={b.name}
                  />
                  <Text fontFamily="'Poppins', sans-serif">{b.name}</Text>
                </HStack>
                <Box textAlign="right">
                  <Text color="gray.700" fontFamily="'Poppins', sans-serif">{b.date}</Text>
                  <Text color="gray.500" fontSize="xs" fontFamily="'Poppins', sans-serif">
                    {b.timeRemaining}
                  </Text>
                </Box>
              </Flex>
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
          marginTop={12}
          _hover={{ bg: "blue.800" }}
        >
          View All Upcoming Birthdays
        </Button>
      </Box>
    </Box>
  );
};
export default Birthday;