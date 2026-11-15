import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  Flex,
  IconButton,
  Img,
  Button,
  Avatar,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { FaEye } from "react-icons/fa";
import { FiChevronDown } from "react-icons/fi";
import EmojiPicker from "emoji-picker-react";

import api from "../../api/axios";

import clip from "../../assets/clip.svg";
import smiley from "../../assets/smiley.svg";
import select_image from "../../assets/select_image.svg";
import atherate from "../../assets/atherate.svg";
import announcement_settings from "../../assets/announcement_settings.svg";

export default function AnnouncementEditor({
  value = "",
  onChange,
  organisationId,
  showVisibility = false,
  visibility = "ALL",
  onVisibilityChange,
  selectedEmployees = [],
  onSelectedEmployeesChange,
  onMentionsChange,
  enableMentions = true,
}) {
  const editorRef = useRef(null);
  const savedRangeRef = useRef(null);
  const emojiPickerRef = useRef(null);
  //new
  const isUpdatingFromUserRef = useRef(false);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [mentionQuery, setMentionQuery] = useState("");
  const [showMentionList, setShowMentionList] = useState(false);
  const [mentionEmployees, setMentionEmployees] = useState([]);
  const [mentionLoading, setMentionLoading] = useState(false);

  const [mentionedEmployees, setMentionedEmployees] = useState([]);
  const [mentionAll, setMentionAll] = useState(false);
  useEffect(() => {
    if (typeof onMentionsChange !== "function") return;

    onMentionsChange({
      all: mentionAll,
      employee_ids: mentionedEmployees.map((employee) => employee.employee_id),
    });
  }, [mentionAll, mentionedEmployees, onMentionsChange]);
  /*
   * -------------------------------------------------------
   * SET INITIAL / EDIT CONTENT
   * -------------------------------------------------------
   *
   * IMPORTANT:
   * The parent sends `value`.
   * We only update DOM when the actual text is different.
   * This fixes disappearing text and cursor jumping.
   */
  //   useEffect(() => {
  //     const editor = editorRef.current;

  //     if (!editor) return;

  //     const nextValue = value || "";

  //     if (editor.innerText !== nextValue) {
  //       editor.innerText = nextValue;
  //     }
  //   }, [value]);
  useEffect(() => {
    const editor = editorRef.current;

    if (!editor) return;

    if (isUpdatingFromUserRef.current) {
      isUpdatingFromUserRef.current = false;
      return;
    }

    const nextValue = value || "";

    if (editor.innerText !== nextValue) {
      editor.innerText = nextValue;
    }
  }, [value]);

  /*
   * -------------------------------------------------------
   * CLOSE MENTION LIST WHEN MENTIONS ARE DISABLED
   * -------------------------------------------------------
   */
  useEffect(() => {
    if (!enableMentions) {
      setShowMentionList(false);
      setMentionQuery("");
    }
  }, [enableMentions]);

  /*
   * -------------------------------------------------------
   * EMOJI OUTSIDE CLICK
   * -------------------------------------------------------
   */
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

  /*
   * -------------------------------------------------------
   * EDITOR INPUT
   * -------------------------------------------------------
   */
  const handleEditorInput = (e) => {
    const editor = e.currentTarget;

    const text = editor.innerText || "";

    if (typeof onChange === "function") {
      onChange(text);
    }

    const selection = window.getSelection();

    if (!selection || !selection.rangeCount) {
      setShowMentionList(false);
      return;
    }

    const range = selection.getRangeAt(0);

    if (editor.contains(range.startContainer)) {
      savedRangeRef.current = range.cloneRange();
    }

    // Do not show employee suggestions while editing
    if (!enableMentions) {
      setShowMentionList(false);
      return;
    }

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

  /*
   * -------------------------------------------------------
   * FETCH MENTION EMPLOYEES
   * -------------------------------------------------------
   */
  const fetchMentionEmployees = useCallback(
    async (searchTerm) => {
      if (!organisationId || !enableMentions) return;

      try {
        setMentionLoading(true);

        const encodedOrgId = encodeURIComponent(organisationId);
        const encodedSearch = encodeURIComponent(searchTerm);

        const url =
          `/employee/get_employees_list?` +
          `org_id=${encodedOrgId}` +
          `&search=${encodedSearch}` +
          `&offset=0` +
          `&limit=10`;

        const res = await api.get(url);

        const list = res?.data?.data || [];

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
    [organisationId, enableMentions],
  );

  useEffect(() => {
    if (!enableMentions || !showMentionList) return;

    fetchMentionEmployees(mentionQuery);
  }, [mentionQuery, showMentionList, fetchMentionEmployees, enableMentions]);

  /*
   * -------------------------------------------------------
   * SELECT MENTION
   * -------------------------------------------------------
   */
  const handleMentionSelect = (employee) => {
    if (!enableMentions) return;

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
      setMentionAll(true);
      setMentionedEmployees([]);
    } else {
      setMentionAll(false);

      setMentionedEmployees((prev) => {
        const alreadyMentioned = prev.some(
          (item) => item.employee_id === employee.employee_id,
        );

        if (alreadyMentioned) {
          return prev;
        }

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

      isUpdatingFromUserRef.current = true;
      if (typeof onChange === "function") {
        onChange(editor.innerText);
      }
    });
  };

  /*
   * -------------------------------------------------------
   * Aa - TOGGLE TEXT CASE
   * -------------------------------------------------------
   */
  const handleTextCase = () => {
    const editor = editorRef.current;

    if (!editor) return;

    const selection = window.getSelection();

    if (!selection || !selection.rangeCount) {
      return;
    }

    const range = selection.getRangeAt(0);

    if (!editor.contains(range.commonAncestorContainer)) {
      return;
    }

    if (range.collapsed) return;

    const selectedText = selection.toString();

    if (!selectedText) return;

    const isAllUpperCase = selectedText === selectedText.toUpperCase();

    const newText = isAllUpperCase
      ? selectedText.toLowerCase()
      : selectedText.toUpperCase();

    range.deleteContents();

    const span = document.createElement("span");

    span.style.fontFamily = "inherit";
    span.style.fontSize = "inherit";
    span.style.fontWeight = "inherit";
    span.style.lineHeight = "inherit";
    span.style.color = "inherit";

    span.textContent = newText;

    range.insertNode(span);

    const newRange = document.createRange();

    newRange.setStart(span.firstChild, 0);

    newRange.setEnd(span.firstChild, newText.length);

    selection.removeAllRanges();
    selection.addRange(newRange);

    savedRangeRef.current = newRange.cloneRange();

    if (typeof onChange === "function") {
      onChange(editor.innerText);
    }
  };

  /*
   * -------------------------------------------------------
   * EMOJI
   * -------------------------------------------------------
   */
  const handleEmojiClick = (emojiData) => {
    const editor = editorRef.current;

    if (!editor) return;

    editor.focus();

    const selection = window.getSelection();

    if (savedRangeRef.current) {
      selection.removeAllRanges();
      selection.addRange(savedRangeRef.current);
    }

    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);

    const emojiNode = document.createTextNode(emojiData.emoji);

    range.deleteContents();

    range.insertNode(emojiNode);

    range.setStartAfter(emojiNode);

    range.collapse(true);

    selection.removeAllRanges();
    selection.addRange(range);

    savedRangeRef.current = range.cloneRange();

    if (typeof onChange === "function") {
      onChange(editor.innerText);
    }
  };

  /*
   * -------------------------------------------------------
   * MENTION BUTTON
   * -------------------------------------------------------
   */
  const handleMentionButton = () => {
    if (!enableMentions) return;

    const editor = editorRef.current;

    if (!editor) return;

    editor.focus();

    document.execCommand("insertText", false, "@");
  };

  /*
   * -------------------------------------------------------
   * RENDER
   * -------------------------------------------------------
   */
  return (
    <Box width="100%">
      <Box position="relative">
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
          _empty={{
            "&::before": {
              content: '"Create Announcement"',
              color: "#718096",
            },
          }}
          onInput={handleEditorInput}
        />

        {enableMentions && showMentionList && (
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
              mentionEmployees.map((employee) => (
                <Flex
                  key={employee.employee_id}
                  align="center"
                  gap={3}
                  p={3}
                  cursor="pointer"
                  _hover={{
                    bg: "#F7FAFC",
                  }}
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

      {/* TOOLBAR */}
      <Flex align="center" gap={2} mt={2} wrap="wrap">
        {showVisibility && (
          <Button
            leftIcon={<FaEye />}
            rightIcon={<FiChevronDown />}
            variant="outline"
            size="sm"
            onClick={() => {
              if (typeof onVisibilityChange === "function") {
                onVisibilityChange();
              }
            }}
          >
            {visibility === "ALL" ? "All" : "Selected Employees"}
          </Button>
        )}

        <IconButton aria-label="Announcement settings" variant="ghost">
          <Img src={announcement_settings} h={6} w={6} />
        </IconButton>

        <IconButton aria-label="Add image" variant="ghost">
          <Img src={select_image} h={6} w={6} />
        </IconButton>

        <Box position="relative" ref={emojiPickerRef}>
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

        {enableMentions && (
          <IconButton
            aria-label="Mention"
            variant="ghost"
            onClick={handleMentionButton}
          >
            <Img src={atherate} h={6} w={6} />
          </IconButton>
        )}

        <Button
          variant="outline"
          size="md"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleTextCase}
        >
          Aa
        </Button>
      </Flex>
    </Box>
  );
}
