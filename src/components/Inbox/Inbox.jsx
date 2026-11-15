import { isAdminUser } from "../../utils/roles";
// import React, { useMemo, useState, useEffect, useRef } from "react";
// import {
//   Box,
//   Flex,
//   Heading,
//   Text,
//   Button,
//   HStack,
//   Spacer,
//   Image,
//   Spinner,
//   useToast,
// } from "@chakra-ui/react";
// import { ChevronRightIcon } from "@chakra-ui/icons";
// import { useNavigate } from "react-router-dom";
// import notification from "../../assets/notification.svg";
// import SortDropdownInbox from "./Filters/SortDropdownInbox";
// import api from "../../api/axios";
// import { useSelector } from "react-redux";
// import { getEmpCode, getOrgIdFromReduxOrStorage } from "../../utils/token";
// import Cookies from "js-cookie";

// const formatDateLine = (iso) => {
//   const d = new Date(iso);
//   const weekday = d.toLocaleDateString(undefined, { weekday: "long" });
//   const day = d.toLocaleDateString(undefined, {
//     day: "numeric",
//     month: "short",
//     year: "numeric",
//   });
//   const time = d.toLocaleTimeString(undefined, {
//     hour: "numeric",
//     minute: "2-digit",
//   });
//   return `${weekday} — ${day} • ${time}`;
// };

// const decodeJwtPayload = (t) => {
//   try {
//     const base64Url = t.split(".")[1];
//     const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
//     return JSON.parse(atob(base64));
//   } catch {
//     return null;
//   }
// };

// const transformNotification = (apiNotif) => ({
//   id: apiNotif._id,
//   title: apiNotif.title,
//   message: apiNotif.message,
//   date: apiNotif.created_at,
//   unread: !apiNotif.seen,
//   module: apiNotif.module,
//   raw: apiNotif,
// });

// /* ---------- MODULE ROUTING ---------- */
// const moduleRoutes = {
//   leave_tracker: "/leaves",
//   attendance_tracker: "/attendances",
//   asset_management: "/assets",
// };

// const NotificationCard = ({ n, onClick }) => (
//   <Flex
//     w="100%"
//     // h="110px"
//     h={{ base: '110px', sm: '110px', md: '110px', lg: '110px' }}
//     align="center"
//     borderRadius="12px"
//     boxShadow="sm"
//     mb={4}
//     mt={1}
//     bg={n.unread ? "#EBF3FB" : "white"}
//     border="1px solid #e2dede"
//     _hover={{ transform: "translateY(-2px)", transition: "all 120ms ease" }}
//     overflow="hidden"
//     cursor="pointer"
//     onClick={onClick}
//   >
//     <Flex w={{ base: '60px', sm: '60px', md: '80px', lg: '80px' }} h="100%" align="center" justify="center">
//       <Image src={notification} boxSize="50px" />
//     </Flex>

//     <Box h="100%" w="1px" bg="#D1D5DB" />

//     <Flex flex="1" pl={4} pr={{ base: 0, sm: 0, md: 4, lg: 4 }} pt={{ base: 0, sm: 0, md: 0, lg: 0 }} align="center">
//       <Box flex="1" >
//         <Heading
//           // size="md"
//           noOfLines={1}
//           fontSize={{ base: '15px', sm: '16px', md: '20px', lg: '22px' }}
//           fontWeight={600}
//           color={n.unread ? "#0b2a52" : "#111827"}
//         >
//           {n.title}
//         </Heading>
//         <Text noOfLines={2}   fontSize={{ base: '11px', sm: '11px', md: 'sm', lg: 'sm' }} color={'#757575'} mt={1}>
//           {n.message}
//         </Text>
//         <Text noOfLines={1}   fontSize={{ base: '11px', sm: '11px', md: 'sm', lg: 'xs' }} color="#757575" mt={1}>
//           {formatDateLine(n.date)}
//         </Text>
//       </Box>

