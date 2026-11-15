import { useState, useRef, useEffect } from "react";
import {
  Box,
  Flex,
  Image,
  Text,
  VStack,
  Divider,
  IconButton,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
  useBreakpointValue,
  useDisclosure,
  Button,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@chakra-ui/icons";

import Home_active from "../../assets/Sidebar_Active_icons/Home_active.svg";
import Home_inactive from "../../assets/Sidebar_Inactive_Icons/Home_inactive.svg";
import employees_inactive from "../../assets/Sidebar_Inactive_Icons/employees_inactive.svg";
import employees_active from "../../assets/Sidebar_Active_icons/employees_active.svg";
import inbox_inactive from "../../assets/Sidebar_Inactive_Icons/inbox_inactive.svg";
import inbox_active from "../../assets/Sidebar_Active_icons/inbox_active.svg";
import attendance_inactive from "../../assets/Sidebar_Inactive_Icons/attendance_inactive.svg";
import attendance_active from "../../assets/Sidebar_Active_icons/attendance_active.svg";
import leave_tracker_inactive from "../../assets/Sidebar_Inactive_Icons/leave_tracker_inactive.svg";
import leave_tracker_active from "../../assets/Sidebar_Active_icons/leave_tracker_active.svg";
import performance_man_inactive from "../../assets/Sidebar_Inactive_Icons/performance_man_inactive.svg";
import performance_man_active from "../../assets/Sidebar_Active_icons/performance_man_active.svg";
import assets_inactive from "../../assets/Sidebar_Inactive_Icons/assets_inactive.svg";
import assets_active from "../../assets/Sidebar_Active_icons/assets_active.svg";
import payroll_inactive from "../../assets/Sidebar_Inactive_Icons/payroll_inactive.svg";
import payroll_active from "../../assets/Sidebar_Active_icons/payroll_active.svg";
import reports_inactive from "../../assets/Sidebar_Inactive_Icons/reports_inactive.svg";
import reports_active from "../../assets/Sidebar_Active_icons/reports_active.svg";
import settings_inactive from "../../assets/Sidebar_Inactive_Icons/settings_inactive.svg";
import settings_active from "../../assets/Sidebar_Active_icons/settings_active.svg";
import help_inactive from "../../assets/Sidebar_Inactive_Icons/help_inactive.svg";
import help_active from "../../assets/Sidebar_Active_icons/help_active.svg";
import logout_inactive from "../../assets/Sidebar_Inactive_Icons/logout_inactive.svg";
import logout_active from "../../assets/Sidebar_Active_icons/logout_active.svg";
import hrpolicies_active from '../../assets/Sidebar_Active_icons/hrpolicies_active.svg';
import hrpolicies_inactive from '../../assets/Sidebar_Inactive_Icons/hrpolicies_inactive.svg';

import side_bottomImage from "../../assets/sidebarImg.png";

import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Cookies from "js-cookie";
import { signOutThunk } from "../../slices/authSlice";
import { clearOrganizationSetup } from "../../slices/organizationSetupSlice";


const menuItemsTop = [
  {
    id: "home",
    label: "Home",
    activeIcon: Home_active,
    inactiveIcon: Home_inactive,
    path: "/dashboard",
    // -----------------------------------------------------
  },
  {
    id: "employees",
    label: "Employees",
    activeIcon: employees_active,
    inactiveIcon: employees_inactive,
    path: "/employee",
  },
  {
    id: "inbox",
    label: "Inbox",
    activeIcon: inbox_active,
    inactiveIcon: inbox_inactive,
    path: "/inbox",
    // -----------------------------------------------------------e
  },
  {
    id: "attendance",
    label: "Attendance Tracker",
    activeIcon: attendance_active,
    inactiveIcon: attendance_inactive,
    path: "/attendances",
    // -----------------------------------------------------------e

  },
  {
    id: "leave-tracker",
    label: "Leave Tracker",
    activeIcon: leave_tracker_active,
    inactiveIcon: leave_tracker_inactive,
    path: "/leaves",
    // -----------------------------------------------------------e

  },
  {
    id: "performance",
    label: "Performance Management",
    activeIcon: performance_man_active,
    inactiveIcon: performance_man_inactive,
    path: "/performanceManagement",
  },
  {
    id: "hrpoliciesEmployee",
    label: " HR Policies",
    activeIcon: hrpolicies_active,
    inactiveIcon: hrpolicies_inactive,
    path: "/hrpolicies",
  },
  {
    id: "assets",
    label: "Assets",
    activeIcon: assets_active,
    inactiveIcon: assets_inactive,
    path: "/asset-management",
  },
  {
    id: "payroll",
    label: "Payroll",
    activeIcon: payroll_active,
    inactiveIcon: payroll_inactive,
    path: "/payroll",
  },
  {
    id: "reports",
    label: "Reports",
    activeIcon: reports_active,
    inactiveIcon: reports_inactive,
    path: "/reports",
  },
];

const menuItemsBottom = [
  {
    id: "settings",
    label: "Settings",
    activeIcon: settings_active,
    inactiveIcon: settings_inactive,
  },
  {
    id: "help",
    label: "Help",
    activeIcon: help_active,
    inactiveIcon: help_inactive,
    path: "/help",
    // -----------------------------------------------------------e

  },
  {
    id: "logout",
    label: "Log Out",
    activeIcon: logout_active,
    inactiveIcon: logout_inactive,
    // -----------------------------------------------------------e

  },
];

const settingsSubItems = [
  { id: "settings:organization", label: "Organization", path: "/settings" },
  {
    id: "settings:attendance",
    label: "Attendance Tracker",
    path: '/settings/AttendanceTrackerSetting'
  },
  {
    id: "settings:leave",
    label: "Leave Tracker",
    path: "/settings/leave-tracker",
  },
  {
    id: "settings:performance",
    label: "Performance Management",
    path: "/settings/performance-management",
  },
  {
    id: "settings:hr-docs",
    label: "My HR document",
    path: "/settings/hr-documents",
  },
  {
    id: "settings:hr-policies",
    label: "HR policies settings",
    path: "/settings/HrPolicies",
  },
];

export default function Sidebar({
  isCollapsed,
  setIsCollapsed,
  mobileOpen,
  setMobileOpen,
  refreshKey
}) {
  const navBg = useColorModeValue("white", "#000");
  const borderClr = useColorModeValue("#cccccc", "gray.700");
  const activeTextColor = "white";

  const inactiveTextColor = useColorModeValue(
    "black", 
    "white"    
  );
  const textClr = useColorModeValue("black", "white");
  const subTextClr = useColorModeValue("#757575", "gray.400");
  const subActiveBg = useColorModeValue("#1A365D", "#1A365D");

  const subInactiveBg = useColorModeValue(
    "white",    
    "#000"  
  );

  const subHoverBg = useColorModeValue(
    "gray.100", 
    "gray.700" 
  );

  const subActiveText = "white";

  const subInactiveText = useColorModeValue(
    "black",     // Light inactive text
    "white"      // Dark inactive text
  );
  const settingsActiveText = "white";
  const settingsInactiveText = useColorModeValue(
    "black",   // Light mode inactive
    "white"    // Dark mode inactive
  );

  const settingsHoverText = useColorModeValue(
    "black",   // Light mode hover
    "white"    // Dark mode hover
  );
  // ✅ Hover Text Colors (Two Validation)

  const hoverActiveText = "white";

  const hoverInactiveText = useColorModeValue(
    "black",   // Light mode hover text
    "white"    // Dark mode hover text
  );
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const dispatch = useDispatch();
  const isMobile = useBreakpointValue({ base: true, md: false });

  // single source of truth for which item is active
  const [activeKey, setActiveKey] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  // const { user, loading } = useSelector((state) => state.auth);
  const { user, token, loading } = useSelector((state) => state.auth);
  const isAdmin = ["owner", "admin"].includes(
  String(user?.role || "").toLowerCase()
);
  // const filteredTopMenu = menuItemsTop.filter((item) => {
  //   if (!user?.is_admin) {
  //     const allowed = ["home", "inbox", "attendance", "leave-tracker","hrpoliciesEmployee"];
  //     return allowed.includes(item.id);
  //   }
  //   return true; 
  // });
  const filteredTopMenu = menuItemsTop.filter((item) => {
    // ❌ HR Policies admin ke liye completely hide
    if (item.id === "hrpoliciesEmployee" && 
      // user?.is_admin
      isAdmin
      
    ) {
      return false;
    }

    // 👤 Employee ke liye limited menu
    if (
      // !user?.is_admin
      !isAdmin
    
    ) {
      const allowed = [
        "home",
        "inbox",
        "attendance",
        "leave-tracker",
        "performance",
        "hrpoliciesEmployee"
      ];
      return allowed.includes(item.id);
    }

    // 👑 Admin → baaki sab
    return true;
  });

  const filteredBottomMenu = menuItemsBottom.filter((item) => {
    if (
      // !user?.is_admin
      !isAdmin
    ) {
      // admin nahi → restricted bottom menu
      const allowed = ["help", "logout"];
      return allowed.includes(item.id);
    }
    return true;
  });



  // Logout Alert Dialog
  const {
    isOpen: isLogoutOpen,
    onOpen: onLogoutOpen,
    onClose: onLogoutClose,
  } = useDisclosure();
  const cancelRef = useRef();

  // const handleConfirmLogout = () => {
  //   onLogoutClose();
  //   navigate("/login");
  // };


  // derive activeKey and settingsOpen from the current route
  useEffect(() => {
    // top section
    if (pathname.startsWith("/dashboard")) {
      setActiveKey("home");
      setSettingsOpen(false);
      return;
    }
    if (pathname.startsWith("/inbox")) {
      setActiveKey("inbox");
      setSettingsOpen(false);
      return;
    }
    if (pathname.startsWith("/performanceManagement")) {
      setActiveKey("performance");
      setSettingsOpen(false);
      return;
    }
    if (pathname.startsWith("/payroll")) {
      setActiveKey("payroll");
      setSettingsOpen(false);
      return;
    }
    if (pathname.startsWith("/help")) {
      setActiveKey("help");
      setSettingsOpen(false);
      return;
    }
    if (pathname.startsWith("/reports")) {
      setActiveKey("reports");
      setSettingsOpen(false);
      return;
    }


    if (pathname.startsWith("/employee")) {
      setActiveKey("employees");
      setSettingsOpen(false);
      return;
    }

    if (pathname.startsWith("/asset-management")) {
      setActiveKey("assets");
      setSettingsOpen(false);
      return;
    }
    if (pathname.startsWith("/attendances")) {
      setActiveKey("attendance");
      setSettingsOpen(false);
      return;
    }
    if (pathname.startsWith("/leaves")) {
      setActiveKey("leave-tracker");
      setSettingsOpen(false);
      return;
    }
    if (pathname.startsWith("/hrpolicies")) {
      setActiveKey("hrpoliciesEmployee");
      setSettingsOpen(false);
      return;
    }
    // hrpoliciesEmployee

    // any settings route should open settings
    if (pathname.startsWith("/settings")) {
      setSettingsOpen(true);

      // pick a specific settings sub-item if it matches
      const matchedSubItem = settingsSubItems
        .slice()
        .sort((a, b) => b.path.length - a.path.length)
        .find((sub) => pathname.startsWith(sub.path));

      if (matchedSubItem) {
        setActiveKey(matchedSubItem.id);
      } else {
        // generic settings page fallback
        setActiveKey("settings:organization");
      }
      return;
    }
    if (pathname.startsWith("/settings/AttendanceTrackerSetting")) {
      setSettingsOpen(true);

      // pick a specific settings sub-item if it matches
      const matchedSubItem = settingsSubItems
        .slice()
        .sort((a, b) => b.path.length - a.path.length)
        .find((sub) => pathname.startsWith(sub.path));

      if (matchedSubItem) {
        setActiveKey(matchedSubItem.id);
      } else {
        // generic settings page fallback
        setActiveKey("settings:attendance");
      }
      return;
    }

    // default: nothing active if route doesn't match
    setActiveKey(null);
    setSettingsOpen(false);
  }, [pathname]);

  const handleTopClick = (item) => {
    setActiveKey(item.id);
    setSettingsOpen(false);
    if (item.path) {
      navigate(item.path);
    }
  };
  const handleConfirmLogout = () => {
    onLogoutClose();   // dialog close
    handleLogout();   // actual logout logic
  };


  // const prefetchRoute = (path) => {
  //   if (!path) return;

  //   try {
  //     if (path.startsWith("/dashboard")) import("../../pages/Dashboard");
  //     else if (path.startsWith("/employee")) import("../../pages/Employee");
  //     else if (path.startsWith("/asset-management")) import("../../pages/Assets");
  //     else if (path.startsWith("/attendances")) import("../../pages/AttendanceTracker");
  //     else if (path.startsWith("/leaves")) import("../../pages/LeaveTracker");
  //     else if (path.startsWith("/settings")) {
  //       import("../../pages/settings/OrganisationSettings");
  //       import("../../routes/settingsRoutes/leaveRoutes/LeavesRoutes");
  //       import("../../routes/settingsRoutes/employeeRoutes/SettingsDepartmentRoutes");
  //     }
  //   } catch (e) {
  //   }
  // };

  const handleSettingsClick = () => {
    const willOpen = !settingsOpen;
    setSettingsOpen(willOpen);
    // when user clicks settings, make the parent immediately active
    if (willOpen) {
      setActiveKey("settings");
    } else {
      // keep existing activeKey when closing (don't override a selected sub-route)
      setActiveKey((prev) => prev || "settings");
    }
  };

  const handleSettingsSubClick = (sub) => {
    setActiveKey(sub.id);
    if (sub.path) {
      navigate(sub.path);
    }
  };

  const handleBottomClick = (item) => {
    if (item.id === "settings") {
      handleSettingsClick();
      return;
    }

    if (item.id === "logout") {
      onLogoutOpen();
      return;
    }

    // handle Help or other bottom items
    setActiveKey(item.id);
    setSettingsOpen(false);
    if (item.path) {
      navigate(item.path);
    }
  };

  const isSettingsItemActive =
    activeKey === "settings" ||
    (activeKey && activeKey.startsWith("settings:"));
  // const handleLogout = () => {
  //   // dispatch(logout());
  //   Cookies.remove("auth_token");
  //   Cookies.remove("auth_user");
  //   navigate("/", { replace: true });
  // };

  // const handleLogout = () => {
  //   dispatch(logout());
  //   navigate("/", { replace: true });
  // };
  const handleLogout = async () => {
    await dispatch(signOutThunk(false));
    dispatch(clearOrganizationSetup());
    navigate("/", { replace: true });
  };

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile) */}
      <Box
        // w={isCollapsed ? "5%" : "22.5%"}
                w={isCollapsed ? "5%" : "23.8%"}

        h={
          // user?.is_admin ? "90vh" : "65vh"
        isAdmin ? "90vh" : "65vh"
        }
        // bg="white"
        bg={navBg}
        display={{ base: "none", md: "flex" }}
        flexDirection="column"
        justifyContent="space-between"
        borderRadius="14px"
        ml={3}
        mt={3}
        transition="width 0.3s ease"
        border={"1px solid #cccccc"}
        overflowY="auto"

        sx={{
          "&::-webkit-scrollbar": {
            width: "0px",         // ✅ Scrollbar hide
          },
          "&::-webkit-scrollbar-thumb": {
            background: "transparent",
          },
          scrollbarWidth: "none", // Firefox
          msOverflowStyle: "none" // IE
        }}
      >
        {/* Collapse/Expand Button */}
        <Flex justify={isCollapsed ? "center" : "flex-end"} p={2}>
          <IconButton
            size="md"
            aria-label="Toggle Sidebar"
            icon={isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            onClick={() => setIsCollapsed(!isCollapsed)}
            // bg={"white"}
            bg={navBg}
          />
        </Flex>

        {/* Top Section */}
        <Box width={"100%"} mt={-4}>
          <VStack align="stretch" spacing={2} m={3}>
            {/* {menuItemsTop.map((item) => { */}
            {filteredTopMenu.map((item) => {
              const isActive = activeKey === item.id;

              return (
                <Flex
                  key={item.id}
                  align="center"
                  p={3}
                  borderRadius="md"
                  bg={isActive ? "#1A365D" : "transparent"}
                  // color={isActive ? "white" : "black"}
                  color={isActive ? activeTextColor : inactiveTextColor}
                  _hover={{
                    bg: isActive ? "#1A365D" : "gray.100",
                    color: isActive ? '#fff' : '#000',
                  }}
                  cursor="pointer"
                  onClick={() => handleTopClick(item)}
                  // onMouseEnter={() => prefetchRoute(item.path)}
                  justify={isCollapsed ? "center" : "flex-start"}
                  pl={isCollapsed ? 2 : 12}
                >
                  <Image
                    src={isActive ? item.activeIcon : item.inactiveIcon}
                    alt={item.label}
                    boxSize="20px"
                    mr={isCollapsed ? 0 : 3}
                  />
                  {!isCollapsed && (
                    <Text
                      fontSize="small"
                      fontWeight="600"
                      fontFamily="'Poppins', sans-serif"
                    >
                      {item.label}
                    </Text>
                  )}
                </Flex>
              );
            })}
          </VStack>
        </Box>

        {/* Bottom Section */}
        <Box>
          <Divider mb={3} />
          <VStack align="stretch" spacing={2} m={3} pb={50}>
            {/* {menuItemsBottom.map((item, index) => { */}
            {filteredBottomMenu?.map((item, index) => {
              if (item.id === "settings") {
                return (
                  <Box key={item.id}>
                    {isCollapsed ? (
                      <Popover placement="right-start" closeOnBlur>
                        <PopoverTrigger>
                          <Flex
                            as="button"
                            align="center"
                            justify="center"
                            w="100%" // 👈 make it span full row
                            p={3}
                            borderRadius="md"
                            cursor="pointer"
                            bg={
                              isSettingsItemActive ? "#1A365D" : "transparent"
                            }
                            color={isSettingsItemActive ? "white" : "black"}
                            _hover={{
                              bg: isSettingsItemActive ? "#1A365D" : "gray.100",
                            }}
                          >
                            <Image
                              src={
                                isSettingsItemActive
                                  ? item.activeIcon
                                  : item.inactiveIcon
                              }
                              alt={item.label}
                              boxSize="20px"
                            />
                          </Flex>
                        </PopoverTrigger>

                        <PopoverContent
                          w="220px"
                          borderRadius="8px"
                          _focus={{ boxShadow: "none" }}
                        >
                          <PopoverArrow />
                          <PopoverBody p={2}>
                            <VStack spacing={1} align="stretch">
                              {settingsSubItems.map((sub) => {
                                const isSubActive = activeKey === sub.id;

                                return (
                                  <Box
                                    key={sub.id}
                                    px={3}
                                    py={2}
                                    borderRadius="md"
                                    bg={isSubActive ? "#1A365D" : "white"}
                                    _hover={{
                                      bg: isSubActive ? "#1A365D" : "gray.50",
                                    }}
                                    cursor="pointer"
                                    // onMouseEnter={() => prefetchRoute(sub.path)}
                                    onClick={() => {
                                      handleSettingsSubClick(sub);
                                    }}
                                  >
                                    <Text
                                      fontSize="sm"
                                      fontWeight={
                                        isSubActive ? "semibold" : "500"
                                      }
                                      color={isSubActive ? "white" : "black"}
                                    >
                                      {sub.label}
                                    </Text>
                                  </Box>
                                );
                              })}
                            </VStack>
                          </PopoverBody>
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <>
                        <Flex
                          align="center"
                          p={3}
                          borderRadius="md"
                          cursor="pointer"
                          justify={isCollapsed ? "center" : "space-between"}
                          bg={isSettingsItemActive ? "#1A365D" : "transparent"}
                          color={isSettingsItemActive ? "white" : "black"}
                          _hover={{
                            bg: isSettingsItemActive ? "#1A365D" : "gray.100",
                          }}
                          onClick={handleSettingsClick}
                          pl={isCollapsed ? 2 : 12}
                        >
                          <Flex
                            align="center"
                            justify={isCollapsed ? "center" : "flex-start"}
                          >
                            <Image
                              src={
                                isSettingsItemActive
                                  ? item.activeIcon
                                  : item.inactiveIcon
                              }
                              alt={item.label}
                              boxSize="20px"
                              mr={isCollapsed ? 0 : 3}
                            />
                            {!isCollapsed && (
                              <Text
                                fontSize="small"
                                fontWeight="550"
                                fontFamily="'Poppins', sans-serif"
                                // color={textClr}
                                color={isSettingsItemActive ? settingsActiveText : settingsInactiveText}
                              >
                                {item.label}
                              </Text>
                            )}
                          </Flex>

                          {!isCollapsed && (
                            <Box>
                              {settingsOpen ? (
                                <ChevronUpIcon />
                              ) : (
                                <ChevronDownIcon />
                              )}
                            </Box>
                          )}
                        </Flex>

                        {!isCollapsed && settingsOpen && (
                          <Box
                            mt={2}
                            borderRadius="7px"
                            // bg="white"
                            bg={navBg}
                            p={3}
                            border={"1px solid #cccccc"}
                          >
                            <VStack spacing={3} align="stretch">
                              {settingsSubItems?.map((sub) => {
                                const isSubActive = activeKey === sub.id;
                                return (
                                  <Flex
                                    key={sub.id}
                                    align="center"
                                    justify="flex-start"
                                  >
                                    <Box
                                      w="100%"
                                      px={3}
                                      py={2}
                                      borderRadius="md"
                                      // bg={isSubActive ? "#1A365D" : "white"}
                                      bg={isSubActive ? subActiveBg : subInactiveBg}

                                      // ✅ Two validation text color
                                      color={isSubActive ? subActiveText : subInactiveText}
                                      cursor="pointer"
                                      // onMouseEnter={() => prefetchRoute(sub.path)}
                                      onClick={() =>
                                        handleSettingsSubClick(sub)
                                      }
                                    >
                                      <Text
                                        fontSize="small"
                                        // color={isSubActive ? "white" : "black"}
                                        color={isSubActive ? subActiveText : subInactiveText}
                                        fontWeight={
                                          isSubActive ? "semibold" : "semibold"
                                        }
                                        pl={8}
                                      >
                                        {sub.label}
                                      </Text>
                                    </Box>
                                  </Flex>
                                );
                              })}
                            </VStack>
                          </Box>
                        )}
                      </>
                    )}
                  </Box>
                );
              }

              const isActive = activeKey === item.id;

              return (
                <Flex
                  key={item.id}
                  align="center"
                  p={3}
                  borderRadius="md"
                  cursor="pointer"
                  justify={isCollapsed ? "center" : "flex-start"}
                  bg={isActive ? "#1A365D" : "transparent"}
                  // color={isActive ? "white" : "black"}
                  color={isActive ? activeTextColor : inactiveTextColor}

                  _hover={{ bg: isActive ? "#1A365D" : "gray.100" }}
                  // onClick={() => handleBottomClick(item)}
                  // onClick={() => {
                  //   if (item.id === "logout") {
                  //     handleLogout();
                  //   } else {
                  //     handleBottomClick(item);
                  //   }
                  // }}
                  onClick={() => {
                    if (item.id === "logout") {
                      onLogoutOpen();
                    } else {
                      handleBottomClick(item);
                    }
                  }}

                  pl={isCollapsed ? 2 : 12}
                >
                  <Image
                    src={isActive ? item.activeIcon : item.inactiveIcon}
                    alt={item.label}
                    boxSize="20px"
                    mr={isCollapsed ? 0 : 3}
                  />
                  {!isCollapsed && (
                    <Text
                      fontSize="small"
                      fontWeight="550"
                      fontFamily="'Poppins', sans-serif"
                    >
                      {item.label}
                    </Text>
                  )}
                </Flex>
              );
            })}
          </VStack>

        </Box>

      </Box>

      {/* Mobile Drawer - shows full menu on small screens */}
      <Drawer
        isOpen={!!mobileOpen}
        placement="left"
        onClose={() => setMobileOpen && setMobileOpen(false)}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Menu</DrawerHeader>
          <DrawerBody>
            <VStack align="stretch" spacing={2} mt={2}>
              {menuItemsTop.map((item) => {
                const isActive = activeKey === item.id;

                return (
                  <Flex
                    key={item.id}
                    align="center"
                    p={3}
                    borderRadius="md"
                    bg={isActive ? "#1A365D" : "transparent"}
                    // color={isActive ? "white" : "black"}
                    color={isActive ? activeTextColor : inactiveTextColor}
                    _hover={{
                      bg: isActive ? "#1A365D" : "gray.100",
                    }}
                    cursor="pointer"
                    //  onMouseEnter={() => prefetchRoute(item.path)} 
                     onClick={() => {
                      handleTopClick(item);
                      setMobileOpen && setMobileOpen(false);
                    }}
                  >
                    <Image
                      src={isActive ? item.activeIcon : item.inactiveIcon}
                      alt={item.label}
                      boxSize="20px"
                      mr={3}
                    />
                    <Text fontSize="sm" fontWeight="medium">
                      {item.label}
                    </Text>
                  </Flex>
                );
              })}

              <Divider />

              {menuItemsBottom?.map((item) => {
                if (item.id === "settings") {
                  return (
                    <Box key={item.id}>
                      <Flex
                        align="center"
                        p={3}
                        borderRadius="md"
                        cursor="pointer"
                        onClick={() => {
                          handleSettingsClick();
                        }}
                        justify="flex-start"
                      >
                        <Image
                          src={
                            isSettingsItemActive
                              ? item.activeIcon
                              : item.inactiveIcon
                          }
                          alt={item.label}
                          boxSize="20px"
                          mr={3}
                        />
                        <Text fontSize="sm" fontWeight="medium">
                          {item.label}
                        </Text>
                      </Flex>

                      {settingsOpen && (
                        <VStack spacing={2} align="stretch" pl={6} mt={2}>
                          {settingsSubItems.map((sub) => {
                            const isSubActive = activeKey === sub.id;

                            return (
                              <Text
                                key={sub.id}
                                cursor="pointer"
                                fontSize="sm"
                                fontWeight={isSubActive ? "semibold" : "normal"}
                                color={isSubActive ? "blue.600" : "gray.700"}
                                onClick={() => {
                                  handleSettingsSubClick(sub);
                                  setMobileOpen && setMobileOpen(false);
                                }}
                              >
                                {sub.label}
                              </Text>
                            );
                          })}
                        </VStack>
                      )}
                    </Box>
                  );
                }

                const isActive = activeKey === item.id;

                return (
                  <Flex
                    key={item.id}
                    align="center"
                    p={3}
                    borderRadius="md"
                    cursor="pointer" 
                    // onMouseEnter={() => prefetchRoute(item.path)} 
                    justify="flex-start"
                    onClick={() => {
                      handleBottomClick(item);
                      setMobileOpen && setMobileOpen(false);
                    }}
                  >
                    <Image
                      src={isActive ? item.activeIcon : item.inactiveIcon}
                      alt={item.label}
                      boxSize="20px"
                      mr={3}
                    />
                    <Text fontSize="sm" fontWeight="medium">
                      {item.label}
                    </Text>
                  </Flex>
                );
              })}
            </VStack>
          </DrawerBody>
        </DrawerContent>

      </Drawer>

      {/* Logout Confirmation Dialog */}
      <AlertDialog
        isOpen={isLogoutOpen}
        leastDestructiveRef={cancelRef}
        onClose={onLogoutClose}
        isCentered
      >
        <AlertDialogOverlay bg="blackAlpha.400" backdropFilter="blur(2px)">
          <AlertDialogContent
            borderRadius="md"
            boxShadow="lg"
            border="1px solid"
            borderColor="gray.200"
            // bg="white"
            bg={navBg}
          >
            <AlertDialogHeader
              fontSize="lg"
              fontWeight="600"
              // borderBottom="1px solid"
              borderColor="gray.100"
              fontFamily={"Poppins"}
            >
              Confirm Logout
            </AlertDialogHeader>

            <AlertDialogBody
              fontSize="sm"
              color="gray.700"
              py={4}
              fontFamily={"Poppins"}
            >
              Are you sure you want to log out?
            </AlertDialogBody>

            <AlertDialogFooter gap={3} borderColor="gray.100">
              <Button
                ref={cancelRef}
                onClick={onLogoutClose}
                border={"1px solid #cccccc"}
                variant="outline"
                size="sm"
                fontFamily={"Poppins"}
              >
                Cancel
              </Button>

              <Button
                // colorScheme="red"
                _hover={{ bg: "blue.800", color: "white" }}
                border={"1px solid #cccccc"}
                // bg={"white"}
                bg={navBg}
                onClick={handleConfirmLogout}
                size="sm"
                fontFamily={"Poppins"}
              >
                Logout
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}
