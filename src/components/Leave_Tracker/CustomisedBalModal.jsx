// CustomisedBalModal.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Text,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Divider,
  Flex,
  IconButton,
  Spinner,
  Textarea,
  FormControl,
  FormLabel,
  useToast,
} from "@chakra-ui/react";
import { AddIcon, MinusIcon } from "@chakra-ui/icons";
import api from "../../api/axios";
import { getOrgCode, decodeTokenPayload } from "../../utils/token";

export default function CustomisedBalModal({ isOpen, onClose, employee }) {
  const toast = useToast();
  const orgId = getOrgCode();
  const decoded = decodeTokenPayload();

  /* ================= STATE ================= */
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rows, setRows] = useState([]);
  const [reason, setReason] = useState("");

  /* ================= FETCH LEAVE SUMMARY ================= */
  useEffect(() => {
    if (!isOpen || !employee?.employee_id || !orgId) return;

    const fetchLeaveSummary = async () => {
      try {
        setLoading(true);

        const res = await api.get(
          `/leave/get_my_leave_summary?employee_id=${employee.employee_id}&organisation_id=${orgId}`,
        );

        const leaves = Array.isArray(res?.data?.leaves) ? res.data.leaves : [];

        setRows(
          leaves.map((l) => ({
            leave_type_id: l.leave_type_id,
            leave_name: l.leave_name,
            available_now: Number(l.available_now ?? 0),
            custom_units: 0,
          })),
        );

        setReason("");
      } catch (err) {
        console.error(err);
        toast({
          title: "Failed to load leave balances",
          status: "error",
        });
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveSummary();
  }, [isOpen, employee, orgId, toast]);

  /* ================= +/- HANDLERS ================= */
  const increment = (id) => {
    setRows((prev) =>
      prev.map((r) =>
        r.leave_type_id === id
          ? { ...r, custom_units: +(r.custom_units + 0.5).toFixed(2) }
          : r,
      ),
    );
  };

  const decrement = (id) => {
    setRows((prev) =>
      prev.map((r) =>
        r.leave_type_id === id
          ? {
              ...r,
              custom_units: Math.max(0, +(r.custom_units - 0.5).toFixed(2)),
            }
          : r,
      ),
    );
  };

  const finalBalance = (r) => +(r.available_now + r.custom_units).toFixed(2);

  /* ================= SAVE ================= */
  const handleSave = async () => {
    const trimmedReason = reason.trim();

    if (!trimmedReason) {
      toast({
        title: "Please provide a reason",
        status: "warning",
      });
      return;
    }

    const updates = rows.filter((r) => r.custom_units > 0);

    if (updates.length === 0) {
      toast({
        title: "No customized units added",
        status: "info",
      });
      return;
    }

    try {
      setSaving(true);

      const today = new Date();
      const dateStr = `${String(today.getDate()).padStart(2, "0")}-${String(
        today.getMonth() + 1,
      ).padStart(2, "0")}-${today.getFullYear()}`;

      // 🔥 One API call per leave type (backend contract)
      for (const r of updates) {
        await api.post("/leave/customize_leave_balance", {
          organisation_id: orgId,
          employee_id: employee.employee_id,
          leave_type_id: r.leave_type_id,
          new_balance: r.custom_units,
          customized_by: decoded?.employee_id,
          date: dateStr,
          reason: trimmedReason,
        });
      }

      toast({
        title: "Leave balance customized successfully",
        status: "success",
        duration: 2500,
      });

      onClose();
    } catch (err) {
      console.error(err);
      toast({
        title: "Failed to customize leave balance",
        description:
          err?.response?.data?.message ||
          err?.message ||
          "Something went wrong",
        status: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  /* ================= RENDER ================= */
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay />
      <ModalContent borderRadius="16px" maxW="900px">
        <ModalHeader>
          <Text fontSize="2xl" fontWeight="700">
            {employee?.full_name || employee?.fullName || ""}
          </Text>
        </ModalHeader>

        {/* <Divider borderStyle="dashed" /> */}
        {/* Header */}
            <Box
              mb={4}
              mt={2}
              borderBottom="2px dashed transparent"
              sx={{
                borderImage:
                  "repeating-linear-gradient(to right, #C7C7C7 0 7px, transparent 5px 15px) 1",
              }}
            ></Box>

        <ModalCloseButton />

        <ModalBody>
          {loading ? (
            <Flex justify="center" py={10}>
              <Spinner />
            </Flex>
          ) : rows.length === 0 ? (
            <Flex justify="center" py={10}>
              <Text>No leave data found</Text>
            </Flex>
          ) : (
            <>
              <Box overflowX="auto" mb={6}>
                <Table size="md">
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
                      <Th>Leave type</Th>
                      <Th>Existing balance</Th>
                      <Th>Total customized units</Th>
                      <Th>Final balance</Th>
                    </Tr>
                  </Thead>

                  <Tbody>
                    {rows.map((r) => (
                      <Tr key={r.leave_type_id}>
                        <Td>{r.leave_name}</Td>
                        <Td>{r.available_now}</Td>
                        <Td>
                          <Flex align="center" gap={2}>
                            <IconButton
                              size="xs"
                              icon={<MinusIcon />}
                              onClick={() => decrement(r.leave_type_id)}
                              isDisabled={r.custom_units <= 0}
                            />
                            <Text minW="40px" textAlign="center">
                              {r.custom_units}
                            </Text>
                            <IconButton
                              size="xs"
                              icon={<AddIcon />}
                              onClick={() => increment(r.leave_type_id)}
                            />
                          </Flex>
                        </Td>
                        <Td fontWeight="600">{finalBalance(r)}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>

              <FormControl isRequired>
                <FormLabel fontWeight="600">Reason</FormLabel>
                <Textarea
                  fontSize={"14px"}
                  placeholder="Enter reason for customizing leave balance"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </FormControl>
            </>
          )}
        </ModalBody>

        <Flex justify="space-between" p={4}>
          <Button
            bg={"white"}
            color={"#757575"}
            onClick={onClose}
            isDisabled={saving}
          >
            Cancel
          </Button>
          <Button
            bg="#274167"
            color="white"
            _hover={{ bg: "#1f3143" }}
            onClick={handleSave}
            isLoading={saving}
          >
            Save
          </Button>
        </Flex>
      </ModalContent>
    </Modal>
  );
}
