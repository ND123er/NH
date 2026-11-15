import { isAdminUser } from "../../utils/roles";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Button,
  Checkbox,
  Flex,
  Avatar,
  Tooltip,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  Divider,
  IconButton,
  Input,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  Textarea,
  VStack,
  useDisclosure,
  useToast,
  Img,
} from "@chakra-ui/react";
import { FiEdit2, FiLock, FiMoreHorizontal, FiTrash2 } from "react-icons/fi";
import { BsCircle } from "react-icons/bs";
import { HiBadgeCheck } from "react-icons/hi";
//new
import { CopyIcon, CheckIcon } from "@chakra-ui/icons";
import pin from "../../assets/pin.svg";
import pinned from "../../assets/pinned.svg";
import api from "../../api/axios";
import { BiLike } from "react-icons/bi";
import { BiSolidLike } from "react-icons/bi";
import AnnouncementEditor from "./AnnouncementEditor";

const formatAnnouncementDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";

  const day = d.getDate();
  const suffix =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
          ? "rd"
          : "th";

  const weekday = d.toLocaleDateString("en-US", { weekday: "long" });
  const month = d.toLocaleDateString("en-US", { month: "long" });
  const time = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return `${weekday}, ${day}${suffix} ${month}, ${time.toLowerCase()}`;
};
//new
// const CopyButton = ({ text }) => {
//   const [copied, setCopied] = useState(false);

//   const handleCopy = async (e) => {
//     e.stopPropagation();
// //ehfkhkjng
//     try {
//       await navigator.clipboard.writeText(String(text));

//       setCopied(true);

//       setTimeout(() => {
//         setCopied(false);
//       }, 1500);
//     } catch (error) {
//       console.error("Copy failed:", error);
//     }
//   };
// //ebhfdhgfkjhgjgf
//   return (
//     <IconButton
//       aria-label={copied ? "Copy" : "Copy"}

//       icon={copied ? <CheckIcon /> : <CopyIcon />}
//       size="sm"
//       minW="32px"

//       //jjjujuu
//       h=""
//       variant="ghost"
//       color={copied ? "green.500" : "gray.500"}
//       _hover={{
//         bg: "#EDF2F7",
//       }}
//       onClick={handleCopy}
//     />
//   );
// };
//new
const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const textArea = document.createElement("textarea");
    textArea.value = String(text || "");

    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";

    document.body.appendChild(textArea);

    textArea.focus();
    textArea.select();

    try {
      document.execCommand("copy");

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      console.error("Copy failed:", error);
    }

    document.body.removeChild(textArea);
  };

  return (
    <IconButton
      aria-label={copied ? "Copied" : "Copy"}
      icon={copied ? <CheckIcon /> : <CopyIcon />}
      size="sm"
      // minW="32px"
      h="32px"
      variant="ghost"
      color={copied ? "green.500" : "gray.500"}
      _hover={{
        bg: "#EDF2F7",
      }}
      _active={{
        bg: "#EDF2F7",
      }}
      _focus={{
        boxShadow: "none !important",
        outline: "none !important",
      }}
      _focusVisible={{
        boxShadow: "none !important",
        outline: "none !important",
      }}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onClick={handleCopy}
    />
  );
};

//old04092026
// const renderDescriptionWithMentions = (description, mentionMetadata) => {
//   if (!description) return null;

//   const tokens = Array.isArray(mentionMetadata?.highlight_tokens)
//     ? mentionMetadata.highlight_tokens
//     : [];

//   if (!tokens.length) {
//     return description;
//   }

//   // Prefer @mention tokens and remove duplicate/non-useful versions
//   const mentionTokens = [...new Set(tokens)]
//     .filter(Boolean)
//     .sort((a, b) => b.length - a.length);

//   const escapedTokens = mentionTokens.map((token) =>
//     token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
//   );

//   if (!escapedTokens.length) {
//     return description;
//   }

//   const regex = new RegExp(`(${escapedTokens.join("|")})`, "gi");

//   return description.split(regex).map((part, index) => {
//     const isMention = mentionTokens.some(
//       (token) => token.toLowerCase() === part.toLowerCase(),
//     );

//     if (isMention) {
//       return (
//         <Text as="span" key={index} color="#1A73E8" fontWeight="500">
//           {part}
//         </Text>
//       );
//     }

