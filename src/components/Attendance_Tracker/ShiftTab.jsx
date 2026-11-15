import React from "react";
import { Flex, Text } from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";

const ShiftTab = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    {
      label: "Shift Definitions",
      path: "/settings/AttendanceTrackerSetting/shiftSetting",
    },

    //  {
    //   label: "Shift List",
    //   path: "/settings/AttendanceTrackerSetting/shiftSetting/shiftlist",
    // },

    {
      label: "Shift Patterns",
      path: "/settings/AttendanceTrackerSetting/shiftSetting/patterns",
    },

    // {
    //   label: "Assign Shift",
    //   path: "/settings/AttendanceTrackerSetting/shiftSetting/AssignShift",
    // },
    // {
    //   label: "Rosters",
    //   path: "/settings/AttendanceTrackerSetting/shiftSetting/rosters",
    // },
    // {
    //   label: "Work Locations",
    //   path: "/settings/AttendanceTrackerSetting/workLocations",
    // },
    // {
    //   label: "Attendance Policies",
    //   path: "/settings/AttendanceTrackerSetting/attendancePolicies",
    // },
  ];

  return (
    <Flex
      borderBottom="1px solid #E5E7EB"
      px={4}
      gap={8}
      bg="white"
    >
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;

        return (
          <Text
            key={tab.path}
            py={3}
            fontSize="13px"
            fontWeight={isActive ? "600" : "500"}
            color={isActive ? "#274066" : "#667085"}
            borderBottom={isActive ? "2px solid #274066" : "2px solid transparent"}
            cursor="pointer"
            onClick={() => navigate(tab.path)}
          >
            {tab.label}
          </Text>
        );
      })}
    </Flex>
  );
};

export default ShiftTab;