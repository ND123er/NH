import React from "react";
import { Flex, Button, Text } from "@chakra-ui/react";

const tabList = [
  { key: "settings", label: "Account Settings" },
  { key: "asset", label: "Asset" },
  { key: "assetFields", label: "Asset fields" },
  { key: "attendance", label: "Attendance Tracker" },
  { key: "employee", label: "Employee" },
  { key: "employeeFields", label: "Employee fields" },
  { key: "announcement", label: "Announcement" },
  { key: "leave", label: "Leave tracker" },
];

export default function RoleTabsNavbar({
  activeTab,
  setActiveTab,
  preloadTab,
}) {
  return (
    <Flex
      bg="#243B66"
      p={2}
      borderRadius="md"
      align="center"
      w="100%"
      mb={3}
      gap={2}
      overflowX="auto"
      h="70px"
      mt={3}
    >
      {tabList.map((tab) => (
        <Button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          onMouseEnter={() => preloadTab?.(tab.key)} // prefetch when hovering
          onFocus={() => preloadTab?.(tab.key)} // also prefetch on keyboard focus
          bg={activeTab === tab.key ? "white" : "#2F4A7A"}
          color={activeTab === tab.key ? "black" : "white"}
          borderRadius="md"
          _hover={{ bg: activeTab === tab.key ? "white" : "#3b5c92" }}
          boxShadow={activeTab === tab.key ? "md" : "none"}
        >
          <Text fontFamily="'Poppins', sans-serif" fontSize="sm">
            {tab.label}
          </Text>
        </Button>
      ))}
    </Flex>
  );
}

