import React, { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Text,
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tag,
  Button,
  InputGroup,
  InputLeftElement,
  Input,
  Menu,
  MenuButton,
  Icon,
  MenuList,
  VStack,
  Spinner,
  useToast,
  Stack,
  Image,
  HStack,
} from "@chakra-ui/react";
import { ArrowBackIcon, SearchIcon } from "@chakra-ui/icons";
import { BsThreeDots } from "react-icons/bs";
import api from "../../api/axios";
import { getOrgCode, decodeTokenPayload } from "../../utils/token";
import FilterDropdownLeave from "./Filters/FilterDropdownLeave";
import { IoMdCalendar } from "react-icons/io";
import calendar_filter from "../../assets/calendar_filter.svg";

/* ================== STATUS COLOR ================== */
const statusColor = (status = "") => {
  const s = status.toLowerCase();
  if (s.includes("approved")) return "green";
  if (s.includes("pending")) return "orange";
  if (s.includes("rejected")) return "red";
  return "gray";
};

/* ================== DATE FORMAT ================== */
const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-GB");
};

export default function LeaveHistory({ onBack }) {
  const toast = useToast();
  const decoded = decodeTokenPayload();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  // const [fromDate, setFromDate] = useState(() =>
  //   new Date().toISOString().slice(0, 10)
  // );
  // const [toDate, setToDate] = useState(() =>
  //   new Date().toISOString().slice(0, 10)
  // );

  // applied filters
  const [appliedFilters, setAppliedFilters] = useState({});
  const [selectedStatuses, setSelectedStatuses] = useState([]);

  /* ================== FETCH API ================== */
  const fetchLeaveHistory = async (opts = {}) => {
    try {
      setLoading(true);

      const organisation_id = getOrgCode();
      const employee_id = decoded?.employee_id;

      if (!organisation_id || !employee_id) {
        setRows([]);
        return;
      }

      const params = new URLSearchParams();
      params.append("organisation_id", organisation_id);
      params.append("employee_id", employee_id);

      // prefer incoming opts, then appliedFilters, then component inputs
      const statusOpt =
        opts.status ??
        appliedFilters.status ??
        (selectedStatuses.length ? selectedStatuses.join(",") : undefined);
      const fromOpt = opts.from_date ?? appliedFilters.start_date ?? fromDate;
      const toOpt = opts.to_date ?? appliedFilters.end_date ?? toDate;
      const pageOpt = opts.page ?? appliedFilters.page;
      const limitOpt = opts.limit ?? appliedFilters.limit;

      if (statusOpt) params.append("status", statusOpt);
      // append dates only if explicitly set (to avoid accidentally overriding backend defaults)
      if (appliedFilters.start_date || opts.from_date)
        params.append("from_date", fromOpt);
      if (appliedFilters.end_date || opts.to_date)
        params.append("to_date", toOpt);
      if (pageOpt) params.append("page", pageOpt);
      if (limitOpt) params.append("limit", limitOpt);

      const url = `/leave/get_my_leave_history?${params.toString()}`;
      const res = await api.get(url);

      if (Array.isArray(res?.data?.data)) {
        setRows(res.data.data);
      } else {
        setRows([]);
      }
    } catch (err) {
      console.error("Failed to fetch leave history", err);
      toast({
        title: "Failed to fetch leave history",
        status: "error",
      });
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   fetchLeaveHistory();
  // }, []);

  // refetch when appliedFilters change
  useEffect(() => {
    fetchLeaveHistory();
  }, [appliedFilters]);

  /* ================== CLIENT FILTER (OPTIONAL) ================== */
  const filteredRows = rows.filter((r) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      r.leave_type?.toLowerCase().includes(q) ||
      r.reason?.toLowerCase().includes(q) ||
      r.status?.toLowerCase().includes(q)
    );
  });

  // Apply date range from calendar filter
  const applyDateRange = () => {
    const newFilters = {
      ...appliedFilters,
      start_date: fromDate,
      end_date: toDate,
    };
    setAppliedFilters(newFilters);
    fetchLeaveHistory({
      status: newFilters.status,
      from_date: newFilters.start_date,
      to_date: newFilters.end_date,
    });
  };

  // Clear date range filter and reset inputs to today
  const clearDateRange = () => {
    const copy = { ...appliedFilters };
    delete copy.start_date;
    delete copy.end_date;
    setAppliedFilters(copy);

    const today = new Date().toISOString().slice(0, 10);
    setFromDate('');
    setToDate('');
    // setFromDate(today);
    // setToDate(today);

    // fetch without date filters but keep status filter
    fetchLeaveHistory({ status: copy.status });
  };

  return (
    <Box
      bg="white"
      borderRadius="12px"
      border="1px solid #cccccc"
      fontFamily="Poppins"
      h={{ base: "75vh", md: "74.2vh" }}

    >
      {/* ================= HEADER ================= */}
      <Flex
        align="center"
        justify="space-between"
        gap={3}
        mb={4}
        pl={4}
        pt={4}
        pr={4}
      >
        <Flex align="center" gap={3}>
          <IconButton
            aria-label="Go back"
            icon={<ArrowBackIcon boxSize={5} />}
            onClick={onBack}
            bg="#1A365D"
            color="white"
            borderRadius="full"
            w="44px"
            h="44px"
            _hover={{ bg: "#274167" }}
            _active={{ bg: "#1A365D" }}
            _focus={{ boxShadow: "none" }}
          />
          <Text fontSize="lg" fontWeight={700}>
            Leave History
          </Text>
        </Flex>

        <Flex align="center" gap={2} wrap="wrap">
          {/* calendar */}
          <Menu>
            <MenuButton
              as={Button}
              w="35px"
              h="35px"
              minW="35px"
              p={0}
              bg="white"
              borderRadius="8px"
              border="1.5px solid #cccccc"
              _hover={{
                bg: "white",
                borderColor: "#bdbdbd",
              }}
              _active={{
                bg: "white",
                borderColor: "#1A365D",
              }}
              _focusVisible={{
                boxShadow: "0 0 0 1px #1A365D",
              }}
            >
              <Flex w="100%" h="100%" align="center" justify="center">
                <Image
                  src={calendar_filter}
                  alt="calendar"
                  boxSize="18px"
                  objectFit="contain"
                />
              </Flex>
            </MenuButton>

            <MenuList minW="260px" p={3}>
              <Stack spacing={3}>
                <Box>
                  <Text fontSize="xs" color="gray.600" mb={1}>
                    From
                  </Text>
                  <InputGroup size="sm">
                    <InputLeftElement pointerEvents="none">
                      <Image src={calendar_filter} opacity={0.8} />
                    </InputLeftElement>
                    <Input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                    />
                  </InputGroup>
                </Box>

                <Box>
                  <Text fontSize="xs" color="gray.600" mb={1}>
                    To
                  </Text>
                  <InputGroup size="sm">
                    <InputLeftElement pointerEvents="none">
                      <Image src={calendar_filter} opacity={0.8} />
                    </InputLeftElement>
                    <Input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                    />
                  </InputGroup>
                </Box>

                <Flex justify="flex-end" gap={2}>
                  <Button size="sm" variant="ghost" onClick={clearDateRange}>
                    Clear
                  </Button>
                  <Button
                    size="sm"
                    bg="#1A365D"
                    color="white"
                    onClick={applyDateRange}
                  >
                    Apply
                  </Button>
                </Flex>
              </Stack>
            </MenuList>
          </Menu>

          {/* Filter */}
          {/* <FilterDropdownLeave /> */}

          {/* Menu */}
          <Box overflow="hidden">
            <Menu>
              <MenuButton
                as={Button}
                size="sm"
                bg="white"
                borderRadius="8px"
                border="1px solid #cccccc"
                px={3}
                py={2}
              >
                <Flex align="center" justify="center">
                  <Icon as={BsThreeDots} boxSize={4} color="gray.600" />
                </Flex>
              </MenuButton>
              {/* <MenuList minW="220px" borderRadius="8px" boxShadow="lg" py={0} /> */}
            </Menu>
          </Box>
        </Flex>
      </Flex>

      {/* ================= DIVIDER ================= */}
      <Box
        h="2px"
        w="100%"
        // bgImage="repeating-linear-gradient(to right,#C7C7C7 0,#C7C7C7 4px,transparent 3px,transparent 8px)"
        bgImage="repeating-linear-gradient(
    to right,
    #C7C7C7 0 6px,
    transparent 6px 14px
  )"
        mb={4}
      />

      {/* ================= STATUS LEGEND ================= */}
      <Flex gap={3} mb={4} pl={4} align="center">
        <Text fontWeight={600} minW="120px">
          Current Status
        </Text>

        <HStack spacing={2} wrap="wrap">
          {[
            { label: "Approved", key: "APPROVED", color: "green" },
            { label: "Pending", key: "PENDING", color: "orange" },
            { label: "Rejected", key: "REJECTED", color: "red" },
          ].map((s) => {
            const active = selectedStatuses.includes(s.key);
            const anySelected = selectedStatuses.length > 0;
            const faded = anySelected && !active;

            return (
              <Button
                key={s.key}
                size="sm"
                onClick={() => {
                  setSelectedStatuses((prev) => {
                    const next = prev[0] === s.key ? [] : [s.key];

                    const newFilters = {
                      ...appliedFilters,
                      status: next.length ? next.join(",") : undefined,
                    };

                    setAppliedFilters(newFilters);
                    fetchLeaveHistory({
                      status: newFilters.status,
                      from_date: newFilters.start_date,
                      to_date: newFilters.end_date,
                    });

                    return next;
                  });
                }}
                position="relative"
                borderRadius="full"
                px={6}
                py={1.5}
                h="36px"
                _focus={{ boxShadow: "none" }}
                borderWidth="1px"
                borderColor={
                  active ? `${s.color}.300` : faded ? "gray.200" : "#cccccc"
                }
                bg={active ? `${s.color}.100` : "transparent"}
                color={active ? `${s.color}.600` : "gray.700"}
                opacity={faded ? 0.45 : 1}
                _hover={{
                  bg: active
                    ? `${s.color}.200`
                    : faded
                      ? "transparent"
                      : "gray.50",
                }}
              >
                <Text fontSize="14px" fontWeight={600} letterSpacing="-0.03em">
                  {s.label}
                </Text>

                {active && (
                  <Box
                    position="absolute"
                    top="-7px"
                    right="-7px"
                    w="22px"
                    h="22px"
                    borderRadius="full"
                    bg={`${s.color}.400`}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    border="2px solid white"
                    onClick={(e) => {
                      e.stopPropagation();

                      const newFilters = { ...appliedFilters };
                      delete newFilters.status;

                      setSelectedStatuses([]);
                      setAppliedFilters(newFilters);

                      fetchLeaveHistory({
                        status: undefined,
                        from_date: newFilters.start_date,
                        to_date: newFilters.end_date,
                      });
                    }}
                    cursor="pointer"
                  >
                    <Icon viewBox="0 0 24 24" boxSize="11px" color="gray.900">
                      <path
                        fill="currentColor"
                        d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7A1 1 0 0 0 5.7 7.11L10.59 12l-4.9 4.89a1 1 0 1 0 1.41 1.42L12 13.41l4.89 4.9a1 1 0 0 0 1.42-1.41L13.41 12l4.9-4.89a1 1 0 0 0-.01-1.4Z"
                      />
                    </Icon>
                  </Box>
                )}
              </Button>
            );
          })}
        </HStack>
      </Flex>

      <Box
        h="2px"
        w="100%"
        // bgImage="repeating-linear-gradient(to right,#C7C7C7 0,#C7C7C7 4px,transparent 3px,transparent 8px)"
        bgImage="repeating-linear-gradient(
    to right,
    #C7C7C7 0 6px,
    transparent 6px 14px
  )"
        mb={4}
      />

      {/* ================= TABLE ================= */}
      {loading ? (
        <VStack py={8}>
          <Spinner />
          <Text>Loading leave history...</Text>
        </VStack>
      ) : filteredRows.length === 0 ? (
        <VStack py={8}>
          <Text>No leave history found</Text>
        </VStack>
      ) : (
        <Box
          maxH={{ base: "45vh", md: "48vh" }}
          overflowY="auto"
          overflowX="hidden"
          // px={1}
          sx={{
            "&::-webkit-scrollbar": {
              width: "0px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "#c4c4c4",
              borderRadius: "10px",
            },
            "&::-webkit-scrollbar-track": {
              background: "transparent",
            },
          }}
        >
          <Table
            variant="striped"
            size="sm"
            sx={{
              borderCollapse: "collapse",

              "& th, & td": {
                textAlign: "left",
                // px: 4,
              },

              "& tbody tr:nth-of-type(odd) td": {
                background: "#f0f2f5",
              },

              "& tbody tr:nth-of-type(even) td": {
                background: "white",
              },
            }}

          >
            <Thead>
              <Tr>
                {[
                  "Leave Type",
                  "From",
                  "To",
                  "No. of Days",
                  "Reason",
                  "Status",
                ].map((label) => (
                  <Th
                    key={label}
                    fontFamily="Poppins, sans-serif"
                    fontWeight={600}
                    fontSize="14px"
                    textTransform="none"
                    color="black"
                    pb="12px"

                  >
                    {label}
                  </Th>
                ))}
              </Tr>
            </Thead>

            <Tbody>
              {filteredRows.map((r) => (
                <Tr key={r._id}>
                  <Td>{r.leave_type || "-"}</Td>
                  <Td>{formatDate(r.start_date)}</Td>
                  <Td>{formatDate(r.end_date)}</Td>
                  <Td>{r.total_days ?? "-"}</Td>
                  <Td>{r.reason || "-"}</Td>
                  <Td>
                    <Tag
                      size="md"
                      variant="unstyled"
                      fontWeight={500}
                      color={
                        statusColor(r.status) === "green"
                          ? "green.500"
                          : statusColor(r.status) === "orange"
                            ? "orange.500"
                            : statusColor(r.status) === "red"
                              ? "red.400"
                              : "gray.600"
                      }
                    //  width="40px"
                    >
                      {/* {r.status} */}
                      {r.status?.charAt(0).toUpperCase() + r.status?.slice(1).toLowerCase()}

                    </Tag>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
    </Box>
  );
}
