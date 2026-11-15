// LeaveTrackerSettings.jsx
import React, { useEffect } from "react";
import {
  Box,
  Flex,
  Text,
  VStack,
  Divider,
  Icon,
  Container,
} from "@chakra-ui/react";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";

const LeaveSettings = [
  { label: "Leave Types", path: "/settings/leave-tracker/leave-types" },
  { label: "Calendar Settings", path: "/settings/leave-tracker/calendar-settings" },
];

const SectionCard = ({ title, items, onRowClick }) => {
  return (
    <Box
      bg="white"
      border="1px solid #cccccc"
      borderRadius="14px"
      overflow="hidden"
      boxShadow="sm"
    >
      {/* Header */}
      <Box px={4} py={3}>
        <Text fontSize="md" fontWeight="600" fontFamily="Poppins">
          {title}
        </Text>
      </Box>

      {/* subtle divider */}
      <Box
        h="1px"
        w="100%"
        bgImage="repeating-linear-gradient(
          to right,
          #DADADA 0 6px,
          transparent 6px 14px
        )"
      />

      <VStack spacing={0} align="stretch">
        {items.map((it, idx) => (
          <Flex
            key={it.label + idx}
            align="center"
            justify="space-between"
            px={4}
            py={4}
            cursor="pointer"
            _hover={{ bg: "gray.50" }}
            borderBottom={
              idx === items.length - 1 ? "none" : "1px solid #EDF2F7"
            }
            onClick={() => onRowClick && onRowClick(it)}
          >
            <Text fontSize="sm" fontFamily="Poppins">
              {it.label}
            </Text>
            <Icon as={ChevronRightIcon} w={5} h={5} color="gray.400" />
          </Flex>
        ))}
      </VStack>
    </Box>
  );
};

const LeaveTrackerSettings = () => {
  const navigate = useNavigate();
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }, []);


  const handleRowClick = (item) => {
    if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <Box minH="100vh" py={3} mt={{ base: '7.7vh', sm: '6.3vh', md: '6.3vh', lg: '0vh' }}
      w={{ base: '96vw', sm: '96vw', md: '96vw', lg: '100%' }}
      ml={{ base: '2.0vw', sm: '2.0vw', md: '2.0vw', lg: '0vw' }}
      mr={{ base: '2.0vw', sm: '2.0vw', md: '2.0vw', lg: '0vw' }}>
      <Container maxW="100vw" px={-4}>
        <VStack spacing={3} align="stretch">
          <SectionCard
            title="Leave Tracker Settings"
            items={LeaveSettings}
            onRowClick={handleRowClick}
          />
        </VStack>
      </Container>
    </Box>
  );
};

export default LeaveTrackerSettings;
