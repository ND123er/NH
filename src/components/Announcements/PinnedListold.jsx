import React, { useMemo, useState } from "react";
import {
  Box,
  Flex,
  Text,
  Avatar,
  Divider,
  Button,
  Img,
} from "@chakra-ui/react";
import { FiChevronRight } from "react-icons/fi";
import { HiBadgeCheck } from "react-icons/hi";
import pinned from "../../assets/pinned.svg";

const getExcerpt = (text = "", maxLength = 95) => {
  const cleanText = String(text).replace(/\s+/g, " ").trim();
  if (!cleanText) return "";
  if (cleanText.length <= maxLength) return cleanText;
  return `${cleanText.slice(0, maxLength).trim()}...`;
};

export default function PinnedList({ posts = [] }) {
  // console.log("PinnedList posts:", posts);
  const [expandedPost, setExpandedPost] = useState(null);
  const pinnedPosts = useMemo(
    () => posts.filter((post) => Boolean(post?.is_pinned)),
    [posts],
  );

  const handleToggle = (id) => {
    setExpandedPost(expandedPost === id ? null : id);
  };

  // console.log("PinnedList pinnedPosts:-----------------", pinnedPosts);
  return (
    <Box bg="white" border="1px solid #CCCCCC" borderRadius="12px" p={4}>
      <Flex justify={"center"} pb={4}>
        <Text
          fontFamily="'Poppins', sans-serif"
          fontWeight="700"
          fontSize={{ base: "18px", md: "22px" }}
          lineHeight="1"
          color="#404040"
        >
          Pinned Announcements
        </Text>
      </Flex>

      {/* Divider */}
      <Box
        mx={-4}
        mb={4}
        pr={4}
        pl={4}
        borderBottom="2px dashed transparent"
        sx={{
          borderImage:
            "repeating-linear-gradient(to right, #C7C7C7 0 4px, transparent 3px 9px) 1",
        }}
      ></Box>
      <Flex direction="column" gap={0} mt={2}>
        {pinnedPosts.length === 0 && (
          <Text
            color="gray.500"
            fontSize="sm"
            py={2}
            fontFamily="'Poppins', sans-serif"
          >
            No pinned announcements.
          </Text>
        )}
        {pinnedPosts?.map((post, idx) => {
          const author = post?.created_by_name || "Unknown User";
          const title = post?.title || "Announcement";
          const excerpt = getExcerpt(post?.description || "");
          const fullText = post?.description || "";
          const shortText = getExcerpt(fullText);
          const isExpanded =
            expandedPost === (post?.announcement_id || idx);
          return (
            <Box key={post?.announcement_id || idx} py={5}>
              <Flex align="center" justify="space-between">
                <Flex align="center" gap={3}>
                  <Avatar name={author} size="md" src={post?.avatarUrl || ""} />
                  <Flex align="center" gap={2}>
                    <Text
                      fontFamily="'Poppins', sans-serif"
                      fontSize={{ base: "14px", md: "16px" }}
                      fontWeight="600"
                      color="#0D0D0D"
                    >
                      {author}
                    </Text>
                    <HiBadgeCheck size={18} color="#393939" />
                  </Flex>
                </Flex>

                <Flex
                  align="center"
                  gap={2}
                  bg="#F0F0F0"
                  borderRadius="999px"
                  px={4}
                  py={2}
                >
                  <Img src={pinned} alt="pinned" boxSize={5} />
                  <Text
                    fontFamily="'Poppins', sans-serif"
                    fontSize={{ base: "10px", md: "12px" }}
                    fontWeight="600"
                    color="#111111"
                    textTransform="lowercase"
                  >
                    pinned
                  </Text>
                </Flex>
              </Flex>

              <Box mt={5}>
                {!!fullText && (
                  <Box
                    transition="all 0.3s ease"
                    overflow="hidden"
                  >
                    <Text
                      mt={4}
                      fontFamily="'Poppins', sans-serif"
                      fontSize={{ base: "14px", md: "16px" }}
                      lineHeight="1.45"
                      color="#1B1B1B"
                    >
                      {isExpanded ? fullText : shortText}
                    </Text>
                  </Box>
                )}
              </Box>

              <Button
                variant="link"
                mt={4}
                px={0}
                minW="fit-content"
                onClick={() =>
                  handleToggle(post?.announcement_id || idx)
                }
                rightIcon={
                  <Flex
                    bg="#244271"
                    color="white"
                    borderRadius="full"
                    boxSize={5}
                    align="center"
                    justify="center"
                  >
                    <FiChevronRight
                      size={12}
                      style={{
                        transform: isExpanded
                          ? "rotate(90deg)"
                          : "rotate(0deg)",
                        transition: "0.3s",
                      }}
                    />
                  </Flex>
                }
                fontFamily="'Poppins', sans-serif"
                fontSize={{ base: "10px", md: "12px" }}
                fontWeight="600"
                color="#0E0E0E"
              >
                {isExpanded ? "See Less" : "See Announcement"}
              </Button>

              {idx < pinnedPosts.length - 1 && (
                <Divider mt={5} borderColor="#CFCFCF" />
              )}
            </Box>
          );
        })}
      </Flex>
    </Box>
  );
}