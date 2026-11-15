import React, { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Divider,
  VStack,
  useToast,
  Tag,
} from "@chakra-ui/react";
import { BsThreeDots, BsThreeDotsVertical } from "react-icons/bs";
import { LuEye } from "react-icons/lu";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { RiDeleteBin6Line } from "react-icons/ri";
import api from "../../api/axios";
import { getOrgCode, decodeTokenPayload } from "../../utils/token";

const statusColorMap = {
  APPROVED: "green",
  PENDING: "yellow",
  REJECTED: "red",
};

export default function LeaveRolloverTable({
  status,
  search,
  fromDate,
  toDate,
  leaveTypeIds = [],
}) {
  const toast = useToast();
  const decoded = decodeTokenPayload();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  /* ================= FETCH DATA ================= */
  const fetchRolloverRequests = async () => {
    try {
      setLoading(true);
      const orgId = getOrgCode();
      if (!orgId) return;

      const params = new URLSearchParams();
      params.append("organisation_id", orgId);
      params.append("page", 1);
      params.append("limit", 10);

      if (status) params.append("status", status);
      if (search && search.length >= 3) params.append("search", search);
      if (fromDate) params.append("from_date", fromDate);
      if (toDate) params.append("to_date", toDate);

      if (Array.isArray(leaveTypeIds) && leaveTypeIds.length > 0) {
        params.append("leave_type_id", leaveTypeIds.join(","));
      }

      const res = await api.get(
        `/leave/get_leave_rollover_requests?${params.toString()}`,
      );

      if (Array.isArray(res?.data?.data)) {
        setRows(res.data.data);
      } else {
        setRows([]);
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Failed to fetch rollover requests",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (search && search.length > 0 && search.length < 3) return;

    fetchRolloverRequests();
  }, [status, search, fromDate, toDate, leaveTypeIds]);

  /* ================= APPROVE ================= */
  const handleApprove = async (row) => {
    try {
      setActionLoadingId(row._id);

      await api.put(`/leave/approve_leave_rollover/${row._id}`, {
        approver_id: decoded?.employee_id,
        // approved_days: row.carry_forward_days,
      });

      toast({
        title: "Rollover approved",
        status: "success",
        duration: 2500,
      });

      fetchRolloverRequests();
    } catch (err) {
      console.error(err);
      toast({
        title: "Failed to approve request",
        status: "error",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  /* ================= REJECT ================= */
  const handleReject = async (row) => {
    try {
      setActionLoadingId(row._id);

      await api.put(`/leave/reject_leave_rollover/${row._id}`, {
        approver_id: decoded?.employee_id,
        rejection_reason: "Rejected by admin",
      });

      toast({
        title: "Rollover rejected",
        status: "success",
        duration: 2500,
      });

      fetchRolloverRequests();
    } catch (err) {
      console.error(err);
      toast({
        title: "Failed to reject request",
        status: "error",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const formatStatus = (status = "") => {
    if (!status) return "-";
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  return (
    <Box
      bg="white"
      borderRadius="12px"
      maxW="100%"
      overflowX="auto"
      fontFamily="Poppins"
      pb={4}
      pt={4}
    >
      <Table
        size="sm"
        minW="900px"
        sx={{
          "& tbody tr:nth-of-type(odd) td": { background: "#f0f2f5" },
          "& tbody tr:nth-of-type(even) td": { background: "white" },
          "& td, & th": { border: "none !important" },
          "& thead th": { paddingBottom: "14px" },
          "& tbody tr:first-of-type td": { paddingTop: "12px" },
        }}
      >
        <Thead
          sx={{
            th: {
              fontSize: "14px",
              textTransform: "none",
              fontWeight: "600",
              fontFamily: "Poppins",
              color: "#000",
            },
          }}
        >
          <Tr>
            <Th>Employee ID</Th>
            <Th>Full name</Th>
            <Th>Leave Type</Th>
            <Th>Current Balance</Th>
            <Th>Requested Days</Th>
            <Th>Date Submitted</Th>
            <Th>Status</Th>
            <Th>Action</Th>
          </Tr>
        </Thead>

        <Tbody>
          {rows.map((r) => {
            const isPending = r.status === "PENDING";

            return (
              <Tr key={r._id}>
                <Td>{r.employee_id || "-"}</Td>
                <Td>{r.employee_name || "-"}</Td>
                <Td>{r.leave_type}</Td>
                <Td>{r.current_balance ?? 0}</Td>

                {/* Requested Days: CF + Encashment */}
                <Td>
                  <Text fontSize="13px">
                    {r.requested_days.carry_forward ?? 0}{" "}
                    <Text as="span" color="gray.500">
                      (CF)
                    </Text>{" "}
                    | {r.requested_days.encashment ?? 0}{" "}
                    <Text as="span" color="gray.500">
                      (Encash)
                    </Text>
                  </Text>
                </Td>

                <Td>
                  {/* {new Date(r.requested_at).toLocaleDateString("en-GB")} */}
                  {new Date(r.requested_at)
                    .toLocaleDateString("en-GB")
                    .replace(/\//g, "-")}
                </Td>

                <Td>
                  <Tag
                    size="md"
                    variant="unstyled"
                    fontWeight={400}
                    paddingLeft={0}
                    paddingRight={0}
                    color={
                      (r.status || "").toLowerCase() === "approved"
                        ? "#74D27E"
                        : (r.status || "").toLowerCase() === "pending"
                          ? "orange.500"
                          : (r.status || "").toLowerCase() === "rejected"
                            ? "#C93A3A"
                            : "gray.600"
                    }
                  >
                    {formatStatus(r.status || "-")}
                  </Tag>
                </Td>

                <Td>
                  <Menu placement="bottom-end">
                    <MenuButton
                      as={IconButton}
                      icon={<BsThreeDots size={18} color="#000000" />}
                      // size="sm"
                      variant="ghost"
                      isDisabled={!isPending}
                      color="black"
                    />

                    <MenuList borderRadius="12px" p={2} minW="180px">
                      <MenuItem isDisabled>
                        <Flex align="center" gap={3}>
                          <LuEye size={18} />
                          <Text fontWeight="500">View</Text>
                        </Flex>
                      </MenuItem>

                      <Divider my={1} />

                      <MenuItem
                        isDisabled={!isPending}
                        onClick={() => handleApprove(r)}
                        isLoading={actionLoadingId === r._id}
                      >
                        <Flex gap={3}>
                          <AiOutlineCheckCircle size={18} color="#38A169" />
                          <Text fontWeight="500">Approve</Text>
                        </Flex>
                      </MenuItem>

                      <Divider my={1} />

                      <MenuItem
                        isDisabled={!isPending}
                        onClick={() => handleReject(r)}
                        isLoading={actionLoadingId === r._id}
                      >
                        <Flex align="center" gap={3}>
                          <RiDeleteBin6Line size={18} color="#E53E3E" />
                          <Text fontWeight="500" color="red.500">
                            Reject
                          </Text>
                        </Flex>
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>

      {loading && (
        <VStack py={8}>
          <Text>Loading rollover requests...</Text>
        </VStack>
      )}

      {!loading && rows.length === 0 && (
        <VStack py={8}>
          <Text>No rollover requests found</Text>
        </VStack>
      )}
    </Box>
  );
}