//       <ChevronRightIcon w={8} h={8} color="#0b2a52" />
//     </Flex>
//   </Flex>
// );

// const InboxNotifications = () => {
//   const navigate = useNavigate();
//   const { user } = useSelector((state) => state.auth);
//   const toast = useToast();

//   const [allNotifications, setAllNotifications] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [visibleCount, setVisibleCount] = useState(10);
//   const headerRef = useRef(null);
//   const [listMaxPx, setListMaxPx] = useState(400);
//   const [sortParams, setSortParams] = useState({
//     sortBy: "created_at",
//     sortOrder: -1,
//   });

//   /* ---------- FETCH ---------- */
//   useEffect(() => {
//     const fetchNotifications = async () => {
//       try {
//         setLoading(true);
//         const orgId = getOrgIdFromReduxOrStorage(user);

//         let isAdmin = isAdminUser(user);
//         if (!isAdmin) {
//           const token = Cookies.get("auth_token");
//           const decoded = decodeJwtPayload(token);
//           isAdmin = decoded?.is_admin ?? false;
//         }

//         let url = `/notification/get_notifications?organisation_id=${orgId}`;
//         // If sort by created_at is specified, API expects a numeric sort param
//         if (
//           sortParams?.sortBy === "created_at" &&
//           typeof sortParams.sortOrder !== "undefined"
//         ) {
//           url += `&sort=${sortParams.sortOrder}`;
//         }
//         if (isAdmin) url += "&to=admin";
//         else url += `&to=${getEmpCode()}`;

//         const res = await api.get(url);

//         const transformed = res.data.data.map(transformNotification);
//         setAllNotifications(transformed);
//       } catch {
//         toast({ title: "Failed to load notifications", status: "error" });
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchNotifications();
//   }, [user, sortParams]);

//   /* ---------- MARK AS READ HANDLER ---------- */
//   const handleNotificationClick = async (notif) => {
//     try {
//       if (notif.unread) {
//         await api.put(`/notification/mark_as_read/${notif.id}`);

//         // optimistic UI update
//         setAllNotifications((prev) =>
//           prev.map((n) => (n.id === notif.id ? { ...n, unread: false } : n)),
//         );
//       }

//       const route = moduleRoutes[notif.module] || "/inbox";
//       navigate(route);
//     } catch {
//       toast({
//         title: "Error updating notification",
//         status: "error",
//       });
//     }
//   };

//   // MARK AS ALL READ HANDLER
//   const handleMarkAllRead = async () => {
//     try {
//       setLoading(true);

//       const orgId = getOrgIdFromReduxOrStorage(user);
//       if (!orgId) return;

//       let isAdmin = isAdminUser(user);

//       if (!isAdmin) {
//         const token = Cookies.get("auth_token");
//         const decoded = decodeJwtPayload(token);
//         isAdmin = decoded?.is_admin ?? false;
//       }

//       let url = `/notification/mark_as_all_read?organisation_id=${orgId}`;

//       if (isAdmin) {
//         url += "&to=admin";
//       } else {
//         const empCode = getEmpCode();
//         url += `&to=${empCode}`;
//       }

//       await api.put(url);

//       // ⭐ Optimistic UI update
//       setAllNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));

//       toast({
//         title: "All notifications marked as read",
//         status: "success",
//         duration: 2000,
//       });
//     } catch (err) {
//       toast({
//         title: "Failed to mark notifications",
//         status: "error",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ---------- HEIGHT CALC ---------- */
//   useEffect(() => {
//     const compute = () => {
//       const headerH = headerRef.current?.offsetHeight || 0;
//       setListMaxPx(window.innerHeight - headerH - 170);
//     };
//     compute();
//     window.addEventListener("resize", compute);
//     return () => window.removeEventListener("resize", compute);
//   }, []);

//   const visibleNotifications = allNotifications.slice(0, visibleCount);
//   const remaining = allNotifications.length - visibleCount;

