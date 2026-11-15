import React, { useEffect } from "react";
import { Flex, Button, Text, Image } from "@chakra-ui/react";

import my_leave_active from "../../assets/Leave_Tracker_Navbar_icons/my_leave_active.svg";
import my_leave_inactive from "../../assets/Leave_Tracker_Navbar_icons/my_leave_inactive.svg";
import team_leave_active from "../../assets/Leave_Tracker_Navbar_icons/team_leave_active.svg";
import team_leave_inactive from "../../assets/Leave_Tracker_Navbar_icons/team_leave_inactive.svg";
import holiday_active from "../../assets/Leave_Tracker_Navbar_icons/holiday_active.svg";
import holiday_inactive from "../../assets/Leave_Tracker_Navbar_icons/holiday_inactive.svg";
import leave_rollover_active from "../../assets/Leave_Tracker_Navbar_icons/leave_rollover_active.svg";
import leave_rollover_inactive from "../../assets/Leave_Tracker_Navbar_icons/leave_rollover_inactive.svg";
import balance_active from "../../assets/Leave_Tracker_Navbar_icons/balance_active.svg";
import balance_inactive from "../../assets/Leave_Tracker_Navbar_icons/balance_inactive.svg";
import reports_active from "../../assets/Leave_Tracker_Navbar_icons/reports_active.svg";
import reports_inactive from "../../assets/Leave_Tracker_Navbar_icons/reports_inactive.svg";
import compoff_active from "../../assets/Leave_Tracker_Navbar_icons/comp_off_active.svg";
import compoff_inactive from "../../assets/Leave_Tracker_Navbar_icons/comp_off_inactive.svg";

// Define tabs
const tabList = [
  {
    key: "my_leave",
    label: "My Leave",
    activeIcon: my_leave_active,
    inactiveIcon: my_leave_inactive,
  },
  {
    key: "team_leave",
    label: "My Team Leave",
    activeIcon: team_leave_active,
    inactiveIcon: team_leave_inactive,
  },
  {
    key: "holiday",
    label: "Holiday List",
    activeIcon: holiday_active,
    inactiveIcon: holiday_inactive,
  },
  {
    key: "leave_rollover",
    label: "Leave Rollover",
    activeIcon: leave_rollover_active,
    inactiveIcon: leave_rollover_inactive,
  },
  {
    key: "balance",
    label: "Customize Balance",
    activeIcon: balance_active,
    inactiveIcon: balance_inactive,
  },
  // {
  //   key: "report",
  //   label: "Reports",
  //   activeIcon: reports_active,
  //   inactiveIcon: reports_inactive,
  // },
  {
  key: "comp_off",
  label: "Comp Off",
  activeIcon: compoff_active,
  inactiveIcon: compoff_inactive,
},
];

export default function LeaveTabsNavbar({
  activeTab,
  setActiveTab,
  visibleTabs = null,
}) {
  // If visibleTabs is provided, filter the internal tabList by keys.
  const tabsToRender = Array.isArray(visibleTabs)
    ? tabList.filter((t) => visibleTabs.includes(t.key))
    : tabList;

  return (
    <Flex
      bg="#243B66"
      p={2}
      borderRadius="14px"
      align="center"
      w="100%"
      mb={3}
      gap={2}
      wrap="wrap"
      justify="space-between"
      mt={3}
      h="auto"
    >
      {tabsToRender.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <Button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              
            }}
            leftIcon={
              <Image
                src={isActive ? tab.activeIcon : tab.inactiveIcon}
                alt={tab.label}
                boxSize={{ base: "14px", sm: "16px" }}
              />
            }
            flex={{
              base: "1 1 calc(50% - 8px)",
              sm: "1 1 calc(33.33% - 8px)",
              md: "1 1 calc(25% - 8px)",
              lg: "1 1 calc(14.28% - 8px)",
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
            borderWidth={"1px"}
            borderColor={"#637691"}
          >
            <Text
              as="span"
              fontFamily="'Poppins', sans-serif"
              noOfLines={1}
              fontSize={{ base: "0.55rem", sm: "0.7rem", md: "0.85rem" }}
              fontWeight="600"
              color={isActive ? "#274066" : "white"}
            >
              {tab.label}
            </Text>
          </Button>
        );
      })}
    </Flex>
  );
}
