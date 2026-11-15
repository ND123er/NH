import React, { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Flex,
  Textarea,
  Avatar,
  Button,
  IconButton,
  Spacer,
  Img,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Checkbox,
  VStack,
  useDisclosure,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { FiArrowRight, FiChevronDown } from "react-icons/fi";
import { FaEye } from "react-icons/fa";
import { addPost } from "../../slices/announcements/announcementsSlice";
import api from "../../api/axios";
import clip from "../../assets/clip.svg";
import smiley from "../../assets/smiley.svg";
import select_image from "../../assets/select_image.svg";
import atherate from "../../assets/atherate.svg";
import announcement_settings from "../../assets/announcement_settings.svg";
import EmojiPicker from "emoji-picker-react";

export default function Composer({ onPosted }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  // console.log("Announcement Composer User:", user);
  const [adminName, setAdminName] = useState("");

  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState("ALL");
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingMoreEmployees, setLoadingMoreEmployees] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  // new implement
  const [mentionQuery, setMentionQuery] = useState("");
  const [showMentionList, setShowMentionList] = useState(false);
  const [mentionEmployees, setMentionEmployees] = useState([]);
  const [mentionAll, setMentionAll] = useState(false);
  const [mentionLoading, setMentionLoading] = useState(false);
  const [mentionedEmployees, setMentionedEmployees] = useState([]);
  //end
  const limit = 20;
  const requestIdRef = useRef(0);
  const emojiPickerRef = useRef(null);
  const editorRef = useRef(null);
  const savedRangeRef = useRef(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const orgId = user?.organisation_id || user?.org_id;
  useEffect(() => {
    const employeeId = user?.employee_id;

    if (!employeeId) {
      setAdminName("");
      return;
    }

    let cancelled = false;

    const fetchAdminDetails = async () => {
      try {
        const res = await api.get(
          `/employee/get_admin_detail?employee_id=${encodeURIComponent(employeeId)}`,
        );

        const admin = res?.data?.result;

        const fullName = [admin?.first_name, admin?.last_name]
          .filter(Boolean)
          .join(" ")
          .trim();

        if (!cancelled) {
          setAdminName(fullName);
        }
      } catch (error) {
        if (!cancelled) {
          setAdminName("");
          console.error("Failed to fetch admin details:", error);
        }
      }
    };

    fetchAdminDetails();

    return () => {
      cancelled = true;
    };
  }, [user?.employee_id]);
  //new
  // const userName =
  //   user?.full_name ||
  //   `${user?.first_name || ""} ${user?.last_name || ""}`.trim() ||
  //   user?.name ||
  //   user?.employee_name ||
  //   "User";
  const userName =
    adminName ||
    user?.full_name ||
    `${user?.first_name || ""} ${user?.last_name || ""}`.trim() ||
    user?.name ||
    user?.employee_name ||
    "User";
  /* -------------------- FETCH EMPLOYEES -------------------- */
  const fetchEmployees = useCallback(
    async ({ searchTerm = "", nextOffset = 0, append = false } = {}) => {
      if (!orgId || !isOpen) return;

      const reqId = ++requestIdRef.current;
      try {
        if (append) setLoadingMoreEmployees(true);
        else setLoadingEmployees(true);

        const encodedOrgId = encodeURIComponent(orgId);
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
      } catch (err) {
        console.error("Employee fetch error:", err);
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
    [orgId, isOpen],
  );

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 350);

    return () => clearTimeout(timer);
  }, [search, isOpen]);

  useEffect(() => {
    if (!isOpen || !orgId) return;

    setOffset(0);
    setHasMore(true);
    fetchEmployees({
      searchTerm: debouncedSearch,
      nextOffset: 0,
      append: false,
    });
  }, [isOpen, orgId, debouncedSearch, fetchEmployees]);

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

  useEffect(() => {
    if (!showEmojiPicker) return;

    const handleOutsideClick = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [showEmojiPicker]);

  /* -------------------- HANDLE CHECKBOX -------------------- */
  const handleCheckbox = (empId) => {
    if (!empId) return;
    setSelectedEmployees((prev) =>
      prev.includes(empId)
        ? prev.filter((id) => id !== empId)
        : [...prev, empId],
    );
  };

  /* -------------------- APPLY SELECTION -------------------- */
  const handleApplySelection = () => {
    setVisibility("SELECTED");
    onClose();
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
  /* -------------------- Mention Employee -------------------- */
  const handleEditorInput = (e) => {
    const editor = e.currentTarget;

    const text = editor.innerText;
    setContent(text);

    const selection = window.getSelection();

    if (selection && selection.rangeCount) {
      const range = selection.getRangeAt(0);

      if (editor.contains(range.startContainer)) {
        savedRangeRef.current = range.cloneRange();
      }
    }

    if (!selection || !selection.rangeCount) {
      setShowMentionList(false);
      return;
    }

    const range = selection.getRangeAt(0);

    if (range.startContainer.nodeType !== Node.TEXT_NODE) {
      setMentionQuery("");
      setShowMentionList(false);
      return;
    }

    const textBeforeCursor = range.startContainer.textContent.slice(
      0,
      range.startOffset,
    );

    const match = textBeforeCursor.match(/@([a-zA-Z0-9._-]*)$/);

    if (match) {
      setMentionQuery(match[1]);
      setShowMentionList(true);
    } else {
      setMentionQuery("");
      setShowMentionList(false);
    }
  };

  /* -------------------- Mention Employee end-------------------- */

  /* -------------------- Text Change-------------------- */
  const handleTextCase = () => {
    const editor = editorRef.current;

    if (!editor) return;

    const selection = window.getSelection();

    if (!selection || !selection.rangeCount) return;

    const range = selection.getRangeAt(0);

    // Make sure selection is inside the editor
    if (!editor.contains(range.commonAncestorContainer)) return;

    // Nothing selected
    if (range.collapsed) return;

    const selectedText = selection.toString();

    if (!selectedText) return;

    // Toggle case
    const isAllUpperCase = selectedText === selectedText.toUpperCase();

    const newText = isAllUpperCase
      ? selectedText.toLowerCase()
      : selectedText.toUpperCase();

    // Replace selected text with a span that inherits
    // the editor's existing font styling
    range.deleteContents();

    const span = document.createElement("span");

    span.style.fontFamily = "inherit";
    span.style.fontSize = "inherit";
    span.style.fontWeight = "inherit";
    span.style.lineHeight = "inherit";
    span.style.color = "inherit";

    span.textContent = newText;

    range.insertNode(span);

    // Select the newly changed text
    const newRange = document.createRange();

    newRange.setStart(span.firstChild, 0);
    newRange.setEnd(span.firstChild, newText.length);

    selection.removeAllRanges();
    selection.addRange(newRange);

    // Update React state
    setContent(editor.innerText);

    // Save selection for emoji/cursor handling
    savedRangeRef.current = newRange.cloneRange();
  };

  /* -------------------- Text Change end-------------------- */

  /* -------------------- Fetch Mention Employee start-------------------- */
  const fetchMentionEmployees = useCallback(
    async (searchTerm) => {
      if (!orgId) return;

      try {
        setMentionLoading(true);

        const encodedOrgId = encodeURIComponent(orgId);
        const encodedSearch = encodeURIComponent(searchTerm);

        const url = `/employee/get_employees_list?org_id=${encodedOrgId}&search=${encodedSearch}&offset=0&limit=10`;

        const res = await api.get(url);

        const list = res?.data?.data || [];

        // setMentionEmployees(Array.isArray(list) ? list : []);
        const employeeList = Array.isArray(list) ? list : [];

        setMentionEmployees([
          {
            employee_id: "__ALL__",
            full_name: "all",
          },
          ...employeeList,
        ]);
      } catch (error) {
        console.error("Mention employee fetch error:", error);
        setMentionEmployees([]);
      } finally {
        setMentionLoading(false);
      }
    },
    [orgId],
  );
  useEffect(() => {
    if (!showMentionList) return;

    fetchMentionEmployees(mentionQuery);
  }, [mentionQuery, showMentionList, fetchMentionEmployees]);

  /* -------------------- Fetch Mention Employee end-------------------- */

  /* -------------------- Insert Employee Start-------------------- */
  //old
  // const handleMentionSelect = (employee) => {
  //   const editor = editorRef.current;

  //   if (!editor) return;

  //   const selection = window.getSelection();

  //   if (!selection || !selection.rangeCount) return;

  //   const range = selection.getRangeAt(0);

  //   if (range.startContainer.nodeType !== Node.TEXT_NODE) {
  //     return;
  //   }

  //   const textNode = range.startContainer;
  //   const cursorPosition = range.startOffset;

  //   const textBeforeCursor = textNode.textContent.slice(0, cursorPosition);

  //   const match = textBeforeCursor.match(/@([a-zA-Z0-9._-]*)$/);

  //   if (!match) return;

  //   const mentionStart = cursorPosition - match[0].length;

  //   const mentionText = `@${employee.full_name}`;

  //   // Split text node
  //   const beforeText = textNode.textContent.slice(0, mentionStart);
  //   const afterText = textNode.textContent.slice(cursorPosition);

  //   const beforeNode = document.createTextNode(beforeText);

  //   const mentionNode = document.createElement("span");
  //   mentionNode.textContent = mentionText;
  //   mentionNode.style.color = "#3182CE";
  //   mentionNode.style.fontWeight = "500";
  //   mentionNode.dataset.employeeId = employee.employee_id;

  //   const afterNode = document.createTextNode(` ${afterText}`);

  //   const parent = textNode.parentNode;

  //   parent.replaceChild(afterNode, textNode);
  //   parent.insertBefore(mentionNode, afterNode);
  //   parent.insertBefore(beforeNode, mentionNode);

  //   // Add employee to mentioned list
  //   setMentionedEmployees((prev) => {
  //     const alreadyMentioned = prev.some(
  //       (item) => item.employee_id === employee.employee_id,
  //     );

  //     if (alreadyMentioned) return prev;

  //     return [...prev, employee];
  //   });

  //   setShowMentionList(false);
  //   setMentionQuery("");

  //   // Put cursor after mention
  //   requestAnimationFrame(() => {
  //     editor.focus();

  //     const newRange = document.createRange();

  //     newRange.setStart(afterNode, 1);
  //     newRange.collapse(true);

  //     selection.removeAllRanges();
  //     selection.addRange(newRange);

  //     // Update content
  //     setContent(editor.innerText);
  //   });
  // };
  //new
  const handleMentionSelect = (employee) => {
    const editor = editorRef.current;

    if (!editor) return;

    const selection = window.getSelection();

    if (!selection || !selection.rangeCount) return;

    const range = selection.getRangeAt(0);

    if (range.startContainer.nodeType !== Node.TEXT_NODE) {
      return;
    }

    const textNode = range.startContainer;
    const cursorPosition = range.startOffset;

    const textBeforeCursor = textNode.textContent.slice(0, cursorPosition);

    const match = textBeforeCursor.match(/@([a-zA-Z0-9._-]*)$/);

    if (!match) return;

    const mentionStart = cursorPosition - match[0].length;

    // @all selection
    const isMentionAll = employee?.employee_id === "__ALL__";

    const mentionText = isMentionAll ? "@all" : `@${employee.full_name}`;

    const beforeText = textNode.textContent.slice(0, mentionStart);
    const afterText = textNode.textContent.slice(cursorPosition);

    const beforeNode = document.createTextNode(beforeText);

    const mentionNode = document.createElement("span");

    mentionNode.textContent = mentionText;
    mentionNode.style.color = "#3182CE";
    mentionNode.style.fontWeight = "500";

    if (!isMentionAll) {
      mentionNode.dataset.employeeId = employee.employee_id;
    }

    const afterNode = document.createTextNode(` ${afterText}`);

    const parent = textNode.parentNode;

    parent.replaceChild(afterNode, textNode);
    parent.insertBefore(mentionNode, afterNode);
    parent.insertBefore(beforeNode, mentionNode);

    if (isMentionAll) {
      // @all selected
      setMentionAll(true);
      setMentionedEmployees([]);
    } else {
      // Specific employee selected
      setMentionAll(false);

      setMentionedEmployees((prev) => {
        const alreadyMentioned = prev.some(
          (item) => item.employee_id === employee.employee_id,
        );

        if (alreadyMentioned) return prev;

        return [...prev, employee];
      });
    }

    setShowMentionList(false);
    setMentionQuery("");

    requestAnimationFrame(() => {
      editor.focus();

      const newRange = document.createRange();

      newRange.setStart(afterNode, 1);
      newRange.collapse(true);

      selection.removeAllRanges();
      selection.addRange(newRange);
      savedRangeRef.current = newRange.cloneRange();

      setContent(editor.innerText);
    });
  };

  /* -------------------- Insert Employee End-------------------- */

  /* -------------------- MENTION TOOLBAR BUTTON -------------------- */
  const handleMentionButton = (event) => {
    event?.preventDefault();

    const editor = editorRef.current;
    if (!editor) return;

    editor.focus();

    const selection = window.getSelection();
    if (!selection) return;

    if (savedRangeRef.current) {
      selection.removeAllRanges();
      selection.addRange(savedRangeRef.current);
    }

    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    if (!editor.contains(range.commonAncestorContainer)) return;

    range.deleteContents();

    const triggerNode = document.createTextNode("@");
    range.insertNode(triggerNode);
    range.setStartAfter(triggerNode);
    range.collapse(true);

    selection.removeAllRanges();
    selection.addRange(range);
    savedRangeRef.current = range.cloneRange();

    setMentionQuery("");
    setShowMentionList(true);
    setContent(editor.innerText || "");
  };

  /* -------------------- POST ANNOUNCEMENT -------------------- */
  //old
  // const handlePost = async () => {
  //   if (!content.trim()) return;

  //   try {
  //     const visibleToPayload =
  //       visibility === "ALL" ? ["all"] : selectedEmployees.filter(Boolean);

  //     const payload = {
  //       title: "Team Lead",
  //       description: content.trim(),
  //       organisation_id: orgId,
  //       created_by: user?.employee_id,
  //       visible_to: visibleToPayload,
  //     };

  //     const res = await api.post("/announcement/create_announcement", payload);

  //     dispatch(addPost(res.data));
  //     if (typeof onPosted === "function") onPosted();
  //     setContent("");
  //     if (editorRef.current) {
  //       editorRef.current.innerHTML = "";
  //     }
  //     setSelectedEmployees([]);
  //     setVisibility("ALL");
  //   } catch (error) {
  //     console.error("Post error:", error);
  //   }
  // };
  //new
  /* -------------------- POST ANNOUNCEMENT -------------------- */

  const handlePost = async () => {
    if (!content.trim()) return;

    try {
      const visibleToPayload =
        visibility === "ALL" ? ["all"] : selectedEmployees.filter(Boolean);
      const mentioningAll = isMentioningAll();
      const mentionEmployeeIds = mentionedEmployees
        .map((employee) => employee.employee_id)
        .filter(Boolean);

      const payload = {
        title: "Team Lead",
        description: content.trim(),
        organisation_id: orgId,
        created_by: user?.employee_id,
        visible_to: visibleToPayload,
      };

      // Add mentions only when someone is actually mentioned
      if (mentioningAll) {
        payload.mentions = {
          all: true,
          employee_ids: [],
        };
      } else if (mentionEmployeeIds.length > 0) {
        payload.mentions = {
          all: false,
          employee_ids: mentionEmployeeIds,
        };
      }

      console.log("Announcement payload:", payload);

      const res = await api.post("/announcement/create_announcement", payload);
      console.log("Logged-in user:", user);
      console.log("Employee ID:", user?.employee_id);
      console.log("Announcement payload:", payload);

      dispatch(addPost(res.data));

      if (typeof onPosted === "function") {
        onPosted();
      }

      setContent("");

      if (editorRef.current) {
        editorRef.current.innerHTML = "";
      }

      setSelectedEmployees([]);
      setMentionedEmployees([]);
      setMentionQuery("");
      setShowMentionList(false);
      setVisibility("ALL");
    } catch (error) {
      console.error("Post error:", error);
    }
  };

  //mentioning all
  const isMentioningAll = () => {
    const editor = editorRef.current;

    if (!editor) return false;

    const text = editor.innerText || "";

    return /(^|\s)@all(\s|$)/i.test(text);
  };
  //new

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      const editor = editorRef.current;

      if (!editor) return;

      const text = editor.innerText || "";

      // If the @ mention dropdown is open / @ is being completed
      if (/(^|\s)@$/i.test(text)) {
        e.preventDefault();

        // Insert @all instead of creating a new line
        document.execCommand("insertText", false, "all");

        return;
      }
    }
  };

  const handleEmojiClick = (emojiData) => {
    const editor = editorRef.current;

    if (!editor) return;

    editor.focus();

    const selection = window.getSelection();

    // Restore previously saved cursor
    if (savedRangeRef.current) {
      selection.removeAllRanges();
      selection.addRange(savedRangeRef.current);
    }

    const range = selection.getRangeAt(0);

    const emojiNode = document.createTextNode(emojiData.emoji);

    range.deleteContents();
    range.insertNode(emojiNode);

    // Put cursor immediately after emoji
    range.setStartAfter(emojiNode);
    range.collapse(true);

    selection.removeAllRanges();
    selection.addRange(range);

    // Save new cursor position
    savedRangeRef.current = range.cloneRange();

    // Sync React state
    setContent(editor.innerText);
  };

  /* -------------------- Render  mention -------------------- */

  /* -------------------- Render end -------------------- */

  return (
    <>
      <Box bg="white" border="1px solid #cccccc" borderRadius="10px" p={4}>
        {/* old code */}
        {/* <Flex align="flex-start" gap={3}>
          <Avatar size="md" />
          <Textarea
            placeholder="Create Announcement"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            bg="#F7FAFC"
            borderRadius="10px"
            px={4}
            py={3}
            resize="vertical"
            minH="84px"
          />
        </Flex> */}
        {/* new code mention */}
        <Flex align="flex-start" gap={3}>
          {/* <Avatar size="md" /> */}
          <Avatar size="md" name={userName} bg="#1F3661" color="white" />
          {/* before codeeditor */}
          {/* <Box position="relative" flex="1">
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              px={4}
              py={3}
              pointerEvents="none"
              whiteSpace="pre-wrap"
              overflow="hidden"
              // w="max-content"
              // color="#1A202C"
              fontSize="md"
              lineHeight="1.5"
              fontFamily="inherit"
              zIndex={8}
            >
              {renderMentionPreview()}
            </Box>

            <Textarea
              placeholder="Create Announcement"
              value={content}
              onChange={handleContentChange}
              bg="#F7FAFC"
              borderRadius="10px"
              px={4}
              py={3}
              resize="vertical"
              minH="84px"
              color="Black"
              caretColor="#1A202C"
              position="relative"
              zIndex={2}
              _focus={{
                borderColor: "#3182CE",
                boxShadow: "0 0 0 1px #3182CE",
              }}
              sx={{
                "&::placeholder": {
                  color: "#718096",
                },
              }}
            />

            {showMentionList && (
              <Box
                position="absolute"
                left={0}
                bottom="100%"
                mb={2}
                width="100%"
                top="100%"
                minH="220px"
                maxH="220px"
                overflowY="auto"
                bg="white"
                border="1px solid #E2E8F0"
                borderRadius="10px"
                boxShadow="lg"
                zIndex={20}
              >
                {mentionLoading ? (
                  <Flex justify="center" p={4}>
                    <Spinner size="sm" />
                  </Flex>
                ) : mentionEmployees.length === 0 ? (
                  <Text p={4} color="gray.500">
                    No employees found
                  </Text>
                ) : (
                  mentionEmployees.map((employee) => (
                    <Flex
                      key={employee.employee_id}
                      align="center"
                      gap={3}
                      p={3}
                      cursor="pointer"
                      _hover={{ bg: "#F7FAFC" }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleMentionSelect(employee);
                      }}
                    >
                      <Avatar size="sm" name={employee.full_name} />

                      <Box>
                        <Text fontWeight="500">{employee.full_name}</Text>

                        <Text fontSize="xs" color="gray.500">
                          {employee.employee_id}
                        </Text>
                      </Box>
                    </Flex>
                  ))
                )}
              </Box>
            )}
          </Box> */}
          {/* end */}
          <Box position="relative" flex="1">
            <Box
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              role="textbox"
              aria-multiline="true"
              minH="84px"
              bg="#F7FAFC"
              border="1px solid"
              borderColor="#E2E8F0"
              borderRadius="10px"
              px={4}
              py={3}
              fontSize="md"
              lineHeight="1.5"
              fontFamily="inherit"
              color="#1A202C"
              outline="none"
              whiteSpace="pre-wrap"
              wordBreak="break-word"
              overflowY="auto"
              _focus={{
                borderColor: "#3182CE",
                boxShadow: "0 0 0 1px #3182CE",
              }}
              onInput={handleEditorInput}
              onKeyDown={handleKeyDown}
              _empty={{
                "&::before": {
                  content: '"Create Announcement"',
                  color: "#718096",
                },
              }}
            />

            {showMentionList && (
              <Box
                position="absolute"
                left={0}
                top="100%"
                mt={2}
                width="100%"
                minH="220px"
                maxH="220px"
                overflowY="auto"
                bg="white"
                border="1px solid #E2E8F0"
                borderRadius="10px"
                boxShadow="lg"
                zIndex={20}
              >
                {mentionLoading ? (
                  <Flex justify="center" p={4}>
                    <Spinner size="sm" />
                  </Flex>
                ) : mentionEmployees.length === 0 ? (
                  <Text p={4} color="gray.500">
                    No employees found
                  </Text>
                ) : (
                  //old
                  // mentionEmployees.map((employee) => (
                  //   <Flex
                  //     key={employee.employee_id}
                  //     align="center"
                  //     gap={3}
                  //     p={3}
                  //     cursor="pointer"
                  //     _hover={{ bg: "#F7FAFC" }}
                  //     onMouseDown={(e) => {
                  //       e.preventDefault();
                  //       handleMentionSelect(employee);
                  //     }}
                  //   >
                  //     <Avatar size="sm" name={employee.full_name} />

                  //     <Box>
                  //       <Text fontWeight="500">{employee.full_name}</Text>

                  //       <Text fontSize="xs" color="gray.500">
                  //         {employee.employee_id}
                  //       </Text>
                  //     </Box>
                  //   </Flex>
                  // ))
                  mentionEmployees.map((employee) => (
                    <Flex
                      key={employee.employee_id}
                      align="center"
                      gap={3}
                      p={3}
                      cursor="pointer"
                      _hover={{ bg: "#F7FAFC" }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleMentionSelect(employee);
                      }}
                    >
                      {employee.employee_id === "__ALL__" ? (
                        <Avatar size="sm" name="All" bg="#1F3661" />
                      ) : (
                        <Avatar size="sm" name={employee.full_name} />
                      )}

                      <Box>
                        <Text fontWeight="500">
                          {employee.employee_id === "__ALL__"
                            ? "@all"
                            : employee.full_name}
                        </Text>

                        {employee.employee_id !== "__ALL__" && (
                          <Text fontSize="xs" color="gray.500">
                            {employee.employee_code}
                          </Text>
                        )}
                      </Box>
                    </Flex>
                  ))
                )}
              </Box>
            )}
          </Box>
        </Flex>

        {/* end */}

        <Box mt={2} pt={2}>
          {/* <Flex align="center" gap={2} ml={14} pl={2}> */}
          <Flex
            align="center"
            gap={2}
            ml={{ base: 0, md: 14 }}
            pl={{ base: 0, md: 2 }}
            wrap="wrap"
          >
            {/* ---------------- VISIBILITY DROPDOWN ---------------- */}
            <Menu>
              <MenuButton
                as={Button}
                leftIcon={<FaEye />}
                rightIcon={<FiChevronDown />}
                variant="outline"
                size="sm"
              >
                {visibility === "ALL" ? "All" : "Selected Employees"}
              </MenuButton>
              <MenuList>
                <MenuItem
                  onClick={() => {
                    setVisibility("ALL");
                    setSelectedEmployees([]);
                  }}
                >
                  All
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    onOpen();
                  }}
                >
                  Selected Employees
                </MenuItem>
              </MenuList>
            </Menu>

            {/* ---------------- ICON BUTTONS ---------------- */}
            <IconButton aria-label="Announcement settings" variant="ghost">
              <Img src={announcement_settings} h={6} w={6} />
            </IconButton>
            <IconButton aria-label="Add image" variant="ghost">
              <Img src={select_image} h={6} w={6} />
            </IconButton>
            {/* <IconButton aria-label="Add emoji" variant="ghost">
              <Img src={smiley} h={6} w={6} />
            </IconButton> */}
            <Box position="relative" ref={emojiPickerRef}>
              {/* <IconButton
                aria-label="Add emoji"
                variant="ghost"
                onClick={() => setShowEmojiPicker((prev) => !prev)}
              >
                <Img src={smiley} h={6} w={6} />
              </IconButton> */}
              <IconButton
                aria-label="Add emoji"
                variant="ghost"
                onMouseDown={(e) => {
                  e.preventDefault();

                  const selection = window.getSelection();

                  if (selection && selection.rangeCount) {
                    const range = selection.getRangeAt(0);

                    if (editorRef.current?.contains(range.startContainer)) {
                      savedRangeRef.current = range.cloneRange();
                    }
                  }
                }}
                onClick={() => setShowEmojiPicker((prev) => !prev)}
              >
                <Img src={smiley} h={6} w={6} />
              </IconButton>

              {showEmojiPicker && (
                <Box position="absolute" top="40px" zIndex="1000">
                  <EmojiPicker onEmojiClick={handleEmojiClick} />
                </Box>
              )}
            </Box>
            <IconButton aria-label="Add attachment" variant="ghost">
              <Img src={clip} h={6} w={6} />
            </IconButton>
            <IconButton
              aria-label="Mention"
              variant="ghost"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleMentionButton}
            >
              <Img src={atherate} h={6} w={6} />
            </IconButton>

            {/* <Button variant="outline" size="md">
              Aa
            </Button> */}
            <Button
              variant="outline"
              size="md"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleTextCase}
            >
              Aa
            </Button>

            <Spacer />

            <Button
              bg="#1F3661"
              color="white"
              borderRadius="8px"
              px={6}
              rightIcon={<FiArrowRight />}
              onClick={handlePost}
              _hover={{ bg: "#162843" }}
            >
              Post
            </Button>
          </Flex>
        </Box>
      </Box>

      {/* ---------------- EMPLOYEE SELECTION MODAL ---------------- */}
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
                  // const empId = emp.employee_code;
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
                      <Flex gap="1" align="center" justify="center">
                        <Text>{fullName}</Text>
                        <Text as="span" color="gray.500" fontSize="sm">
                          ({emp.employee_code || "N/A"})
                        </Text>
                      </Flex>
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
              onClick={handleApplySelection}
              _hover={{ bg: "#162843" }}
            >
              Apply
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