//   return (
//     <Flex
//       direction="column"
//       // w="100%"
//       w={{ base: '96vw', sm: '96vw', md: '96vw', lg: '100%' }}
//       h="100%"
//       border="1px solid #ccc"
//       pt={4}
//       pb={{ base: 20, sm: 20, md: 4, lg: 4 }}
//       // mt={3}
//       // mt={'7.5vh'}
//       ml={{ base: '2vw', sm: '2vw', md: '2vw', lg: 0 }}
//       mt={{ base: '9vh', sm: '7.5vh', md: '6vh', lg: 3 }}
//       borderRadius="14px"
//       bg="white"
//     >
//       {/* Header */}
//       <Flex align="center" mb={4} pl={4} pr={4} ref={headerRef}>
//         <Heading fontSize={{ base: '17px', sm: '20px', md: '22px', lg: '22px' }} fontWeight={'600'}>Notifications</Heading>
//         <Spacer />
//         <HStack spacing={3}>
//           {/* Mark all read button */}
//           <Button
//             size="sm"
//             borderRadius="10px"
//             bg="white"
//             border="1px solid #cccccc"
//             color="#757575"
//             fontFamily="Poppins"
//             fontSize="14px"
//             fontWeight="400"
//             height="37px"
//             // width='32vw'
//             width={{ base: '32vw', sm: '32vw', md: '9vw', lg: '9vw' }}
//             onClick={handleMarkAllRead}
//             isLoading={loading}
//             isDisabled={!allNotifications.some((n) => n.unread)}
//           >
//             Mark as all read
//           </Button>
//           {/* Sort button */}
//           <SortDropdownInbox
//             onApply={(p) => setSortParams(p)}
//             onClear={() =>
//               setSortParams({ sortBy: "created_at", sortOrder: -1 })
//             }
//             defaultSort={sortParams}
//           />
//         </HStack>
//       </Flex>

//       <Box borderTop="2px dashed #E6E6E6" mb={4} />

//       <Box
//         pl={4}
//         pr={4}
//         maxH={`${listMaxPx}px`}
//         overflowY="auto"
//         css={{
//           scrollbarWidth: "thin", // Firefox
//           scrollbarColor: "#C1C1C1 transparent",

//           "&::-webkit-scrollbar": {
//             width: "5px",
//           },
//           "&::-webkit-scrollbar-track": {
//             background: "transparent",
//           },
//           "&::-webkit-scrollbar-thumb": {
//             background: "rgba(0,0,0,0.15)",
//             borderRadius: "10px",
//           },
//           "&::-webkit-scrollbar-thumb:hover": {
//             background: "rgba(0,0,0,0.3)",
//           },
//           // scrollbarWidth: "none",
//           msOverflowStyle: "none",

//           // "&::-webkit-scrollbar": {
//           //   display: "none",
//           // },
//         }}
//       >
//         {loading ? (
//           <Spinner />
//         ) : (
//           <>
//             {visibleNotifications.map((n) => (
//               <NotificationCard
//                 key={n.id}
//                 n={n}
//                 onClick={() => handleNotificationClick(n)}
//               />
//             ))}

//             {remaining > 0 && (
//               <Button
//                 onClick={() =>
//                   setVisibleCount((c) =>
//                     Math.min(allNotifications.length, c + 10),
//                   )
//                 }
//               >
//                 View more
//               </Button>
//             )}
//           </>
//         )}
//       </Box>
//     </Flex>
//   );
// };

// export default InboxNotifications;

import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  HStack,
  Spacer,
  Image,
  Spinner,
  useToast,
  Badge,
} from "@chakra-ui/react";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import notification from "../../assets/notification.svg";
import SortDropdownInbox from "./Filters/SortDropdownInbox";
import api from "../../api/axios";
import { useSelector } from "react-redux";
import { getEmpCode, getOrgIdFromReduxOrStorage } from "../../utils/token";
import Cookies from "js-cookie";