//     return <React.Fragment key={index}>{part}</React.Fragment>;
//   });
// };
//new
const renderDescriptionWithMentions = (description, mentionMetadata) => {
  if (!description) return null;

  const tokens = Array.isArray(mentionMetadata?.highlight_tokens)
    ? mentionMetadata.highlight_tokens
    : [];

  const mentions = Array.isArray(mentionMetadata?.mentions)
    ? mentionMetadata.mentions
    : [];

  if (!tokens.length) {
    return description;
  }

  // Remove duplicates and match longer mentions first
  const mentionTokens = [...new Set(tokens)]
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);

  const escapedTokens = mentionTokens.map((token) =>
    token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );

  if (!escapedTokens.length) {
    return description;
  }

  const regex = new RegExp(`(${escapedTokens.join("|")})`, "gi");

  return description.split(regex).map((part, index) => {
    const matchedMention = mentions.find((mention) => {
      if (mention?.type !== "employee") return false;

      const token = String(mention?.token || "").toLowerCase();
      const name = String(mention?.name || "").toLowerCase();
      const currentPart = String(part).toLowerCase();

      return currentPart === token || currentPart === name;
    });

    const isMention = mentionTokens.some(
      (token) => token.toLowerCase() === part.toLowerCase(),
    );

    // Normal text
    if (!isMention) {
      return <React.Fragment key={index}>{part}</React.Fragment>;
    }

    // @all or any non-employee mention
    if (!matchedMention) {
      return (
        <Text as="span" key={index} color="#1A73E8" fontWeight="500">
          {part}
        </Text>
      );
    }

    // Employee mention with hover information
    return (
      // <Tooltip
      //   key={index}
      //   hasArrow
      //   placement="top"
      //   openDelay={150}
      //   bg="white"
      //   color="#1A202C"
      //   border="1px solid #E2E8F0"
      //   borderRadius="10px"
      //   boxShadow="lg"
      //   p={0}
      //   label={
      //     <Flex gap="2" px={3} py={2} align="center">
      //       <Avatar size="sm" name="" bg="#1F3661" />
      //       <Box>
      //         <Text>
      //           <Text as="span" fontSize="14px" color="#000000">
      //             Designation:{" "}
      //           </Text>
      //           <Text as="span" color="#1f3661" fontWeight="600">
      //             {matchedMention.designation || "N/A"}
      //           </Text>
      //         </Text>

      //         <Text>
      //           <Text as="span" fontSize="14px" color="#000000">
      //             Mobile No:{" "}
      //           </Text>
      //           <Text as="span" color="#1f3661" fontWeight="600">
      //             {matchedMention.mobile || "N/A"}
      //           </Text>
      //         </Text>
      //       </Box>
      //     </Flex>
      //   }
      // >
      //   <Text as="span" color="#1A73E8" fontWeight="500" cursor="pointer">
      //     {part}
      //   </Text>
      // </Tooltip>
      // <Popover placement="top" trigger="hover" openDelay={150} closeDelay={200}>
      //   <PopoverTrigger>
      //     <Text as="span" color="#1A73E8" fontWeight="500" cursor="pointer">
      //       {part}
      //     </Text>
      //   </PopoverTrigger>

      //   <PopoverContent
      //     width="240px"
      //     bg="white"
      //     border="1px solid #E2E8F0"
      //     borderRadius="10px"
      //     boxShadow="0 4px 12px rgba(0,0,0,0.12)"
      //     _focus={{ outline: "none" }}
      //   >
      //     <PopoverArrow bg="white" />

      //     <PopoverBody p={0}>
      //       <Box
      //     border="1px solid #1F3661"
      //     borderRadius="8px"
      //     flexShrink={0}
      //       >
      //         <Flex align="center" gap={3} p={3}>
      //           <Box><Avatar size="sm" name={matchedMention.name} bg="#1F3661" /></Box>

      //           <Box>
      //             <Text fontSize="14px" fontWeight="600" color="#1F3661">
      //               {matchedMention.name}
      //             </Text>

      //             <Text fontSize="12px" color="gray.500">
      //               {matchedMention.email || "N/A"}
      //             </Text>
      //           </Box>
      //         </Flex>

      //         <Divider />

      //         <Box px={3} py={2}>
      //           <Flex justify="space-between" mb={2}>
      //             <Text fontSize="12px" color="gray.500">
      //               Designation
      //             </Text>

      //             <Text fontSize="12px" fontWeight="600" color="#1F3661">
      //               {matchedMention.designation || "N/A"}
      //             </Text>
      //           </Flex>

      //           <Flex justify="space-between">
      //             <Text fontSize="12px" color="gray.500">
      //               Mobile No
      //             </Text>

      //             <Text fontSize="12px" fontWeight="600" color="#1F3661">
      //               {matchedMention.mobile || "N/A"}
      //             </Text>
      //           </Flex>
      //         </Box>
      //       </Box>
      //     </PopoverBody>
      //   </PopoverContent>
      // </Popover>
      <Popover
        placement="top"
        trigger="click"
        // openDelay={150}
        // closeDelay={200}
        closeOnBlur={true}
        returnFocusOnClose={false}
        autoFocus={false}
      >
        <PopoverTrigger>
          <Text
            as="span"
            color="#1A73E8"
            fontWeight="500"
            cursor="pointer"
            tabIndex={0}
            _focus={{
              outline: "none !important",
              boxShadow: "none !important",
            }}
            _focusVisible={{
              outline: "none !important",
              boxShadow: "none !important",
            }}
          >
            {part}
          </Text>
        </PopoverTrigger>

        <PopoverContent
          W={{ base: "250px", md: "max-content" }}
          // width="max-content"
          bg="white"
          border="1px solid #D5D9E0"
          borderRadius="16px"
          boxShadow="0 5px 20px rgba(0, 0, 0, 0.18)"
          overflow="hidden"
          _focus={{
            outline: "none !important",
          }}
          _focusVisible={{
            outline: "none !important",
          }}
        >
          <PopoverArrow bg="white" />

          <PopoverBody p={0}>
            {/* TOP PROFILE SECTION */}
            <Box bg="#F1F3F6" px="8px" py="8px">
              <Flex align="center">
                <Box position="relative" flexShrink={0} mr="14px">
                  <Avatar
                    size="md"
                    name={matchedMention.name}
                    bg="#D9DDE5"
                    color="#555"
                    fontSize="14px"
                  />

                  {/* <Box
                    position="absolute"
                    right="0px"
                    bottom="1px"
                    width="15px"
                    height="15px"
                    bg="#12B76A"
                    borderRadius="50%"
                    border="2px solid white"
                  /> */}
                </Box>

                <Box minWidth={0}>
                  <Flex gap="2px" direction="column">
                    <Text
                      fontSize="14px"
                      fontWeight="600"
                      color="#292929"
                      lineHeight="1.3"
                    >
                      {matchedMention.name}{" "}
                    </Text>
                    <Text as="span" fontSize="12px" fontWeight="400">
                      ({matchedMention.employee_code})
                    </Text>
                  </Flex>

                  {/* <Text fontSize="14px" color="#666" mt="4px" noOfLines={1}>
                    {matchedMention.email || "N/A"}
                    <CopyButton text={matchedMention.email || "N/A"} />
                  </Text> */}
                  <Flex align="center" mt="4px" gap={1}>
                    <Text fontSize="14px" color="#666" noOfLines={1} flex="1">
                      {matchedMention.email || "N/A"}
                    </Text>

                    <CopyButton text={matchedMention.email || "N/A"} />
                  </Flex>
                </Box>
              </Flex>
            </Box>

            {/* INFORMATION SECTION */}
            <Box px="8px" py="8px">
              <Flex justify="space-between" align="center" mb={3}>
                <Text fontSize="14px" color="#777">
                  Designation
                </Text>

                <Text
                  fontSize="14px"
                  fontWeight="500"
                  color="#333"
                  maxW="60%"
                  textAlign="right"
                >
                  {matchedMention.designation || "N/A"}
                </Text>
              </Flex>

              <Flex justify="space-between" align="center" minH="">
                <Text fontSize="14px" color="#777">
                  Mobile No
                </Text>

                <Text
                  fontSize="14px"
                  fontWeight="500"
                  color="#333"
                  maxW="60%"
                  textAlign="right"
                >
                  {matchedMention.mobile || "N/A"}
                </Text>
              </Flex>
            </Box>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    );
  });
};

