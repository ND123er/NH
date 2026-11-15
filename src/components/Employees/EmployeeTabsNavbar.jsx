import React from "react";
import { Box, Flex, Button, Image, Text } from "@chakra-ui/react";

import primary_info_active from "../../assets/Employee_Navbar_icons/primary_info_active.svg";
import primary_info_inactive from "../../assets/Employee_Navbar_icons/primary_info_inactive.svg";
import work_info_active from "../../assets/Employee_Navbar_icons/work_info_active.svg";
import work_info_inactive from "../../assets/Employee_Navbar_icons/work_info_inactive.svg";
import education_info_active from "../../assets/Employee_Navbar_icons/education_info_active.svg";
import education_info_inactive from "../../assets/Employee_Navbar_icons/education_info_inactive.svg";
import emergency_info_active from "../../assets/Employee_Navbar_icons/emergency_info_active.svg";
import emergency_info_inactive from "../../assets/Employee_Navbar_icons/emergency_info_inactive.svg";
import documents_info_active from "../../assets/Employee_Navbar_icons/documents_info_active.png";
import documents_info_inactive from "../../assets/Employee_Navbar_icons/documents_info_inactive.png";
import compensasion_info_active from "../../assets/Employee_Navbar_icons/compensasion_info_active.png";
import compensasion_info_inactive from "../../assets/Employee_Navbar_icons/compensasion_info_inactive.png";
import exit_info_active from "../../assets/Employee_Navbar_icons/exit_info_active.svg";
import exit_info_inactive from "../../assets/Employee_Navbar_icons/exit_info_inactive.svg";

// Tabs list with active/inactive icons
const tabList = [
  { key: "basic", label: "Primary information", activeIcon: primary_info_active, inactiveIcon: primary_info_inactive },
  { key: "work", label: "Work information", activeIcon: work_info_active, inactiveIcon: work_info_inactive },
  { key: "education", label: "Education & Experience", activeIcon: education_info_active, inactiveIcon: education_info_inactive },
  { key: "emergency", label: "Emergency contacts", activeIcon: emergency_info_active, inactiveIcon: emergency_info_inactive },
  // { key: "documents", label: "Documents", activeIcon: documents_info_active, inactiveIcon: documents_info_inactive },
  // { key: "compensation", label: "Compensation", activeIcon: compensasion_info_active, inactiveIcon: compensasion_info_inactive },
  { key: "exit", label: "Exit details", activeIcon: exit_info_active, inactiveIcon: exit_info_inactive },
];

export default function EmployeeTabsNavbar({ activeTab, setActiveTab }) {
  return (
    <Flex
      bg="#243B66"
      p={2}
      borderRadius="14px"
      align="center"
      w="100%"
      mb={4}
      gap={2}
      wrap="wrap"
      justify="space-between"
    >
      {tabList.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <Button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            leftIcon={
              <Image
                src={isActive ? tab.activeIcon : tab.inactiveIcon}
                alt={tab.label}
                boxSize={{ base: "14px", sm: "16px" }}
              />
            }
            flex={{
              base: "1 1 calc(50% - 8px)",   // 2 per row on mobile
              sm: "1 1 calc(33.33% - 8px)",  // 3 per row on small screens
              md: "1 1 calc(25% - 8px)",     // 4 per row on tablets
              lg: "1 1 calc(14.28% - 8px)",  // 7 per row on desktop
            }}
            minW="0"
            w="100%"
            h={{ base: "44px", md: "56px" }}
            bg={isActive ? "white" : "#2F4A7A"}
            color={isActive ? "black" : "white"}
            borderRadius="7px"
            _hover={{ bg: isActive ? "white" : "#3b5c92" }}
            boxShadow={isActive ? "md" : "none"}
            justifyContent="center"
            whiteSpace="nowrap"
            overflow="hidden"
            textOverflow="ellipsis"
            iconSpacing={{ base: 1, sm: 2 }}
            borderWidth={'1px'}
            borderColor={'#637691'}
          >
            <Text
              as="span"
              fontFamily="'Poppins', sans-serif"
              noOfLines={1}
              fontSize={{ base: "0.55rem", sm: "0.7rem", md: "0.85rem" }}
              fontWeight="medium"
            >
              {tab.label}
            </Text>
          </Button>
        );
      })}
    </Flex>
  );
}
