import React, { useState } from "react";
import {
  Menu,
  MenuButton,
  MenuList,
  Box,
  Button,
  VStack,
  Text,
  Checkbox,
  HStack,
  Spinner,
  Flex,
  MenuDivider,
  useToast,
  Image,
} from "@chakra-ui/react";
import filter from "../../../assets/filter.svg";
import api from "../../../api/axios";
import { getOrgCode } from "../../../utils/token";

export default function FilterDropdownRollover({
  onApply,
  onClear,
  defaultSelected = {},
}) {
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState([]);

  const [selected, setSelected] = useState({
    leaveTypes: defaultSelected.leaveTypes || [],
  });

  /* ================= FETCH LEAVE TYPES ================= */
  const fetchLeaveTypes = async () => {
    if (leaveTypes.length > 0) return; // fetch once

    try {
      setLoading(true);
      const orgId = getOrgCode();
      if (!orgId) return;

      const res = await api.get(
        `/leave/get_all_leave_policies?organisation_id=${orgId}`
      );

      if (res?.data?.data) {
        const activeLeaves = res.data.data.filter((l) => l.is_active);
        setLeaveTypes(activeLeaves);
      }
    } catch {
      toast({
        title: "Failed to load leave types",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ================= TOGGLE ================= */
  const toggleLeaveType = (id) => {
    setSelected((prev) => {
      const setOf = new Set(prev.leaveTypes);
      setOf.has(id) ? setOf.delete(id) : setOf.add(id);

      const next = { leaveTypes: Array.from(setOf) };
      onApply?.(next); // immediately apply filter
      return next;
    });
  };

  /* ================= CLEAR ================= */
  const clearAll = () => {
    setSelected({ leaveTypes: [] });
    onClear?.();
  };

  const thinScrollbar = {
    scrollbarWidth: "thin",
    scrollbarColor: "#c1c1c1 transparent",
    "&::-webkit-scrollbar": { width: "4px" },
    "&::-webkit-scrollbar-thumb": {
      background: "#c1c1c1",
      borderRadius: "4px",
    },
  };

  return (
    <Menu closeOnSelect={false} onOpen={fetchLeaveTypes}>
      <MenuButton
        as={Button}
        h="38px"
        bg="white"
        fontFamily="Poppins"
        fontSize="14px"
        color="#757575"
        borderWidth="1.5px"
        borderColor="#cccccc"
        borderRadius="8px"
        fontWeight={400}
        leftIcon={<Image src={filter} boxSize="14px" alt="filter" />}
        _hover={{ bg: "white", borderColor: "#bdbdbd" }}
        _active={{ bg: "white", borderColor: "#1A365D" }}
        _focusVisible={{ boxShadow: "0 0 0 1px #1A365D" }}
      >
        Filter
      </MenuButton>

      <MenuList minW="300px" borderRadius="8px" p={3} boxShadow="lg">
        {loading ? (
          <Flex align="center" justify="center" py={6}>
            <Spinner />
          </Flex>
        ) : (
          <>
            <Box maxH="260px" overflowY="auto" pr={2} sx={thinScrollbar}>
              <Text fontSize="sm" fontWeight={700} mb={2}>
                Leave Types
              </Text>

              <VStack align="start" spacing={2}>
                {leaveTypes.length === 0 ? (
                  <Text fontSize="xs" color="gray.500">
                    No leave types found
                  </Text>
                ) : (
                  leaveTypes.map((leave) => (
                    <Checkbox
                      key={leave._id}
                      isChecked={selected.leaveTypes.includes(leave._id)}
                      onChange={() => toggleLeaveType(leave._id)}
                      fontSize="sm"
                      sx={{
                        ".chakra-checkbox__control": {
                          borderColor: "#cccccc",
                        },
                        ".chakra-checkbox__control[data-checked]": {
                          bg: "#274066",
                          borderColor: "#274066",
                          color: "white",
                        },
                      }}
                    >
                      {leave.leave_name}
                    </Checkbox>
                  ))
                )}
              </VStack>
            </Box>

            <MenuDivider />

            <HStack justify="center" mt={2}>
              <Button variant="ghost" size="sm" onClick={clearAll}>
                Clear all
              </Button>
            </HStack>
          </>
        )}
      </MenuList>
    </Menu>
  );
}
