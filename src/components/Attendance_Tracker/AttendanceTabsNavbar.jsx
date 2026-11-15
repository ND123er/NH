import { isAdminUser } from "../../utils/roles";


import React, { useEffect } from "react";
import { Flex, Button, Text, Image } from "@chakra-ui/react";
import reports_active from "../../assets/Leave_Tracker_Navbar_icons/reports_active.svg";
import reports_inactive from "../../assets/Leave_Tracker_Navbar_icons/reports_inactive.svg"
import attendance_inactive from '../../assets/Attendance_Tracker_navbar_icons/active_attendance.png'
import inattendance_inactive from '../../assets/Attendance_Tracker_navbar_icons/inactive_attendance.png'
import inactive_team_attendance from '../../assets/Attendance_Tracker_navbar_icons/inactive_team_attendance.png'
import active_team_attendance from '../../assets/Attendance_Tracker_navbar_icons/active_team_attendance.png'
import { useSelector } from "react-redux";
const tabList = [
  { key: "my_attendance", label: "My Attendance", activeIcon: attendance_inactive, inactiveIcon: inattendance_inactive },
  { key: "team_attendance", label: "Team Attendance", activeIcon: active_team_attendance, inactiveIcon: inactive_team_attendance },
  { key: "reports", label: "Reports", activeIcon: reports_active, inactiveIcon: reports_inactive },
];

export default function AttendanceTabsNavbar({ activeTab, setActiveTab }) {
  const { user, token, loading } = useSelector((state) => state.auth);
  const filteredTabs = tabList.filter((tab) => {
    if (!isAdminUser(user)) {
      return tab.key === "my_attendance";
    }

    if (isAdminUser(user)) {
      return tab.key !== "my_attendance";
    }

    return false;
  });

  if (filteredTabs.length === 1 && filteredTabs[0].key === "my_attendance") {
    return null;
  }
  useEffect(() => {
    if (!filteredTabs.some(tab => tab.key === activeTab)) {
      setActiveTab(filteredTabs[0]?.key);
    }
  }, [filteredTabs, activeTab]);

  return (
    <Flex
      bg="#243B66"
      p={2}
      borderRadius="14px"
      w="100%"
      mb={3}
      mt={3}
      
    >
      {/* <Flex
        w="50%"
        gap={2}
        wrap="wrap"
        justify="space-between"
      > */}
      <Flex
        w={{ base: '100%', sm: "100%", md: "50%", lg: '50%' }}
        gap={2}
        overflowX="auto"
        wrap="nowrap"
        sx={{
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {filteredTabs?.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Button
              key={tab.key}
              // key={item._id}

              onClick={() => setActiveTab(tab.key)}
              leftIcon={
                <Image
                  src={isActive ? tab.activeIcon : tab.inactiveIcon}
                  alt={tab.label}
                  boxSize={{ base: "14px", sm: "16px" }}
                />
              }
              flex={tab.key === "my_attendance" ? "0 0 auto" : "1 1 auto"}
              w={tab.key === "my_attendance" ? "300px" : "200px"}
              minW={tab.key === "my_attendance" ? "20px" : "0"}
              h={{ base: "44px", md: "56px" }}
              bg={isActive ? "white" : "#2F4A7A"}
              color={isActive ? "black" : "white"}
              borderRadius="7px"
              _hover={{ bg: isActive ? "white" : "#3b5c92" }}
              boxShadow={isActive ? "md" : "none"}
              justifyContent="center"
              whiteSpace="nowrap"
              overflow="hidden"
              borderWidth={'1px'}
              borderColor={'#637691'}
            >

              <Text
                as="span"
                fontFamily="'Poppins', sans-serif"
                noOfLines={1}
                fontSize={{ base: "0.55rem", sm: "0.7rem", md: "0.85rem" }}
                // fontWeight="medium"
                fontWeight={'600'}
              >
                {tab.label}
              </Text>
            </Button>
          );
        })}

      </Flex>
    </Flex>

  );
}
