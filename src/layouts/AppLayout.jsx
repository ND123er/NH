import React, { useState, Suspense } from "react";
import { Box, Center, Spinner, useColorModeValue } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Dashboard/Sidebar";
import Dashboard_Navbar from "../components/Dashboard/Dashboard_Navbar";
import side_bottomImage from "../assets/sidebarImg.png";
import SidebarBottomImage from "../components/Dashboard/SidebarBottomImage";
export default function AppLayout() {
  const navBg = useColorModeValue("#f4f7fb", "#000");
  const borderClr = useColorModeValue("#cccccc", "gray.700");
  const textClr = useColorModeValue("black", "white");
  const subTextClr = useColorModeValue("#757575", "gray.400");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebarWidth = isCollapsed ? "5%" : "20%";
  const [attendanceRefreshKey, setAttendanceRefreshKey] = useState(0);
  const refreshAttendance = () => {
    setAttendanceRefreshKey(prev => prev + 1);
  };
  return (
    <>
      <Box
        height="64px"
        minH="64px"
        position="sticky"
        top={0}
        zIndex="1000"
        // bg="#f4f7fb"
        bg={navBg}
      >
        <Dashboard_Navbar setMobileOpen={setMobileOpen} onAttendanceChange={refreshAttendance} />
      </Box>
      <Box
        display={"flex"}
        width={{ base: "100%", md: "100%", lg: "100%" }}
        gap={3}
        overflow={"hidden"}
        mt={5}
        // h={645}
        // height={'88.5vh'}
          // height={'87.39vh'}
      >
        {/* <Box
          // width={isCollapsed ? "5%" : "22.5%"}
          // height="calc(100vh - 64px)"
          width={'23.0vw'}
          // backgroundColor={'green'}
          overflowY="scroll"
          position="sticky"
          sx={{
            "&::-webkit-scrollbar": {
              width: "0px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "transparent",
            },
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        > */}


        <Sidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        // refreshKey={attendanceRefreshKey}
        />

        {/* </Box> */}
        {/* <Box   display={"flex"}
        width={{ base: "100%", md: "100%", lg: "100%" }}
        gap={2}
        overflow={"hidden"} flexDirection="column">
  <Sidebar
    isCollapsed={isCollapsed}
    setIsCollapsed={setIsCollapsed}
    mobileOpen={mobileOpen}
    setMobileOpen={setMobileOpen}
  />
  <SidebarBottomImage
    src={side_bottomImage}
    isCollapsed={isCollapsed}
  />
</Box> */}
        <Box
          display={"flex"}
          flexDirection={"column"}
          width={`calc(100% - ${sidebarWidth})`}
          mr={3}
          // overflowY="auto"
          position="sticky"
        // className="hide-scrollbar"
        >
          <Suspense fallback={<Center minH="60vh"><Spinner size="xl" /></Center>}>
            <Outlet context={{ sidebarWidth, isCollapsed, attendanceRefreshKey }} />
          </Suspense>
        </Box>
      </Box>
    </>
  );
}