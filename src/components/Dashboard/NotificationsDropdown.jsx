import { isAdminUser } from "../../utils/roles";
import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Text,
  Menu,
  MenuButton,
  MenuList,
  IconButton,
  Image,
  useColorModeValue,
  Spinner,
  useToast,
  Badge,
  MenuItem,
} from "@chakra-ui/react";
import bellIcon from "../../assets/bell_icon.svg";
import { useSelector } from "react-redux";
import api from "../../api/axios";
import { getEmpCode, getOrgIdFromReduxOrStorage } from "../../utils/token";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

const decodeJwtPayload = (t) => {
  try {
    if (!t || typeof t !== "string") return null;
    const base64Url = t.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const jsonPayload = decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

const formatDateLine = (iso) => {
  const d = new Date(iso);
  const weekday = d.toLocaleDateString(undefined, { weekday: "long" });
  const day = d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const time = d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${weekday} — ${day} • ${time}`;
};

export default function NotificationsDropdown() {
  const navBg = useColorModeValue("white", "#000");
  const borderClr = useColorModeValue("#cccccc", "gray.700");
  const textClr = useColorModeValue("black", "white");
  const subTextClr = useColorModeValue("#757575", "gray.400");

  const { user } = useSelector((state) => state.auth);
  const toast = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  const navigate = useNavigate();
  //new
  // const handleNotificationClick = async (notif) => {
  //   setNotifications((prev) =>
  //   prev.map((n) =>
  //     n._id === notif._id ? { ...n, seen: true } : n
  //   )
  // );

  // setHasUnread(
  //   notifications.filter((n) => n._id !== notif._id).some((n) => !n.seen)
  // );
    
  // if (notif.module !== "announcement" || !notif.ref_id) {
  //   navigate(
  //     `/inbox?notificationId=${encodeURIComponent(
  //       notif._id,
  //     )}&refId=${encodeURIComponent(notif.ref_id || "")}`,
  //   );
  //   return;
  // }


  // if (
  //   notif.module === "announcement" 
  // ) {
  //   navigate(
  //     `/inbox?notificationId=${encodeURIComponent(
  //       notif._id,
  //     )}&refId=${encodeURIComponent(notif.ref_id)}`,
  //   );

  //   return;
  // }

  //   try {
  //     const orgId = getOrgIdFromReduxOrStorage(user);
  //     const employeeId = user?.employee_id;

  //     if (!orgId) {
  //       throw new Error("Organisation ID not found");
  //     }

  //     const params = new URLSearchParams();
  //     params.append("organisation_id", orgId);

  //     const isAdmin = Boolean(
  //       user?.is_admin ?? user?.isAdmin
  //     );

  //     if (isAdmin) {
  //       params.append("is_admin", "true");
  //     } else if (employeeId) {
  //       params.append("employee_id", employeeId);
  //     }

  //     const res = await api.get(
  //       `/announcement/get_all_announcements?${params.toString()}`
  //     );

  //     const announcements = Array.isArray(res?.data?.data)
  //       ? res.data.data
  //       : [];

  //     const announcementExists = announcements.some(
  //       (announcement) =>
  //         String(
  //           announcement?.announcement_id || announcement?.id
  //         ) === String(notif.ref_id)
  //     );

  //     if (!announcementExists) {
  //       toast({
  //         title: "Announcement not found",
  //         description:
  //           "This announcement may have been deleted or is no longer available.",
  //         status: "warning",
  //         duration: 3000,
  //         isClosable: true,
  //       });
  //       return;
  //     }

  //     navigate(
  //       `/dashboard?tab=Announcements&announcementId=${encodeURIComponent(
  //         notif.ref_id
  //       )}`
  //     );
  //   } catch (error) {
  //     console.error("Failed to validate announcement:", error);

  //     toast({
  //       title: "Announcement not found",
  //       description:
  //         "This announcement may have been deleted or is no longer available.",
  //       status: "warning",
  //       duration: 3000,
  //       isClosable: true,
  //     });
  //   }
  // };
  //new07
  const handleNotificationClick = async (notif) => {
  try {
    // Mark as read in backend
    if (!notif.seen) {
      await api.put(`/notification/mark_as_read/${notif._id}`);
    }

    // Remove red dot immediately
    setNotifications((prev) => {
      const updated = prev.map((n) =>
        n._id === notif._id ? { ...n, seen: true } : n
      );

      setHasUnread(updated.some((n) => !n.seen));

      return updated;
    });

    // Go to the exact notification in Inbox
    navigate(
      `/inbox?notificationId=${encodeURIComponent(
        notif._id
      )}&refId=${encodeURIComponent(notif.ref_id || "")}`
    );
  } catch (error) {
    console.error("Failed to mark notification as read:", error);

    toast({
      title: "Error updating notification",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
  }
};


  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const orgId = getOrgIdFromReduxOrStorage(user);

      if (!orgId) return;

      let isAdmin = isAdminUser(user);

      if (!isAdmin) {
        const token = Cookies.get("auth_token");
        if (token) {
          const decoded = decodeJwtPayload(token);
          isAdmin = decoded?.is_admin ?? decoded?.isAdmin ?? false;
        }
      }

      let queryUrl = `/notification/get_notifications?organisation_id=${orgId}&sort=-1`;

      if (isAdmin) {
        queryUrl += `&to=admin`;
      } else {
        const empCode = getEmpCode() || user?.emp_code || "";
        if (!empCode) return;
        queryUrl += `&to=${empCode}`;
      }

      const res = await api.get(queryUrl);

      if (res?.data?.success && Array.isArray(res.data.data)) {
        setNotifications(res.data.data);
        setHasUnread(res.data.data.some((n) => !n.seen));
      } else {
        setNotifications([]);
        setHasUnread(false);
      }
    } catch (err) {
      console.error(err);
      setNotifications([]);
      setHasUnread(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  const getNotificationIcon = (module) => {
    switch (module) {
      case "leave_tracker":
        return ">";
      case "asset_management":
        return ">";
      case "attendance":
        return ">";
      default:
        return ">";
    }
  };

  return (
    <Menu placement="bottom-end" closeOnSelect onOpen={fetchNotifications}
    >
      <MenuButton
        as={IconButton}
        aria-label="notifications"
        icon={
          <Box position="relative" display="inline-block">
            <Image
              src={bellIcon}
              alt="bell"
              boxSize={{ base: "18px", sm: "18px", md: "20px", lg: "22px" }}
              color={"#fff"}
            />
            {hasUnread && (
              <Box
                position="absolute"
                top="-6px"
                right="-6px"
                w="16px"
                h="16px"
                borderRadius="50%"
                bg="red.500"
                border="3px solid white"
              />
            )}
          </Box>
        }
        bg={navBg}
        borderRadius={7}
        boxShadow="sm"
        // size="md"
        // p={2}
        size={{ base: "sm", md: "md", lg: "xs" }}
        w={{ base: "36px", md: "45px", lg: "50px" }}
        h={{ base: "36px", md: "40px", lg: "50px" }}
        // p={0}
        border="1px solid #cccccc"
      />

      <MenuList
        p={0}
        borderRadius="16px"
        boxShadow="xl"
        minW="420px"
        maxW="420px"
        overflow="hidden"
      >
        {/* Header */}
        <Box
          px={4}
          py={3}
          borderBottom="1px solid #eee"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Text fontFamily="Poppins" fontWeight="600">
            Notifications
          </Text>
        </Box>

        <Box
          p={3}
          display="flex"
          flexDirection="column"
          gap={3}
          maxH="400px"
          overflowY="auto"
        >
          {loading ? (
            <Flex justify="center" align="center" minH="100px">
              <Spinner size="sm" />
            </Flex>
          ) : notifications.length === 0 || !hasUnread ? (
            <Flex justify="center" align="center" minH="100px">
              <Text fontSize="sm" color="gray.500">
                Currently no new notifications are there!
              </Text>
            </Flex>
          ) : (
            notifications
              .filter((notif) => !notif.seen)
              .map((notif) => (
                //old
                // <MenuItem
                //   key={notif._id}
                //   p={0}
                //   bg="transparent"
                //   _hover={{ bg: "transparent" }}
                //   onClick={() => {
                //     if (notif.module === "announcement" && notif.ref_id) {
                //       navigate(
                //         `/dashboard?tab=Announcements&announcementId=${notif.ref_id}`,
                //       );

                //       // navigate(`/announcements?announcementId=${notif.ref_id}`);
                //     } else {
                //       navigate("/inbox");
                //     }
                //   }}

                //   // onClick={() => navigate("/inbox")}
                // >
                //   <Flex
                //     key={notif._id}
                //     cursor="pointer"
                //     // onClick={() => navigate("/inbox")}
                //     _hover={{ bg: "#E8EDF3" }}
                //     p={3}
                //     borderRadius="12px"
                //     bg={!notif.seen ? "#EEF0F3" : "white"}
                //     align="center"
                //     justify="space-between"
                //     border={!notif.seen ? "none" : "1px solid #E6E6E6"}
                //   >
                //     <Flex gap={3} align="center">
                //       <Box fontSize="18px">
                //         {getNotificationIcon(notif.module)}
                //       </Box>
                //       <Box>
                //         <Text fontWeight="600" fontSize="14px">
                //           {notif.title}
                //         </Text>
                //       </Box>
                //     </Flex>
                //     <Flex align="center" gap={2}>
                //       {!notif.seen && (
                //         <Box w="8px" h="8px" bg="red.500" borderRadius="full" />
                //       )}
                //       <Text fontSize="xs" color="gray.500" whiteSpace="nowrap">
                //         {formatDateLine(notif.created_at)}
                //       </Text>
                //     </Flex>
                //   </Flex>
                // </MenuItem>
                <Box
                  key={notif._id}
                  w="100%"
                  cursor="pointer"
                  p={3}
                  borderRadius="12px"
                  bg={!notif.seen ? "#EEF0F3" : "white"}
                  _hover={{ bg: "#E8EDF3" }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  //old
                  // onClick={(e) => {
                  //   e.preventDefault();
                  //   e.stopPropagation();

                  //   console.log("🔥 NOTIFICATION CLICKED");
                  //   console.log("FULL NOTIFICATION:", notif);
                  //   console.log("MODULE:", notif.module);
                  //   console.log("REF ID:", notif.ref_id);

                  //   if (notif.module === "announcement" && notif.ref_id) {
                  //     navigate(
                  //       `/dashboard?tab=Announcements&announcementId=${encodeURIComponent(
                  //         notif.ref_id,
                  //       )}`,
                  //     );
                  //   } else {
                  //     navigate("/inbox");
                  //   }
                  // }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    console.log("🔥 NOTIFICATION CLICKED");
                    console.log("FULL NOTIFICATION:", notif);
                    console.log("MODULE:", notif.module);
                    console.log("REF ID:", notif.ref_id);

                    handleNotificationClick(notif);
                  }}

                >
                  <Flex align="center" justify="space-between">
                    <Flex gap={3} align="center">
                      <Box fontSize="18px">
                        {getNotificationIcon(notif.module)}
                      </Box>

                      <Box>
                        <Text fontWeight="600" fontSize="14px">
                          {notif.title}
                        </Text>
                      </Box>
                    </Flex>

                    <Flex align="center" gap={2}>
                      {!notif.seen && (
                        <Box w="8px" h="8px" bg="red.500" borderRadius="full" />
                      )}

                      <Text fontSize="xs" color="gray.500" whiteSpace="nowrap">
                        {formatDateLine(notif.created_at)}
                      </Text>
                    </Flex>
                  </Flex>
                </Box>
              ))
          )}
        </Box>
      </MenuList>
    </Menu>
  );
}