const getLikesCount = (post) => {
  const count = Number(post?.likes ?? post?.likes_count ?? 0);
  return Number.isFinite(count) ? Math.max(0, count) : 0;
};

const getUserLikedState = (post, employeeId) => {
  if (typeof post?.is_liked === "boolean") return post.is_liked;
  if (typeof post?.liked === "boolean") return post.liked;
  if (typeof post?.has_liked === "boolean") return post.has_liked;
  if (!employeeId) return false;

  const employeeIdString = String(employeeId);
  const likedByCandidates = [
    post?.liked_by,
    post?.likedBy,
    post?.likes_by,
    post?.liked_employees,
    post?.liked_employee_ids,
    post?.likes_users,
  ];

  for (const list of likedByCandidates) {
    if (!Array.isArray(list)) continue;
    const userFound = list.some((item) => {
      const id =
        typeof item === "object" && item !== null
          ? (item.employee_id ??
            item.employeeId ??
            item.id ??
            item.user_id ??
            item.userId)
          : item;

      return String(id) === employeeIdString;
    });
    if (userFound) return true;
  }

  return false;
};

const getServerLikeState = (responseData) => {
  if (!responseData || typeof responseData !== "object") return null;
  const candidates = [
    responseData?.is_liked,
    responseData?.liked,
    responseData?.has_liked,
    responseData?.isLiked,
    responseData?.like_status,
  ];
  const found = candidates.find((value) => typeof value === "boolean");
  return typeof found === "boolean" ? found : null;
};

const getServerLikeCount = (responseData) => {
  if (!responseData || typeof responseData !== "object") return null;
  const count = Number(
    responseData?.likes ??
      responseData?.likes_count ??
      responseData?.like_count ??
      responseData?.total_likes,
  );
  return Number.isFinite(count) ? Math.max(0, count) : null;
};