const formatDateLine = (iso) => {
  const d = new Date(iso);

  const weekday = d.toLocaleDateString(undefined, {
    weekday: "long",
  });

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

const decodeJwtPayload = (t) => {
  try {
    const base64Url = t.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
};
//old
// const transformNotification = (apiNotif) => ({
//   id: apiNotif._id,
//   title: apiNotif.title,
//   message: apiNotif.message,
//   date: apiNotif.created_at,
//   unread: !apiNotif.seen,
//   module: apiNotif.module,
//   raw: apiNotif,
// });
const transformNotification = (apiNotif) => ({
  id: apiNotif._id,
  title: apiNotif.title,
  message: apiNotif.message,
  date: apiNotif.created_at,
  unread: !apiNotif.seen,
  module: apiNotif.module,
  ref_id: apiNotif.ref_id,
  trigger_event: apiNotif.trigger_event,
  raw: apiNotif,
});

/* ---------- MODULE ROUTING ---------- */
const moduleRoutes = {
  leave_tracker: "/leaves",
  attendance_tracker: "/attendances",
  asset_management: "/assets",
};

const NotificationCard = ({ n, onClick }) => (
  <Flex
    w="100%"
    h={{ base: "110px", sm: "110px", md: "110px", lg: "110px" }}
    align="center"
    borderRadius="12px"
    boxShadow="sm"
    mb={4}
    mt={1}
    bg={n.unread ? "#EBF3FB" : "white"}
    border="1px solid #e2dede"
    _hover={{
      transform: "translateY(-2px)",
      transition: "all 120ms ease",
    }}
    overflow="hidden"
    cursor="pointer"
    onClick={onClick}
  >
    <Flex
      w={{ base: "60px", sm: "60px", md: "80px", lg: "80px" }}
      h="100%"
      align="center"
      justify="center"
    >
      <Image src={notification} boxSize="50px" />
    </Flex>

    <Box h="100%" w="1px" bg="#D1D5DB" />

    <Flex flex="1" pl={4} pr={{ base: 0, sm: 0, md: 4, lg: 4 }} align="center">
      <Box flex="1">
        <Heading
          noOfLines={1}
          fontSize={{
            base: "15px",
            sm: "16px",
            md: "20px",
            lg: "22px",
          }}
          fontWeight={600}
          color={n.unread ? "#0b2a52" : "#111827"}
        >
          {n.title}
        </Heading>

        <Text
          noOfLines={2}
          fontSize={{
            base: "11px",
            sm: "11px",
            md: "sm",
            lg: "sm",
          }}
          color="#757575"
          mt={1}
        >
          {n.message.replace(/<[^>]*>/g, "")}
        </Text>

        <Text
          noOfLines={1}
          fontSize={{
            base: "11px",
            sm: "11px",
            md: "sm",
            lg: "xs",
          }}
          color="#757575"
          mt={1}
        >
          {formatDateLine(n.date)}
        </Text>
      </Box>

      <ChevronRightIcon w={8} h={8} color="#0b2a52" />
    </Flex>
  </Flex>
);

const InboxNotifications = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const toast = useToast();

  const [allNotifications, setAllNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);

  const headerRef = useRef(null);
  //new 07
  const [searchParams, setSearchParams] = useSearchParams();

  const notificationIdFromUrl = searchParams.get("notificationId");
  const refIdFromUrl = searchParams.get("refId");

  const notificationRefs = useRef({});
  const [highlightedNotificationId, setHighlightedNotificationId] =
    useState(null);

  const [listMaxPx, setListMaxPx] = useState(400);

  const [sortParams, setSortParams] = useState({
    sortBy: "created_at",
    sortOrder: -1,
  });

  /* ---------- UNREAD COUNT ---------- */
  const unreadCount = useMemo(() => {
    return allNotifications.filter((n) => n.unread).length;
  }, [allNotifications]);

  /* ---------- FETCH ---------- */
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);

        const orgId = getOrgIdFromReduxOrStorage(user);

        let isAdmin = isAdminUser(user);

        if (!isAdmin) {
          const token = Cookies.get("auth_token");
          const decoded = decodeJwtPayload(token);

          isAdmin = decoded?.is_admin ?? false;
        }

        let url = `/notification/get_notifications?organisation_id=${orgId}`;

        if (
          sortParams?.sortBy === "created_at" &&
          typeof sortParams.sortOrder !== "undefined"
        ) {
          url += `&sort=${sortParams.sortOrder}`;
        }

        if (isAdmin) {
          url += "&to=admin";
        } else {
          url += `&to=${getEmpCode()}`;
        }

        const res = await api.get(url);

        const transformed = res.data.data.map(transformNotification);

        setAllNotifications(transformed);
      } catch {
        toast({
          title: "Failed to load notifications",
          status: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user, sortParams]);
  //new 07
  useEffect(() => {
    if (loading || !allNotifications.length) return;

    if (!notificationIdFromUrl && !refIdFromUrl) return;

    // First try the exact notification ID.
    // This identifies the exact notification that was clicked.
    let targetNotification = null;

    if (notificationIdFromUrl) {
      targetNotification = allNotifications.find(
        (notification) =>
          String(notification.id) === String(notificationIdFromUrl),
      );
    }

    // Fallback to announcement ref_id.
    if (!targetNotification && refIdFromUrl) {
      targetNotification = allNotifications.find(
        (notification) => String(notification.ref_id) === String(refIdFromUrl),
      );
    }

    if (!targetNotification) {
      return;
    }

    const targetIndex = allNotifications.findIndex(
      (notification) => notification.id === targetNotification.id,
    );

    // If the notification is beyond the currently visible
    // 10 notifications, make it visible first.
    if (targetIndex >= visibleCount) {
      setVisibleCount(targetIndex + 1);

      return;
    }

    const targetElement = notificationRefs.current[targetNotification.id];

    if (!targetElement) return;

    setHighlightedNotificationId(targetNotification.id);

    const timer = setTimeout(() => {
      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 200);

    const removeHighlightTimer = setTimeout(() => {
      setHighlightedNotificationId(null);

      // Remove query params after handling the Bell navigation.
      setSearchParams({});
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearTimeout(removeHighlightTimer);
    };
  }, [
    loading,
    allNotifications,
    notificationIdFromUrl,
    refIdFromUrl,
    visibleCount,
    setSearchParams,
  ]);

  /* ---------- MARK AS READ ---------- */
  // const handleNotificationClick = async (notif) => {
  //   try {
  //     if (notif.unread) {
  //       await api.put(`/notification/mark_as_read/${notif.id}`);

  //       setAllNotifications((prev) =>
  //         prev.map((n) =>
  //           n.id === notif.id
  //             ? { ...n, unread: false }
  //             : n,
  //         ),
  //       );
  //     }

  //     const route = moduleRoutes[notif.module] || "/inbox";

  //     navigate(route);
  //   } catch {
  //     toast({
  //       title: "Error updating notification",
  //       status: "error",
  //     });
  //   }
  // };
  //old 04092026
  //  const handleNotificationClick = async (notif) => {
  //      try {
  //        if (notif.unread) {
  //          await api.put(`/notification/mark_as_read/${notif.id}`);

  //          setAllNotifications((prev) =>
  //            prev.map((n) =>
  //              n.id === notif.id ? { ...n, unread: false } : n
  //            )
  //          );
  //        }

  //        // Announcement mention notification
  //        if (
  //          notif.module === "announcement" &&
  //          ["mentioned", "mentioned_all"].includes(notif.raw?.trigger_event) &&
  //          notif.raw?.ref_id
  //        ) {
  //          navigate(
  //            `/dashboard?tab=Announcements&announcementId=${encodeURIComponent(
  //              notif.raw.ref_id
  //            )}`
  //          );
  //          return;
  //        }

  //        const route = moduleRoutes[notif.module] || "/inbox";
  //        navigate(route);
  //      } catch (error) {
  //        console.error(error);
  //      }
  //    };
  //new 07092026
  const handleNotificationClick = async (notif) => {
    console.log("CLICKED NOTIFICATION:", notif);

    try {
      if (notif.unread) {
        await api.put(`/notification/mark_as_read/${notif.id}`);

        setAllNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, unread: false } : n)),
        );
      }

      // Announcement mention / mention-all notification
      if (
        notif.module === "announcement" &&
        ["created", "mentioned", "mentioned_all"].includes(
          notif.trigger_event,
        ) &&
        notif.ref_id
      ) {
        navigate(
          `/dashboard?tab=Announcements&announcementId=${encodeURIComponent(
            notif.ref_id,
          )}`,
        );
        return;
      }

      const route = moduleRoutes[notif.module] || "/inbox";
      navigate(route);
    } catch (error) {
      console.error("Notification click failed:", error);

      toast({
        title: "Error updating notification",
        status: "error",
      });
    }
  };

  /* ---------- MARK ALL READ ---------- */
  const handleMarkAllRead = async () => {
    try {
      setLoading(true);

      const orgId = getOrgIdFromReduxOrStorage(user);

      if (!orgId) return;

      let isAdmin = isAdminUser(user);

      if (!isAdmin) {
        const token = Cookies.get("auth_token");
        const decoded = decodeJwtPayload(token);

        isAdmin = decoded?.is_admin ?? false;
      }

      let url = `/notification/mark_as_all_read?organisation_id=${orgId}`;

      if (isAdmin) {
        url += "&to=admin";
      } else {
        url += `&to=${getEmpCode()}`;
      }

      await api.put(url);

      setAllNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          unread: false,
        })),
      );

      toast({
        title: "All notifications marked as read",
        status: "success",
        duration: 2000,
      });
    } catch {
      toast({
        title: "Failed to mark notifications",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ---------- HEIGHT CALC ---------- */
  useEffect(() => {
    const compute = () => {
      const headerH = headerRef.current?.offsetHeight || 0;

      setListMaxPx(window.innerHeight - headerH - 170);
    };

    compute();

    window.addEventListener("resize", compute);

    return () => window.removeEventListener("resize", compute);
  }, []);

  const visibleNotifications = allNotifications.slice(0, visibleCount);

  const remaining = allNotifications.length - visibleCount;

  return (
    <Flex
      direction="column"
      w={{
        base: "96vw",
        sm: "96vw",
        md: "96vw",
        lg: "100%",
      }}
      h="100%"
      border="1px solid #ccc"
      pt={4}
      pb={{ base: 20, sm: 20, md: 4, lg: 4 }}
      ml={{ base: "2vw", sm: "2vw", md: "2vw", lg: 0 }}
      mt={{ base: "9vh", sm: "7.5vh", md: "6vh", lg: 3 }}
      borderRadius="14px"
      bg="white"
    >
      {/* Header */}
      <Flex direction="column" mb={4} pl={4} pr={4} ref={headerRef}>
        <Flex align="center" w="100%">
          <Box>
            <Heading
              fontSize={{
                base: "17px",
                sm: "20px",
                md: "22px",
                lg: "22px",
              }}
              fontWeight="600"
            >
              Notifications
            </Heading>

            {/* UNREAD TEXT */}
            <Flex align="center" gap={2} mt={1}>
              {unreadCount > 0 ? (
                <>
                  <Text
                    fontSize={{
                      base: "12px",
                      md: "14px",
                    }}
                    color="#757575"
                    fontWeight="400"
                  >
                    You have{" "}
                    <Text as="span" color="#0b2a52" fontWeight="700">
                      {unreadCount}
                    </Text>{" "}
                    unread notification
                    {unreadCount > 1 ? "s" : ""}
                  </Text>

                  <Badge
                    bg="#EBF3FB"
                    color="#0b2a52"
                    borderRadius="full"
                    px={2}
                    py={1}
                    fontSize="10px"
                    fontWeight="700"
                    textTransform="none"
                  >
                    {unreadCount} New
                  </Badge>
                </>
              ) : (
                <Text
                  fontSize={{
                    base: "12px",
                    md: "14px",
                  }}
                  color="#757575"
                >
                  All notifications are read
                </Text>
              )}
            </Flex>
          </Box>

          <Spacer />

          <HStack spacing={3}>
            {/* Mark all read button */}
            <Button
              size="sm"
              borderRadius="10px"
              bg="white"
              border="1px solid #cccccc"
              color="#757575"
              fontFamily="Poppins"
              fontSize="14px"
              fontWeight="400"
              height="37px"
              width={{
                base: "32vw",
                sm: "32vw",
                md: "9vw",
                lg: "9vw",
              }}
              onClick={handleMarkAllRead}
              isLoading={loading}
              isDisabled={!allNotifications.some((n) => n.unread)}
              _hover={{
                bg: "#F7FAFC",
              }}
            >
              Mark all read
            </Button>

            {/* Sort button */}
            <SortDropdownInbox
              onApply={(p) => setSortParams(p)}
              onClear={() =>
                setSortParams({
                  sortBy: "created_at",
                  sortOrder: -1,
                })
              }
              defaultSort={sortParams}
            />
          </HStack>
        </Flex>
      </Flex>

      <Box borderTop="2px dashed #E6E6E6" mb={4} />

      {/* Notification List */}
      <Box
        pl={4}
        pr={4}
        maxH={`${listMaxPx}px`}
        overflowY="auto"
        css={{
          scrollbarWidth: "thin",
          scrollbarColor: "#C1C1C1 transparent",

          "&::-webkit-scrollbar": {
            width: "5px",
          },

          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },

          "&::-webkit-scrollbar-thumb": {
            background: "rgba(0,0,0,0.15)",
            borderRadius: "10px",
          },

          "&::-webkit-scrollbar-thumb:hover": {
            background: "rgba(0,0,0,0.3)",
          },

          msOverflowStyle: "none",
        }}
      >
        {loading ? (
          <Flex justify="center" align="center" minH="200px">
            <Spinner />
          </Flex>
        ) : visibleNotifications.length === 0 ? (
          <Flex justify="center" align="center" minH="200px">
            <Text color="#757575">No notifications found</Text>
          </Flex>
        ) : (
          <>
            {/* old */}
            {/* {visibleNotifications.map((n) => (
              <NotificationCard
                key={n.id}
                n={n}
                onClick={() => handleNotificationClick(n)}
              />
            ))} */}
            {/* new 07 */}
            {visibleNotifications.map((n) => (
              <Box
                key={n.id}
                ref={(el) => {
                  if (el) {
                    notificationRefs.current[n.id] = el;
                  }
                }}
                borderRadius="12px"
                transition="all 0.3s ease"
                bg={
                  highlightedNotificationId === n.id ? "#FFF3CD" : "transparent"
                }
                boxShadow={
                  highlightedNotificationId === n.id
                    ? "0 0 0 2px #F6C453"
                    : "none"
                }
              >
                <NotificationCard
                  n={n}
                  onClick={() => handleNotificationClick(n)}
                />
              </Box>
            ))}

            {remaining > 0 && (
              <Flex justify="center" mt={2}>
                <Button
                  onClick={() =>
                    setVisibleCount((c) =>
                      Math.min(allNotifications.length, c + 10),
                    )
                  }
                  bg="#0b2a52"
                  color="white"
                  _hover={{
                    bg: "#133b72",
                  }}
                >
                  View more
                </Button>
              </Flex>
            )}
          </>
        )}
      </Box>
    </Flex>
  );
};

export default InboxNotifications;
