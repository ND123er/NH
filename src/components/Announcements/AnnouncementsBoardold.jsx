import React, { useCallback, useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { Box, Flex, Spinner, Text } from "@chakra-ui/react";
import Composer from "./Composer";
import PostCard from "./PostCard";
import PinnedList from "./PinnedList";
import api from "../../api/axios";

export default function AnnouncementsBoard() {
  const { user } = useSelector((state) => state.auth);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  //announcement new
  const [searchParams] = useSearchParams();
  const announcementId = searchParams.get("announcementId");
  const postRefs = useRef({});
  //
  const organisationId = user?.organisation_id || user?.org_id;
  const employeeId = user?.employee_id;
  const isAdmin = Boolean(user?.is_admin);

  const fetchAnnouncements = useCallback(async () => {
    if (!organisationId) return;
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("organisation_id", organisationId);

      if (isAdmin) {
        params.append("is_admin", "true");
      } else if (employeeId) {
        params.append("employee_id", employeeId);
      }

      const res = await api.get(
        `/announcement/get_all_announcements?${params.toString()}`,
      );
      const list = res?.data?.data;
      setPosts(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Failed to fetch announcements:", error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [organisationId, employeeId, isAdmin]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);
  useEffect(() => {
    if (!announcementId || !posts.length) return;

    const target = postRefs.current[announcementId];

    if (!target) return;

    setTimeout(() => {
      target.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      target.style.transition = "background-color 0.3s ease";
      target.style.backgroundColor = "#FFF3CD";

      setTimeout(() => {
        target.style.backgroundColor = "";
      }, 2500);
    }, 300);
  }, [announcementId, posts]);

  return (
    <Flex gap={3} py={4} w="100%" direction={{ base: "column", xl: "row" }}>
      <Box flex="1" display="flex" flexDirection="column" gap={4}>
        {isAdmin && <Composer onPosted={fetchAnnouncements} />}

        {loading ? (
          <Flex justify="center" py={8}>
            <Spinner />
          </Flex>
        ) : posts.length === 0 ? (
          <Box
            bg="white"
            border="1px solid #E2E8F0"
            borderRadius="16px"
            p={6}
            textAlign="center"
          >
            <Text color="gray.500">No announcements found</Text>
          </Box>
        ) : (
          //old
          // posts.map((post) => (
          //   <PostCard
          //     key={post.announcement_id || post.id}
          //     post={post}
          //     onPinnedChange={fetchAnnouncements}
          //   />
          // ))
          posts.map((post) => (
            <Box
              key={post.announcement_id || post.id}
              ref={(el) => {
                postRefs.current[post.announcement_id] = el;
              }}
              borderRadius="12px"
            >
              <PostCard post={post} onPinnedChange={fetchAnnouncements} />
            </Box>
          ))
        )}
      </Box>

      {isAdmin && (
        <Box
          w={{ base: "100%", xl: "360px" }}
          display="flex"
          flexDirection="column"
          gap={3}
        >
          <PinnedList posts={posts} />
        </Box>
      )}
    </Flex>
  );
}

// import React from "react";
// import { Box, Flex, Heading, Text, Icon } from "@chakra-ui/react";
// import { TimeIcon } from "@chakra-ui/icons";

// const AnnouncementsBoard = () => {
//     return (
//            <Flex
//                minH="70vh"
//                align="center"
//                justify="center"
//                // bg="gray.50"
//                px={2}
//            >
//                <Box
//                    textAlign="center"
//                    // bg="white"
//                    // p={10}
//                    // borderRadius="lg"
//                    // boxShadow="lg"
//                    // maxW="700px"
//                    // height='250px'
//                    w="100%"
//                >
//                    <Icon
//                        as={TimeIcon}
//                        w={12}
//                        h={12}
//                        color="#233A63"
//                        mb={4}
//                    />

//                    <Heading size="lg" mb={2}>
//                        Coming Soon
//                    </Heading>

//                    <Text fontSize="md" color="gray.600">
//                        Welcome! This section will be available soon.
//                        We’re working to bring you new features.
//                    </Text>
//                </Box>
//            </Flex>
//        );
// };

// export default AnnouncementsBoard;