export default function PostCard({ post, onPinnedChange, onLikeChange }) {
  const { user } = useSelector((state) => state.auth);
  const toast = useToast();
  const author = post?.created_by_name || "Unknown User";
  const designation = post?.created_by_designation || "Employee";
  const description = post?.description || "";
  const [likesCount, setLikesCount] = useState(getLikesCount(post));
  const [isLiked, setIsLiked] = useState(false);
  const [isPinned, setIsPinned] = useState(Boolean(post?.is_pinned));
  const [liking, setLiking] = useState(false);
  //   const [hasUnliked, setHasUnliked] = useState(false);
  const likingRef = useRef(false);
  const [pinning, setPinning] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [updatingVisibility, setUpdatingVisibility] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingMoreEmployees, setLoadingMoreEmployees] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [editedDescription, setEditedDescription] = useState(description);
  //04092026
  // const editInputRef = useRef(null);
  //new
  const [editedMentions, setEditedMentions] = useState({
    all: false,
    employee_ids: [],
  });

  // Visibility used by the Edit Post toolbar.
  // IMPORTANT: ALL is the default, so visible_to is never omitted from an edit payload.
  const [editVisibility, setEditVisibility] = useState("ALL");

  const requestIdRef = useRef(0);
  const dateText = formatAnnouncementDate(post?.created_at || post?.updated_at);
  const limit = 20;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDeleteConfirmOpen,
    onOpen: onDeleteConfirmOpen,
    onClose: onDeleteConfirmClose,
  } = useDisclosure();
  const organisationId = user?.organisation_id || user?.org_id;
  const employeeId = user?.employee_id;
  const isAdmin = isAdminUser(user);
  const announcementId = post?.announcement_id;
  const isVisibleToAll = Array.isArray(post?.visible_to)
    ? post.visible_to.some(
        (item) =>
          String(item || "")
            .trim()
            .toLowerCase() === "all",
      )
    : false;

  useEffect(() => {
    setIsPinned(Boolean(post?.is_pinned));
  }, [post?.is_pinned]);

  useEffect(() => {
    setLikesCount(getLikesCount(post));
    setIsLiked(getUserLikedState(post, employeeId));
  }, [post, employeeId]);

  useEffect(() => {
    setEditedDescription(description);
  }, [description]);

  //   const likeStorageKey = `announcement_like_${organisationId}_${employeeId}_${announcementId}`;

  //   useEffect(() => {
  //     if (!organisationId || !employeeId || !announcementId) return;

  //     setHasUnliked(localStorage.getItem(likeStorageKey) === "unliked");
  //   }, [likeStorageKey, organisationId, employeeId, announcementId]);

  //04092026
  // useEffect(() => {
  //   if (!isEditing || !editInputRef.current) return;
  //   const input = editInputRef.current;
  //   input.focus();
  //   const end = input.value?.length || 0;
  //   input.setSelectionRange(end, end);
  // }, [isEditing]);

  const fetchEmployees = useCallback(
    async ({ searchTerm = "", nextOffset = 0, append = false } = {}) => {
      if (!organisationId || !isOpen) return;

      const reqId = ++requestIdRef.current;
      try {
        if (append) setLoadingMoreEmployees(true);
        else setLoadingEmployees(true);

        const encodedOrgId = encodeURIComponent(organisationId);
        const encodedSearch = encodeURIComponent(searchTerm);
        const url = `/employee/get_employees_list?org_id=${encodedOrgId}&search=${encodedSearch}&offset=${nextOffset}&limit=${limit}`;
        const res = await api.get(url);
        const list = res?.data?.data || [];
        const safeList = Array.isArray(list) ? list : [];

        if (reqId !== requestIdRef.current) return;

        setEmployees((prev) => {
          if (!append) return safeList;

          const existingIds = new Set(
            prev.map((emp) => emp.employee_id || emp.id),
          );
          const deduped = safeList.filter(
            (emp) => !existingIds.has(emp.employee_id || emp.id),
          );
          return [...prev, ...deduped];
        });

        setOffset(nextOffset + safeList.length);
        setHasMore(safeList.length === limit);
      } catch (error) {
        console.error("Employee fetch error:", error);
        if (!append) {
          setEmployees([]);
          setOffset(0);
          setHasMore(false);
        }
      } finally {
        setLoadingEmployees(false);
        setLoadingMoreEmployees(false);
      }
    },
    [organisationId, isOpen],
  );

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 350);

    return () => clearTimeout(timer);
  }, [search, isOpen]);

  useEffect(() => {
    if (!isOpen || !organisationId) return;

    setOffset(0);
    setHasMore(true);
    fetchEmployees({
      searchTerm: debouncedSearch,
      nextOffset: 0,
      append: false,
    });
  }, [isOpen, organisationId, debouncedSearch, fetchEmployees]);

  useEffect(() => {
    if (isOpen) return;

    setSearch("");
    setDebouncedSearch("");
    setEmployees([]);
    setOffset(0);
    setHasMore(true);
    setLoadingEmployees(false);
    setLoadingMoreEmployees(false);
  }, [isOpen]);

  //   const handleLike = async () => {
  //     if (!organisationId || !employeeId || !announcementId || liking) return;

  //     const wasLiked = isLiked;
  //     const previousLikesCount = likesCount;
  //     const optimisticLiked = !wasLiked;
  //     const optimisticLikesCount = Math.max(
  //       0,
  //       previousLikesCount + (optimisticLiked ? 1 : -1),
  //     );

  //     try {
  //       const count = optimisticLiked ? 1 : -1;
  //       setLiking(true);
  //       setIsLiked(optimisticLiked);
  //       setLikesCount(optimisticLikesCount);

  //       const res = await api.put("/announcement/like_announcement", {
  //         organisation_id: organisationId,
  //         employee_id: employeeId,
  //         announcement_id: announcementId,
  //         count,
  //       });

  //       const responseData = res?.data?.data || res?.data || {};
  //       const serverLiked = getServerLikeState(responseData);
  //       const serverLikes = getServerLikeCount(responseData);

  //       if (typeof serverLiked === "boolean") {
  //         setIsLiked(serverLiked);
  //       }

  //       if (Number.isFinite(serverLikes)) {
  //         setLikesCount(serverLikes);
  //       }
  //     } catch (error) {
  //       console.error("Failed to like announcement:", error);
  //       setIsLiked(wasLiked);
  //       setLikesCount(previousLikesCount);
  //     } finally {
  //       setLiking(false);
  //     }
  //   };
  const handleLike = async () => {
    if (
      !organisationId ||
      !employeeId ||
      !announcementId ||
      likingRef.current
    ) {
      return;
    }

    likingRef.current = true;
    setLiking(true);

    const previousLiked = isLiked;
    const previousLikesCount = likesCount;

    // Determine the action for this particular announcement.
    const count = previousLiked ? -1 : 1;

    let requestSucceeded = false;

    try {
      // STEP 1: Update the clicked announcement.
      await api.put("/announcement/like_announcement", {
        organisation_id: organisationId,
        employee_id: employeeId,
        announcement_id: announcementId,
        count,
      });

      requestSucceeded = true;

      // STEP 2: Retrieve this announcement's latest state.
      if (typeof onLikeChange !== "function") {
        throw new Error("Announcement refresh callback is missing");
      }

      const updatedAnnouncement = await onLikeChange(announcementId);

      // STEP 3: Use the API response as the source of truth.
      if (typeof updatedAnnouncement?.is_liked !== "boolean") {
        throw new Error("Updated is_liked value is missing");
      }

      setIsLiked(updatedAnnouncement.is_liked);
      setLikesCount(getLikesCount(updatedAnnouncement));
    } catch (error) {
      console.error("Failed to update announcement like:", error);

      if (!requestSucceeded) {
        setIsLiked(previousLiked);
        setLikesCount(previousLikesCount);
      }

      toast({
        title: requestSucceeded
          ? "Like updated, but refresh failed"
          : "Unable to update like",
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      likingRef.current = false;
      setLiking(false);
    }
  };
  const handlePin = async () => {
    if (!organisationId || !employeeId || !announcementId || pinning) return;

    const nextPinnedState = !isPinned;
    try {
      setPinning(true);
      await api.put("/announcement/pin_announcement", {
        organisation_id: organisationId,
        announcement_id: announcementId,
        is_pinned: nextPinnedState,
        pinned_by: employeeId,
      });
      setIsPinned(nextPinnedState);
      if (typeof onPinnedChange === "function") {
        onPinnedChange();
      }
    } catch (error) {
      console.error("Failed to pin announcement:", error);
    } finally {
      setPinning(false);
    }
  };

  const handleDelete = async () => {
    if (!organisationId || !announcementId || deleting) return;

    try {
      setDeleting(true);

      await api.delete("/announcement/delete_announcement", {
        params: {
          announcement_id: announcementId,
          organisation_id: organisationId,
        },
      });

      toast({
        title: "Post deleted",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      onDeleteConfirmClose();

      if (typeof onPinnedChange === "function") {
        onPinnedChange();
      }
    } catch (error) {
      console.error("Failed to delete announcement:", error);

      toast({
        title: "Delete failed",
        description: error?.response?.data?.message || "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setDeleting(false);
    }
  };
  //old
  // const handleEditStart = () => {
  //   setEditedDescription(description);
  //   setIsEditing(true);
  // };
  //new 04092026
  // const handleEditStart = () => {
  //   setEditedDescription(description || "");
  //   setIsEditing(true);
  // };
  //new 05092026
  const handleEditStart = () => {
    setEditedDescription(description || "");

    const metadata = post?.mention_metadata;

    if (metadata?.type === "all") {
      setEditedMentions({
        all: true,
        employee_ids: [],
      });
    } else if (metadata?.type === "employees") {
      const employeeIds = Array.isArray(metadata?.mentions)
        ? metadata.mentions
            .filter((mention) => mention?.type === "employee")
            .map((mention) => mention.employee_id)
            .filter(Boolean)
        : [];

      setEditedMentions({
        all: false,
        employee_ids: employeeIds,
      });
    } else {
      setEditedMentions({
        all: false,
        employee_ids: [],
      });
    }

    // Initialize edit visibility from the post. If the API has no employee
    // visibility, default to ALL exactly like Create Post.
    const postVisibleTo = Array.isArray(post?.visible_to)
      ? post.visible_to.map((item) => String(item || "").trim()).filter(Boolean)
      : [];

    const hasAllVisibility = postVisibleTo.some(
      (item) => item.toLowerCase() === "all",
    );

    const visibleEmployeeIds = postVisibleTo.filter((item) =>
      /^EMP/i.test(item),
    );

    if (hasAllVisibility || visibleEmployeeIds.length === 0) {
      setEditVisibility("ALL");
      setSelectedEmployees([]);
    } else {
      setEditVisibility("SELECTED");
      setSelectedEmployees([...new Set(visibleEmployeeIds)]);
    }

    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!organisationId || !announcementId || isSaving) return;

    const trimmedDescription = editedDescription.trim();
    if (!trimmedDescription) {
      toast({
        title: "Description is required",
        status: "warning",
        duration: 2500,
        isClosable: true,
      });
      return;
    }

    // Visibility is part of the edit payload, so a visibility-only edit must
    // still be submitted.
    const visibleToPayload =
      editVisibility === "ALL" || selectedEmployees.filter(Boolean).length === 0
        ? ["all"]
        : [...new Set(selectedEmployees.filter(Boolean))];

    const originalVisibleTo = Array.isArray(post?.visible_to)
      ? post.visible_to
          .map((item) =>
            String(item || "")
              .trim()
              .toLowerCase(),
          )
          .filter(Boolean)
      : ["all"];
    const visibilityChanged =
      JSON.stringify([...new Set(originalVisibleTo)].sort()) !==
      JSON.stringify(
        [...new Set(visibleToPayload.map((item) => item.toLowerCase()))].sort(),
      );

    if (trimmedDescription === description.trim() && !visibilityChanged) {
      setIsEditing(false);
      return;
    }

    try {
      setIsSaving(true);
      //old
      // await api.put("/announcement/update_announcement", {
      //   announcement_id: announcementId,
      //   organisation_id: organisationId,
      //   description: trimmedDescription,
      //   mentions: {
      //     all: editedMentions.all,
      //     employee_ids: editedMentions.employee_ids,
      //   },
      // });
      //new
      // Keep UPDATE mention payload identical in shape to CREATE.
      // Existing mention IDs are initialized into AnnouncementEditor and new
      // IDs are appended there, so this array represents the complete final set.
      let mentionEmployeeIds = Array.isArray(editedMentions?.employee_ids)
        ? [...new Set(editedMentions.employee_ids.filter(Boolean))]
        : [];

      // If an existing mention was deleted from the description while editing,
      // remove its ID too. Newly selected mentions are already in editedMentions.
      const originalMentions = Array.isArray(post?.mention_metadata?.mentions)
        ? post.mention_metadata.mentions
        : [];

      if (!editedMentions?.all && originalMentions.length > 0) {
        const lowerDescription = trimmedDescription.toLowerCase();

        const deletedOriginalIds = originalMentions
          .filter((mention) => mention?.type === "employee")
          .filter((mention) => {
            const token = String(mention?.token || `@${mention?.name || ""}`)
              .trim()
              .toLowerCase();
            return token && !lowerDescription.includes(token);
          })
          .map((mention) => mention.employee_id)
          .filter(Boolean);

        if (deletedOriginalIds.length > 0) {
          const deletedSet = new Set(deletedOriginalIds);
          mentionEmployeeIds = mentionEmployeeIds.filter(
            (id) => !deletedSet.has(id),
          );
        }
      }

      const payload = {
        announcement_id: announcementId,
        organisation_id: organisationId,
        description: trimmedDescription,
        // Same visibility contract as Create Post: ALL is always explicit.
        visible_to: visibleToPayload,
        mentions: {
          all: Boolean(editedMentions?.all),
          employee_ids: mentionEmployeeIds,
        },
      };

      console.log("Announcement update payload:", payload);

      await api.put("/announcement/update_announcement", payload);
      //new end
      toast({
        title: "Post updated",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      setIsEditing(false);
      if (typeof onPinnedChange === "function") {
        onPinnedChange();
      }
    } catch (error) {
      console.error("Failed to update announcement:", error);
      toast({
        title: "Update failed",
        description: error?.response?.data?.message || "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
  if (isSaving) return;

  setIsEditing(false);
  setEditedDescription(description || "");
  setSelectedEmployees([]);
  setEditVisibility("ALL");
  setEditedMentions({
    all: false,
    employee_ids: [],
  });
};

  const handleEditorMentionsChange = useCallback((mentions) => {
    const ids = Array.isArray(mentions?.employee_ids)
      ? [...new Set(mentions.employee_ids.filter(Boolean))]
      : [];

    setEditedMentions({
      all: Boolean(mentions?.all),
      employee_ids: ids,
    });
  }, []);

  const handleShowForAll = async () => {
    // In Edit Post, only change local state. The final update_announcement
    // request will carry visible_to: ["all"].
    if (isEditing) {
      setEditVisibility("ALL");
      setSelectedEmployees([]);
      return;
    }

    if (
      !organisationId ||
      !announcementId ||
      updatingVisibility ||
      isVisibleToAll
    )
      return;

    try {
      setUpdatingVisibility(true);
      await api.put("/announcement/update_announcement_visibility", {
        announcement_id: announcementId,
        organisation_id: organisationId,
        visible_to: ["All"],
      });
      toast({
        title: "Visibility updated",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      if (typeof onPinnedChange === "function") {
        onPinnedChange();
      }
    } catch (error) {
      console.error("Failed to update announcement visibility:", error);
      toast({
        title: "Visibility update failed",
        description: error?.response?.data?.message || "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setUpdatingVisibility(false);
    }
  };

  const handleEmployeeListScroll = (e) => {
    if (loadingEmployees || loadingMoreEmployees || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const threshold = 24;
    if (scrollHeight - scrollTop - clientHeight <= threshold) {
      fetchEmployees({
        searchTerm: debouncedSearch,
        nextOffset: offset,
        append: true,
      });
    }
  };

  const handleCheckbox = (empId) => {
    if (!empId) return;
    setSelectedEmployees((prev) =>
      prev.includes(empId)
        ? prev.filter((id) => id !== empId)
        : [...prev, empId],
    );
  };

  const handleOpenSelectedEmployeesModal = () => {
    // In edit mode preserve the current edit selection while the modal is open.
    if (isEditing) {
      setSelectedEmployees((prev) => {
        if (prev.length > 0) return prev;

        const presetSelection = Array.isArray(post?.visible_to)
          ? post.visible_to
              .map((item) => String(item || "").trim())
              .filter((item) => /^EMP/i.test(item))
          : [];

        return [...new Set(presetSelection)];
      });
      onOpen();
      return;
    }

    const presetSelection = Array.isArray(post?.visible_to)
      ? post.visible_to
          .map((item) => String(item || "").trim())
          .filter((item) => /^EMP/i.test(item))
      : [];
    setSelectedEmployees(presetSelection);
    onOpen();
  };

  const handleApplySelectedEmployees = async () => {
    if (!organisationId || !announcementId || updatingVisibility) return;

    const visibilityList = [...new Set(selectedEmployees.filter(Boolean))];

    // In Edit Post, no selected employees means ALL. Do not call the separate
    // visibility endpoint here; save everything together through update_announcement.
    if (isEditing) {
      if (visibilityList.length === 0) {
        setEditVisibility("ALL");
        setSelectedEmployees([]);
      } else {
        setEditVisibility("SELECTED");
        setSelectedEmployees(visibilityList);
      }
      onClose();
      return;
    }

    if (visibilityList.length === 0) {
      toast({
        title: "Select at least one employee",
        status: "warning",
        duration: 2500,
        isClosable: true,
      });
      return;
    }

    try {
      setUpdatingVisibility(true);
      await api.put("/announcement/update_announcement_visibility", {
        announcement_id: announcementId,
        organisation_id: organisationId,
        visible_to: visibilityList,
      });
      toast({
        title: "Visibility updated",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      onClose();
      if (typeof onPinnedChange === "function") {
        onPinnedChange();
      }
    } catch (error) {
      console.error("Failed to update selected employee visibility:", error);
      toast({
        title: "Visibility update failed",
        description: error?.response?.data?.message || "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setUpdatingVisibility(false);
    }
  };

  return (
    <>
      <Box
        bg="white"
        border="1px solid #cccccc"
        borderRadius="12px"
        px={{ base: 4, md: 6 }}
        py={{ base: 4, md: 5 }}
      >
        <Flex justify="space-between" align="start" gap={4}>
          <Flex gap={4}>
            <Avatar name={author} size="md" />
            <Box>
              <Flex align="center" gap={2} flexWrap="wrap">
                <Text
                  fontFamily="'Poppins', sans-serif"
                  fontSize={{ base: "16px", md: "18px" }}
                  lineHeight="1"
                  fontWeight="500"
                  color="#151515"
                >
                  {author}
                </Text>
                <HiBadgeCheck size={18} />
                <Text
                  fontFamily="'Poppins', sans-serif"
                  fontSize={{ base: "12px", md: "14px" }}
                  color="#6C6C6C"
                >
                  {dateText}
                </Text>
              </Flex>
              <Text
                mt={1}
                fontFamily="'Poppins', sans-serif"
                fontSize={{ base: "12px", md: "14px" }}
                color="#2E2E2E"
              >
                {designation}
              </Text>
            </Box>
          </Flex>

          <Flex align="center" gap={2}>
            {isEditing && isAdmin ? (
              <Flex align="center" gap={2}>
                <Button
                  size="sm"
                  variant="outline"
                  borderColor="#1F3661"
                  color="#1F3661"
                  onClick={handleCancelEdit}
                  isDisabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  bg="#1F3661"
                  color="white"
                  _hover={{ bg: "#162843" }}
                  onClick={handleSaveEdit}
                  isLoading={isSaving}
                >
                  Save
                </Button>
              </Flex>
            ) : (
              <>
                <IconButton
                  aria-label="Pin announcement"
                  variant="ghost"
                  color={isPinned ? "#1F3661" : "#1C1C1C"}
                  size="md"
                  onClick={handlePin}
                  isLoading={pinning}
                >
                  <Img
                    src={isPinned ? pinned : pin}
                    alt={isPinned ? "Pinned" : "Pin"}
                    boxSize={isPinned ? 6 : 8}
                  />
                </IconButton>
                {isAdmin && (
                  <Menu placement="bottom-end">
                    <MenuButton
                      as={IconButton}
                      aria-label="More actions"
                      icon={<FiMoreHorizontal />}
                      variant="ghost"
                      color="#8B8B8B"
                      border="1px solid #cccccc"
                      size="md"
                    />
                    <MenuList
                      minW={{ base: "180px", md: "200px" }}
                      border="1px solid #BFBFBF"
                      borderRadius="24px"
                      p={4}
                      boxShadow="md"
                    >
                      <MenuItem
                        icon={<FiEdit2 size={22} />}
                        fontFamily="'Poppins', sans-serif"
                        fontWeight="500"
                        fontSize={{ base: "12px", md: "14px" }}
                        color="#444444"
                        bg="transparent"
                        px={2}
                        py={3}
                        borderBottom="1px solid #D1D1D1"
                        _hover={{ bg: "#F7F7F7" }}
                        _focus={{ bg: "#F7F7F7" }}
                        onClick={handleEditStart}
                      >
                        Edit Post
                      </MenuItem>
                      <MenuItem
                        icon={<BsCircle size={22} />}
                        fontFamily="'Poppins', sans-serif"
                        fontWeight="500"
                        fontSize={{ base: "12px", md: "14px" }}
                        color="#444444"
                        bg="transparent"
                        px={2}
                        py={3}
                        borderBottom="1px solid #D1D1D1"
                        _hover={{ bg: "#F7F7F7" }}
                        _focus={{ bg: "#F7F7F7" }}
                        onClick={handleShowForAll}
                        isDisabled={isVisibleToAll || updatingVisibility}
                      >
                        Show for all Employees
                      </MenuItem>
                      <MenuItem
                        icon={<FiLock size={22} />}
                        fontFamily="'Poppins', sans-serif"
                        fontWeight="500"
                        fontSize={{ base: "12px", md: "14px" }}
                        color="#444444"
                        bg="transparent"
                        px={2}
                        py={3}
                        borderBottom="1px solid #D1D1D1"
                        _hover={{ bg: "#F7F7F7" }}
                        _focus={{ bg: "#F7F7F7" }}
                        onClick={handleOpenSelectedEmployeesModal}
                        isDisabled={updatingVisibility}
                      >
                        Only for Selected Employees
                      </MenuItem>
                      <MenuItem
                        icon={<FiTrash2 size={22} />}
                        fontFamily="'Poppins', sans-serif"
                        fontWeight="500"
                        fontSize={{ base: "12px", md: "14px" }}
                        color="#444444"
                        bg="transparent"
                        px={2}
                        py={3}
                        borderBottom="1px solid #D1D1D1"
                        _hover={{ bg: "#F7F7F7" }}
                        _focus={{ bg: "#F7F7F7" }}
                        onClick={onDeleteConfirmOpen}
                        isDisabled={deleting}
                      >
                        Delete Post
                      </MenuItem>
                    </MenuList>
                  </Menu>
                )}
              </>
            )}
          </Flex>
        </Flex>

        <Box pl={{ base: 0, md: "84px" }} mt={6}>
          {/* <Text
          fontFamily="'Poppins', sans-serif"
          fontSize={{ base: "12px", md: "14px" }}
          lineHeight="1.15"
          fontWeight="400"
          color="#171717"
        >
          {title}
        </Text> */}
          {isEditing ? (
            <Box mt={4}>
              {/* old */}
              {/* <AnnouncementEditor
                initialContent={description}
                onChange={(value) => {
                  setEditedDescription(value);
                }}
              /> */}
              <AnnouncementEditor
                value={editedDescription}
                organisationId={organisationId}
                mentionMetadata={post?.mention_metadata}
                enableMentions={true}
                initialMentions={editedMentions}
                showVisibility={true}
                visibility={editVisibility}
                selectedEmployees={selectedEmployees}
                onSelectedEmployeesChange={setSelectedEmployees}
                onShowAll={handleShowForAll}
                onSelectEmployees={handleOpenSelectedEmployeesModal}
                onChange={(value) => {
                  setEditedDescription(value);
                }}
                onMentionsChange={handleEditorMentionsChange}
              />
            </Box>
          ) : (
            // <Textarea
            //   ref={editInputRef}
            //   mt={4}
            //   value={editedDescription}
            //   onChange={(e) => setEditedDescription(e.target.value)}
            //   fontFamily="'Poppins', sans-serif"
            //   fontSize={{ base: "14px", md: "16px" }}
            //   lineHeight="1.35"
            //   color="#111111"
            //   minH="96px"
            //   resize="vertical"
            // />
            <Text
              mt={4}
              fontFamily="'Poppins', sans-serif"
              fontSize={{ base: "14px", md: "16px" }}
              lineHeight="1.35"
              color="#111111"
              whiteSpace="pre-wrap"
            >
              {/* {description} */}
              {renderDescriptionWithMentions(
                description,
                post?.mention_metadata,
              )}
            </Text>
          )}
        </Box>

        <Divider my={6} borderColor="#CFCFCF" />

        <Flex align="center" px={{ base: 0, md: "40px" }}>
          {/* <Flex
            align="center"
            gap={2}
            cursor={liking ? "not-allowed" : "pointer"}
            onClick={handleLike}
            opacity={liking ? 0.7 : 1}
          >
            {isLiked ? (
              <BiSolidLike size={25} color="#1A73E8" />
            ) : (
              <BiLike size={25} />
            )}
            <Text
              fontFamily="'Poppins', sans-serif"
              fontSize={{ base: "14px", md: "18px" }}
              color="#4A4A4A"
            >
              {likesCount}
            </Text>
          </Flex> */}
          <Flex
            as="button"
            type="button"
            align="center"
            gap={2}
            cursor={liking ? "not-allowed" : "pointer"}
            opacity={liking ? 0.5 : 1}
            onClick={handleLike}
            disabled={liking}
            aria-label={isLiked ? "Unlike announcement" : "Like announcement"}
          >
            {isLiked ? (
              <BiSolidLike size={25} color="#1A73E8" />
            ) : (
              <BiLike size={25} />
            )}

            <Text
              fontFamily="'Poppins', sans-serif"
              fontSize={{ base: "14px", md: "18px" }}
              color="#4A4A4A"
            >
              {likesCount}
            </Text>
          </Flex>
        </Flex>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent borderRadius="16px">
          <ModalHeader>Select Employees</ModalHeader>

          <ModalBody>
            <Input
              placeholder="Search"
              mb={4}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {loadingEmployees ? (
              <Flex justify="center">
                <Spinner />
              </Flex>
            ) : (
              <VStack
                align="start"
                spacing={3}
                maxH="300px"
                overflowY="auto"
                onScroll={handleEmployeeListScroll}
                w="full"
              >
                {employees.map((emp) => {
                  const empId = emp.employee_id || emp.id;
                  const fullName =
                    emp.full_name ||
                    `${emp.first_name || ""} ${emp.last_name || ""}`.trim() ||
                    "Unnamed Employee";

                  return (
                    <Checkbox
                      key={empId}
                      isChecked={selectedEmployees.includes(empId)}
                      onChange={() => handleCheckbox(empId)}
                    >
                      <Text>{fullName}</Text>
                    </Checkbox>
                  );
                })}
                {loadingMoreEmployees && (
                  <Flex justify="center" w="full" py={2}>
                    <Spinner size="sm" />
                  </Flex>
                )}
              </VStack>
            )}
          </ModalBody>

          <ModalFooter>
            <Button
              bg="#1F3661"
              color="white"
              _hover={{ bg: "#162843" }}
              onClick={handleApplySelectedEmployees}
              isLoading={updatingVisibility}
            >
              Apply
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isDeleteConfirmOpen}
        onClose={onDeleteConfirmClose}
        size="sm"
      >
        <ModalOverlay />
        <ModalContent borderRadius="16px">
          <ModalHeader>Confirm Delete</ModalHeader>
          <ModalBody>
            <Text>Do you want to Delete this post?</Text>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={onDeleteConfirmClose}
              isDisabled={deleting}
            >
              No
            </Button>
            <Button
              bg="#C53030"
              color="white"
              _hover={{ bg: "#9B2C2C" }}
              onClick={handleDelete}
              isLoading={deleting}
            >
              Yes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
