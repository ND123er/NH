import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Text,
  VStack,
  Spinner,
  useToast,
  useColorModeValue,
} from "@chakra-ui/react";
import api from "../../api/axios";
import { getOrgCode, decodeTokenPayload } from "../../utils/token";

const PendingApprovals = () => {
  const toast = useToast();
  const navBg = useColorModeValue("white", "#000");
  const borderClr = useColorModeValue("#cccccc", "gray.700");
  const textClr = useColorModeValue("black", "white");
  const subTextClr = useColorModeValue("#757575", "gray.400");
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  /* ================= FETCH PENDING TEAM LEAVES ================= */
  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      const organisation_id = getOrgCode();
      if (!organisation_id) return;

      const res = await api.get(
        `/leave/get_team_leave_list?organisation_id=${organisation_id}`,
      );

      if (Array.isArray(res?.data?.data)) {
        const pendingOnly = res.data.data.filter(
          (item) => item.status === "PENDING",
        );
        setApprovals(pendingOnly);
      }
    } catch (err) {
      console.error("Failed to fetch pending approvals", err);
      toast({
        title: "Failed to load pending approvals",
        status: "error",
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  /* ================= APPROVE ================= */
  const handleApprove = async (leaveId) => {
    try {
      setActionLoadingId(leaveId);

      const tokenPayload = decodeTokenPayload();
      const approverId = tokenPayload?.employee_id;

      if (!approverId) {
        throw new Error("Approver ID not found");
      }

      await api.put(`/leave/approve_leave/${leaveId}`, {
        approver_id: approverId,
      });

      toast({
        title: "Leave approved",
        status: "success",
        duration: 2000,
        isClosable: true,
      });

      fetchPendingApprovals();
    } catch (err) {
      console.error(err);
      toast({
        title: "Failed to approve leave",
        description:
          err?.response?.data?.message ||
          err?.message ||
          "Something went wrong",
        status: "error",
        isClosable: true,
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  /* ================= REJECT ================= */
  const handleReject = async (leaveId) => {
    try {
      setActionLoadingId(leaveId);

      const tokenPayload = decodeTokenPayload();
      const approverId = tokenPayload?.employee_id;

      if (!approverId) {
        throw new Error("Approver ID not found");
      }

      await api.put(`/leave/reject_leave/${leaveId}`, {
        approver_id: approverId,
      });

      toast({
        title: "Leave rejected",
        status: "success",
        duration: 2000,
        isClosable: true,
      });

      fetchPendingApprovals();
    } catch (err) {
      console.error(err);
      toast({
        title: "Failed to reject leave",
        description:
          err?.response?.data?.message ||
          err?.message ||
          "Something went wrong",
        status: "error",
        isClosable: true,
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <Box
      borderRadius="2xl"
      // bg="white"
      bg={navBg}
      boxShadow="lg"
      fontFamily="Poppins"
      border="1px solid #cccccc"
    >
      <Heading
        size="md"
        color={textClr}
        fontWeight={600}
        letterSpacing="-3%"
        fontFamily="'Poppins', sans-serif"
        pt={6}
        pb={4}
        pl={4}
      >
        Pending Leave Approvals
      </Heading>

      {/* Divider */}
      <Box
        w="100%"
        h="1px"
        bgImage="repeating-linear-gradient(
    to right,
    #C7C7C7 0 6px,
    transparent 6px 14px
  )"
        mb={4}
      />

      {/* Loading state */}
      {loading && (
        <VStack py={6}>
          <Spinner />
          <Text fontSize="sm">Loading pending approvals...</Text>
        </VStack>
      )}

      {/* Empty state */}
      {!loading && approvals.length === 0 && (
        <VStack py={6}>
          <Text fontSize="sm" color="gray.500" fontFamily={"poppins"}>
            No pending approvals
          </Text>
        </VStack>
      )}

      {/* List */}
      <VStack spacing={3} align="stretch" maxH="280px" overflowY="auto">
        {approvals.map((item) => (
          <Flex
            key={item._id}
            align="center"
            justify="space-between"
            borderRadius="xl"
            borderWidth="1px"
            borderColor="gray.200"
            bg={navBg}
            p={4}
            ml={2}
            mr={2}
            mb={2}
          >
            <HStack spacing={3}>
              <Avatar name={item.employee_name} borderRadius="8px" />
              <Box>
                <Text
                  fontFamily="Poppins"
                  fontWeight="600"
                  fontSize="18px"
                  lineHeight="100%"
                  letterSpacing="-0.03em"
                >
                  {item.employee_name}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  Leave request : {item.total_days} day
                  {item.total_days > 1 ? "s" : ""}
                </Text>
              </Box>
            </HStack>

            <HStack spacing={2}>
              <Button
                size="sm"
                borderRadius="lg"
                p={5}
                border="1px solid #EE5D5080"
                bg="#EE5D5033"
                color="#4B4A4A"
                _hover={{ bg: "red.50" }}
                isLoading={actionLoadingId === item._id}
                onClick={() => handleReject(item._id)}
              >
                Reject
              </Button>

              <Button
                size="sm"
                borderRadius="lg"
                p={5}
                border="1px solid #06BF5C"
                bg="#d5edd8"
                color="#4B4A4A"
                _hover={{ bg: "#87D78E4D" }}
                isLoading={actionLoadingId === item._id}
                onClick={() => handleApprove(item._id)}
              >
                Approve
              </Button>
            </HStack>
          </Flex>
        ))}
      </VStack>
    </Box>
  );
};

export default PendingApprovals;
