import { isAdminUser } from "../../utils/roles";
import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Flex,
  Text,
  InputGroup,
  InputLeftElement,
  Input,
  Image,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  useDisclosure,
  Tag,
  useToast,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  useMediaQuery,
  useColorModeValue,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import searchIcon from "../../assets/search_icon2.svg";
import bellIcon from "../../assets/bell_icon.svg";
import chevronDown from "../../assets/mingcute_down-line.png";
import avatar_img from "../../assets/avatar_img.png";
import nav_logo from "../../assets/nav_logo.png";
import NotificationsDropdown from "./NotificationsDropdown";
import { decodeTokenPayload, getEmpCode } from "../../utils/token";
import ProfileSettingsModal from "./ProfileSettingsModal";
import { useSelector, useDispatch } from "react-redux";
import api from "../../api/axios";
import { useLocation, useNavigate } from "react-router-dom";
import { logout, setPunchStatus } from "../../slices/authSlice";
import Cookies from "js-cookie";

// const SESSION_CHECK_IN_TIME = "check_in_time";
// const SESSION_IS_CHECKED_IN = "is_checked_in";
// const SESSION_ELAPSED_SECONDS = "elapsed_seconds";

export default function Dashboard_Navbar({
  setMobileOpen,
  onAttendanceChange,
}) {
  const navBg = useColorModeValue("white", "#000");
  const borderClr = useColorModeValue("#cccccc", "gray.700");
  const textClr = useColorModeValue("black", "white");
  const subTextClr = useColorModeValue("#757575", "gray.400");
  const payload = typeof window !== "undefined" ? decodeTokenPayload() : null;
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [userProfile, setUserProfile] = useState(null);
  const timerRef = useRef(null);
  const timerBaseRef = useRef({
    completedSeconds: 0,
    activeCheckInMs: null,
    serverOffsetMs: 0,
    timerStopsAtMs: null,
  });
  const { user, token, loading, punchStatus } = useSelector(
    (state) => state.auth,
  );
  console.log("rrrrr", user);
  const toast = useToast();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cancelRef = useRef();
  const location = useLocation();
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [attendanceData, setAttendanceData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [settingsData, setSettingsData] = useState(null);
  const [isPunchProcessing, setIsPunchProcessing] = useState(false);
  const [isMobile, isTablet, isDesktop, isLargeScreen] = useMediaQuery([
    "(max-width: 480px)",
    "(min-width: 481px) and (max-width: 768px)",
    "(min-width: 769px) and (max-width: 1200px)", // desktop
    "(min-width: 1201px)",
  ]);

  // useEffect(() => {
  //   const isChecked = sessionStorage.getItem(SESSION_IS_CHECKED_IN);
  //   const storedSeconds = sessionStorage.getItem(SESSION_ELAPSED_SECONDS);
  //   const checkInTime = sessionStorage.getItem(SESSION_CHECK_IN_TIME);

  //   if (storedSeconds) {
  //     setSeconds(parseInt(storedSeconds, 10));
  //   }

  //   if (isChecked === "true" && checkInTime) {
  //     const startTime = parseInt(checkInTime, 10);
  //     const now = Date.now();
  //     const elapsedFromLastCheckIn = Math.floor((now - startTime) / 1000);

  //     setSeconds((prev) => prev + elapsedFromLastCheckIn);
  //     setIsCheckedIn(true);
  //     startTimer();
  //   } else {
  //     setIsCheckedIn(false);
  //   }

  //   return () => stopTimer();
  // }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchSettings();
  }, []);

  useEffect(() => {
    if (!user?.employee_id || isAdminUser(user)) return;

    let cancelled = false;

    const fetchPunchStatus = async () => {
      try {
        const res = await api.get("/attendance/punch_status", {
          params: {
            employee_id: user.employee_id,
          },
        });

        if (cancelled) return;

        console.log("Punch status response:", res.data);

        // const status = Number(
        //   res?.data?.data?.punch_status ?? res?.data?.punch_status,
        // );

        // if (status === 1 || status === 2) {
        //   dispatch(setPunchStatus(status));
        // }

        const punchData = res?.data?.data;

        if (punchData) {
          syncPunchTimer(punchData);
        }

      } catch (error) {
        console.error("Failed to fetch punch status:", error);
      }
    };

    fetchPunchStatus();

    return () => {
      cancelled = true;
    };
  }, [user?.employee_id, dispatch]);

  const fetchProfile = async () => {
    try {
      const employeeId = getEmpCode();
      const url = `/employee/get_admin_detail?employee_id=${employeeId}`;
      const res = await api.get(url);

      const data = res?.data?.result || {};
      setUserProfile(data);
    } catch (err) {
      console.error("Failed to fetch profile", err);
    }
  };

  const fetchSettings = async () => {
    try {
      const url = `attendance/get_attendance_setting?organisation_id=${user?.organisation_id}`;
      console.log("sd", url);
      const res = await api.get(url);
      setSettingsData(res.data?.data);
      // setAllowWeb(res.data?.data?.allow_web_checkin);
      // setMandatoryCheckout(res.data?.data?.mandatory_checkout);
      // // setLateMode(res.data?.data?.late_mark_mode);
      // setLateMode(LATE_MODE_UI_MAP[res.data?.data?.late_mark_mode]);
    } catch (err) {
      console.error("Error fetching attendance settings:", err);
    }
  };

  const getAttendanceHistorData = async (
    page = 1,
    month = selectedMonth,
    year = selectedYear,
  ) => {
    try {
      const res = await api.get(`/attendance/get_my_attendance_history`, {
        params: {
          employee_id: user?.employee_id,
          month,
          year,
          page,
          limit: 6,
        },
      });
      const data = res?.data;

      setAttendanceData(data?.data || []);
      setTotalPages(data?.pagination?.total_pages || 1);
    } catch (error) {
      console.error("Error fetching attendance history:", error);
    }
  };


  // const handleCheckToggle = async () => {
  //   if (isPunchProcessing) return;

  //   if (punchStatus !== 1 && punchStatus !== 2) return;

  //   setIsPunchProcessing(true);

  //   try {
  //     if (punchStatus === 1) {
  //       const success = await handleCheckInCheckOut("check_out");

  //       if (!success) return;

  //       dispatch(setPunchStatus(2));

  //       stopTimer();
  //       setIsCheckedIn(false);

  //       sessionStorage.setItem(SESSION_ELAPSED_SECONDS, seconds.toString());

  //       sessionStorage.removeItem(SESSION_CHECK_IN_TIME);
  //       sessionStorage.setItem(SESSION_IS_CHECKED_IN, "false");
  //     } else if (punchStatus === 2) {

  //       const success = await handleCheckInCheckOut("check_in");

  //       if (!success) return;

  //       dispatch(setPunchStatus(1));

  //       const now = Date.now();

  //       sessionStorage.setItem(SESSION_CHECK_IN_TIME, now.toString());

  //       sessionStorage.setItem(SESSION_IS_CHECKED_IN, "true");
  //       sessionStorage.setItem(SESSION_ELAPSED_SECONDS, "0");

  //       setSeconds(0);
  //       setIsCheckedIn(true);
  //       startTimer();
  //     }
  //   } finally {
  //     setIsPunchProcessing(false);
  //   }
  // };
   

  const handleCheckToggle = async () => {
  if (isPunchProcessing) return;
  if (punchStatus !== 1 && punchStatus !== 2) return;

  setIsPunchProcessing(true);

  try {
    const action = punchStatus === 1 ? "check_out" : "check_in";

    const result = await handleCheckInCheckOut(action);

    if (!result) return;

    if (result.punch_status) {
      syncPunchTimer(result);
    } else {
      const res = await api.get("/attendance/punch_status", {
        params: {
          employee_id: user?.employee_id,
        },
      });

      syncPunchTimer(res?.data?.data);
    }
  } finally {
    setIsPunchProcessing(false);
  }
};
  
  
  const handleConfirmLogout = () => {
    onLogoutClose();
    handleLogout();
  };
  // const handleLogout = () => {
  //   // 1. Redux clear
  //   dispatch(logout());

  //   // 2. LocalStorage clear
  //   localStorage.removeItem("token");
  //   localStorage.removeItem("user");

  //   // 3. Cookies clear (🔥 THIS WAS MISSING)
  //   Cookies.remove("auth_token");

  //   // 4. Navigate to login
  //   navigate("/", { replace: true });
  // };
  const handleLogout = () => {
    stopTimer();
    setSeconds(0);
    setIsCheckedIn(false);
    sessionStorage.clear();

    dispatch(logout());
    localStorage.clear();
    Cookies.remove("auth_token");
    localStorage.removeItem("org_code");

    toast({
      title: "Logged out successfully",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    navigate("/", { replace: true });
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const formatTime = (totalSeconds) => {
    const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
      2,
      "0",
    );
    const secs = String(totalSeconds % 60).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  const syncPunchTimer = (data) => {
    if (!data) return;

    const checkedIn = data.punch_status === "CHECKED_IN";

    const serverMs = Date.parse(data.server_time);

    const serverOffsetMs = Number.isFinite(serverMs)
      ? serverMs - Date.now()
      : 0;

    timerBaseRef.current = {
      completedSeconds: Math.max(
        0,
        Number(data.completed_work_seconds ?? data.total_work_seconds) || 0,
      ),
      activeCheckInMs: data.active_check_in_time
        ? Date.parse(data.active_check_in_time)
        : null,
      serverOffsetMs,
      timerStopsAtMs: data.timer_stops_at
        ? Date.parse(data.timer_stops_at)
        : null,
    };

    dispatch(setPunchStatus(checkedIn ? 1 : 2));
    setIsCheckedIn(checkedIn);

    stopTimer();

    const updateTimer = () => {
      const {
        completedSeconds,
        activeCheckInMs,
        serverOffsetMs,
        timerStopsAtMs,
      } = timerBaseRef.current;

      const now = Date.now() + serverOffsetMs;

      const effectiveNow = Number.isFinite(timerStopsAtMs)
        ? Math.min(now, timerStopsAtMs)
        : now;

      const activeSeconds =
        checkedIn && data.timer_running && Number.isFinite(activeCheckInMs)
          ? Math.max(0, Math.floor((effectiveNow - activeCheckInMs) / 1000))
          : 0;

      setSeconds(completedSeconds + activeSeconds);

      if (Number.isFinite(timerStopsAtMs) && now >= timerStopsAtMs) {
        stopTimer();
      }
    };

    updateTimer();

    if (checkedIn && data.timer_running) {
      timerRef.current = setInterval(updateTimer, 1000);
    }
  };

  // const startTimer = () => {
  //   if (timerRef.current) return;
  //   timerRef.current = setInterval(() => {
  //     setSeconds((prev) => prev + 1);
  //   }, 1000);
  // };

  const {
    isOpen: isProfileOpen,
    onOpen: onProfileOpen,
    onClose: onProfileClose,
  } = useDisclosure();
  const {
    isOpen: isLogoutOpen,
    onOpen: onLogoutOpen,
    onClose: onLogoutClose,
  } = useDisclosure();

  const getFirstName = () => {
    return (
      (payload && (payload.first_name || payload.firstName)) ||
      (payload && payload.full_name ? payload.full_name.split(" ")[0] : null) ||
      (userProfile && (userProfile.first_name || userProfile.firstName)) ||
      "User"
    );
  };

  const getFullName = () => {
    if (payload && (payload.full_name || payload.fullName)) {
      return payload.full_name || payload.fullName;
    }
    const parts = [
      payload?.first_name ||
        payload?.firstName ||
        userProfile?.first_name ||
        userProfile?.firstName ||
        "",
      payload?.middle_name ||
        payload?.midlle_name ||
        userProfile?.middle_name ||
        userProfile?.midlle_name ||
        "",
      payload?.last_name ||
        payload?.lastName ||
        userProfile?.last_name ||
        userProfile?.lastName ||
        "",
    ].filter(Boolean);
    return parts.length ? parts.join(" ") : "User";
  };

  const firstName = getFirstName();
  const fullName = getFullName();

  // const handleCheckInCheckOut = async (action) => {
  //   try {
  //     const body = {
  //       employee_id: user?.employee_id,
  //     };

  //     const punchRes = await api.post("/attendance/punch", body);

  //     const commandId = punchRes?.data?.command_id;

  //     if (!commandId) {
  //       throw new Error("Command ID missing from punch response");
  //     }

  //     const commandRes = await api.get(
  //       `/schedules/commands/${encodeURIComponent(commandId)}`,
  //       {
  //         params: {
  //           organisation_id: user?.organisation_id,
  //         },
  //       },
  //     );

  //     console.log("Command response:", commandRes.data);

  //     toast({
  //       title:
  //         action === "check_in"
  //           ? "Check In successfully"
  //           : "Check Out successfully",
  //       status: "success",
  //       duration: 3000,
  //       isClosable: true,
  //     });
  //     // getAttendanceHistorData();
  //     onAttendanceChange();
  //     // setTimeout(() => {
  //     //   window.location.reload();
  //     // }, 800);

  //     return true; // ✅ SUCCESS
  //   } catch (err) {
  //     toast({
  //       title: "Attendance Failed",
  //       description: err?.response?.data?.msg || "Invalid request",
  //       status: "error",
  //       duration: 4000,
  //       isClosable: true,
  //     });

  //     return false; // ❌ FAILURE
  //   }
  // };

  const handleCheckInCheckOut = async (action) => {
    try {
      const body = {
        employee_id: user?.employee_id,
      };

      const punchRes = await api.post("/attendance/punch", body);

      const commandId = punchRes?.data?.command_id;

      if (!commandId) {
        throw new Error("Command ID missing from punch response");
      }

      const MAX_ATTEMPTS = 10;
      const POLL_INTERVAL = 1500;

      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        const commandRes = await api.get(
          `/schedules/commands/${encodeURIComponent(commandId)}`,
          {
            params: {
              organisation_id: user?.organisation_id,
            },
          },
        );

        const commandData = commandRes?.data?.data;
        const commandStatus = String(commandData?.status || "").toUpperCase();

        if (commandStatus === "FAILED") {
          throw new Error(
            commandData?.error?.message || "Attendance punch failed",
          );
        }

        if (commandStatus === "COMPLETED" || commandStatus === "SUCCESS") {
          toast({
            title:
              action === "check_in"
                ? "Check In successfully"
                : "Check Out successfully",
            status: "success",
            duration: 3000,
            isClosable: true,
          });

          onAttendanceChange?.();

          // return true;
          return commandData.result || true;
        }

        if (
          commandStatus !== "QUEUED" &&
          commandStatus !== "PROCESSING" &&
          commandStatus !== "PENDING"
        ) {
          throw new Error(
            `Unexpected punch status: ${commandStatus || "UNKNOWN"}`,
          );
        }

        if (attempt < MAX_ATTEMPTS - 1) {
          await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
        }
      }

      throw new Error(
        "Punch is still processing. Please refresh your attendance status.",
      );
    } catch (err) {
      toast({
        title: "Attendance Failed",
        description:
          err?.response?.data?.data?.error?.message ||
          err?.response?.data?.msg ||
          err?.message ||
          "Invalid request",
        status: "error",
        duration: 4000,
        isClosable: true,
      });

      return false;
    }
  };

  return (
    <Box w="100%">
      <Flex
        direction={{ base: "column", md: "row" }}
        align="stretch"
        gap={3}
        px={0}
      >
        {/* LEFT: Logo card (separate entity) */}
        <Box
          // ml={{ base: 0, md: 4 }}
          ml={isMobile ? "1.9vw" : 3}
          mt={{ base: 4, md: 3 }}
          h={{ base: "56px", md: "70px" }}
          // w={{ base: "100%", md: "21.4%" }}
          w={isMobile ? "96%" : isTablet ? "97%" : isDesktop ? "25%" : "22.4%"}
          display="flex"
          alignItems="center"
          justifyContent="center"
          px={4}
          bg={navBg}
          boxShadow="sm"
          borderRadius={"14px"}
          border={"1px solid #cccccc"}
        >
          <Image
            src={nav_logo}
            alt="Logo"
            maxH={{ base: "40px", md: "48px" }}
            objectFit="contain"
            w="100%"
          />
        </Box>

        {/* RIGHT: Main navbar card */}
        <Flex
          flex="1"
          mt={{ base: 0, md: 3 }}
          mr={3}
          h={{ base: "auto", md: "70px" }}
          align="center"
          // bg="white"
          bg={navBg}
          boxShadow="sm"
          borderRadius={"14px"}
          px={{ base: 0, md: 4 }}
          py={{ base: 3, md: 0 }}
          border={"1px solid #cccccc"}
          w={isMobile ? "96%" : isTablet ? "97%" : isDesktop ? "100%" : "21.4%"}
          ml={isMobile ? "1.9vw" : isTablet ? 2 : isDesktop ? 0 : 0}
        >
          <Flex w="100%" align="center" gap={6} pr={3}>
            <Flex align="center" gap={2} flexShrink={0}>
              <IconButton
                display={{ base: "inline-flex", md: "none" }}
                aria-label="open menu"
                icon={<HamburgerIcon />}
                variant="ghost"
                onClick={() => setMobileOpen && setMobileOpen(true)}
              />
              <Text
                fontSize={{ base: "sm", md: "xl" }}
                fontFamily="'Poppins', sans-serif"
              >
                <Box
                  as="span"
                  color="#757575"
                  fontFamily="'Poppins', sans-serif"
                  fontWeight={400}
                  letterSpacing={"-0.3px"}
                >
                  Welcome,
                </Box>{" "}
                <Box
                  as="span"
                  fontWeight="600"
                  letterSpacing={"-0.3px"}
                  // color="#000000"
                  color={textClr}
                  fontFamily="'Poppins', sans-serif"
                >
                  {/* {firstName} */}
                  {userProfile?.first_name}
                </Box>
              </Text>
            </Flex>

            {/* Right side: bell + avatar + name */}
            <Flex
              align="center"
              gap={4}
              flexShrink={0}
              ml="auto"
              justify="flex-end"
              minW="0"
            >
              <Box
                flex="1"
                maxW="520px"
                minW={{
                  base: "auto",
                  xl: "350px",
                }}
                display={{ base: "none", md: "block" }}
                // mx={4}
              >
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Image
                      src={searchIcon}
                      alt="search"
                      boxSize="16px"
                      color={"#757575"}
                    />
                  </InputLeftElement>
                  <Input
                    placeholder="Search"
                    borderRadius={8}
                    fontSize="sm"
                    _placeholder={{
                      color: "gray.400",
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  />
                </InputGroup>
              </Box>
              {!isAdminUser(user) &&
                // user?.punch_status === 1
                (punchStatus === 1 || punchStatus === 2) &&
                settingsData?.allow_web_checkin && (
                  <>
                    <Tag
                      cursor="pointer"
                      onClick={handleCheckToggle}
                      bg="#FFF"
                      color={punchStatus === 1 ? "#EE5D50" : "#43aa41ff"}
                      borderRadius="8px"
                      fontWeight="600"
                      borderWidth="1px"
                      h={10}
                      w={120}
                      justifyContent="center"
                      borderColor={punchStatus === 1 ? "#EE5D50" : "#4e9d49ff"}
                      fontFamily={"Poppins"}
                    >
                      {/* {isCheckedIn
                      ? `${formatTime(seconds)}  Check Out`
                      : `${seconds > 0 ? formatTime(seconds) + "  " : ""
                      }Check In`} */}
                      {isPunchProcessing
                        ? "Processing..."
                        : punchStatus === 1
                          ? "Check Out"
                          : "Check In"}
                    </Tag>
                    {/* {isCheckedIn && ( */}
                    {seconds !== 0 && (
                      <Tag
                        bg="#F6F6F6"
                        color="#000"
                        borderRadius="8px"
                        fontWeight="600"
                        borderWidth="1px"
                        h={10}
                        w={120}
                        justifyContent="center"
                        borderColor="#CACACA"
                      >
                        {formatTime(seconds)}
                      </Tag>
                    )}
                  </>
                )}

              {/* Bell with red dot */}
              {/* <Box position="relative">
                <IconButton
                  aria-label="notifications"
                  icon={<Image src={bellIcon} alt="bell" boxSize="20px" />}
                  bg="white"
                  borderRadius={7}
                  boxShadow="sm"
                  size="md"
                  p={2}
                  border={"1px solid #cccccc"}
                />
                <Badge
                  position="absolute"
                  top="-4px"
                  right="-4px"
                  borderRadius="full"
                  boxSize="12px"
                  bg="red.500"
                  p={0}
                />
              </Box> */}
              <NotificationsDropdown />

              {/* Avatar + name */}
              <Flex
                gap={3}
                // bg="white"
                bg={navBg}
                // p={1}
                borderRadius={10}
                justify={"flex-end"}
                px={0}
                py={1}
                flexShrink={0}
              >
                <Menu>
                  <MenuButton
                    as={Button}
                    variant="ghost"
                    bg="transparent"
                    p={0}
                    px={0}
                    minW={0}
                    height="auto"
                    _hover={{ bg: "transparent" }}
                    _active={{ bg: "transparent" }}
                    _focusVisible={{ boxShadow: "none" }}
                  >
                    <Image
                      src={avatar_img}
                      alt="avatar"
                      boxSize={{ base: "32px", md: "40px" }}
                      objectFit="cover"
                      flexShrink={0}
                    />
                  </MenuButton>

                  <MenuList
                    borderRadius="12px"
                    boxShadow="xl"
                    minW="200px"
                    p={0}
                    overflow="hidden"
                  >
                    <Box
                      px={4}
                      py={3}
                      borderBottom="1px solid"
                      borderColor="gray.100"
                    >
                      <Text
                        fontSize="sm"
                        fontWeight="600"
                        fontFamily="'Poppins', sans-serif"
                        color="gray.800"
                        whiteSpace="nowrap"
                      >
                        {fullName}
                      </Text>
                    </Box>

                    <MenuItem
                      onClick={onProfileOpen}
                      fontFamily="Poppins"
                      fontSize="sm"
                      py={2.5}
                      _hover={{ bg: "gray.50" }}
                    >
                      Profile
                    </MenuItem>

                    {/* <MenuItem
                      onClick={() => navigate("/account/security")}
                      fontFamily="Poppins"
                      fontSize="sm"
                      py={2.5}
                    >
                      Account security
                    </MenuItem> */}

                    <MenuItem
                      onClick={onLogoutOpen}
                      fontFamily="Poppins"
                      fontSize="sm"
                      py={2.5}
                      color="red.500"
                      _hover={{ bg: "red.50" }}
                    >
                      Logout
                    </MenuItem>
                  </MenuList>
                </Menu>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
      <ProfileSettingsModal isOpen={isProfileOpen} onClose={onProfileClose} />
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
            bg="white"
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
                bg={"white"}
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
    </Box>
  );
}
