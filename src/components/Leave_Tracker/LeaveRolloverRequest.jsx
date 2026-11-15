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
  Button,
  InputGroup,
  InputLeftElement,
  Input,
  Menu,
  MenuButton,
  MenuList,
  Icon,
  HStack,
  Tag,
  VStack,
} from "@chakra-ui/react";
import { ArrowBackIcon, ChevronLeftIcon, SearchIcon } from "@chakra-ui/icons";
import { IoIosArrowBack } from "react-icons/io";
import { BsThreeDots } from "react-icons/bs";
import { IoMdCalendar } from "react-icons/io";
import FilterDropdownLeave from "./Filters/FilterDropdownLeave";
import api from "../../api/axios";
import { getOrgCode, decodeTokenPayload } from "../../utils/token";
import { ChevronRightIcon } from "@chakra-ui/icons";

const statusColorMap = {
  APPROVED: "green",
  PENDING: "yellow",
  REJECTED: "red",
};

export default function LeaveRolloverRequest({ onBack }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Date filters and applied filter set
  const [fromDate, setFromDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [toDate, setToDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [appliedFilters, setAppliedFilters] = useState({});
  const [statusFilter, setStatusFilter] = useState("");

  /* ================= FETCH MY ROLLOVER HISTORY ================= */
  const fetchMyHistory = async (opts = {}) => {
    try {
      setLoading(true);
      const organisation_id = getOrgCode();
      const decoded = decodeTokenPayload();
      const employee_id = decoded?.employee_id;

      if (!organisation_id || !employee_id) {
        setRows([]);
        return;
      }

      const params = new URLSearchParams();
      params.append("organisation_id", organisation_id);
      params.append("employee_id", employee_id);

      // prefer explicit opts, then appliedFilters
      const statusOpt =
        opts.status ?? appliedFilters.status ?? (statusFilter ? statusFilter : undefined);
      const fromOpt = opts.from_date ?? appliedFilters.start_date ?? fromDate;
      const toOpt = opts.to_date ?? appliedFilters.end_date ?? toDate;

      if (statusOpt) params.append("status", statusOpt);
      if (appliedFilters.start_date || opts.from_date)
        params.append("from_date", fromOpt);
      if (appliedFilters.end_date || opts.to_date)
        params.append("to_date", toOpt);

      const url = `/leave/get_my_leave_rollover_requests?${params.toString()}`;
      const res = await api.get(url);

      if (Array.isArray(res?.data?.data)) setRows(res.data.data);
      else setRows([]);
    } catch (err) {
      console.error("Failed to fetch rollover history", err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyHistory();
  }, [appliedFilters]);

  return (
    <Box
      bg="white"
      borderRadius="12px"
      border="1px solid #cccccc"
      fontFamily="Poppins"
      overflow="hidden"
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
        {/* LEFT */}
        <Flex align="center" gap={3}>
          <IconButton
            aria-label="Go back"
            icon={<IoIosArrowBack boxSize={5} />}
            onClick={onBack}
            bg="#1A365D"
            color="white"
            borderRadius="full"
            w="44px"
            h="44px"
            _hover={{ bg: "#274167" }}
          />

          <Text fontSize="15px" color="#757575" fontWeight={500}>
            Leave rollover
          </Text>

          <Text fontSize="15px" color="gray.400">
            {`>`}
          </Text>

          <Text fontSize="15px" fontWeight={600}>
            My requests
          </Text>
        </Flex>

        {/* RIGHT */}
        <Flex align="center" gap={2} wrap="wrap">
          {/* Calendar */}
          <Menu>
            <MenuButton
              as={Button}
              size="sm"
              bg="white"
              border="1px solid #cccccc"
              borderRadius="8px"
              height={'38px'}
            >
              <IoMdCalendar size={16} />
            </MenuButton>

            <MenuList minW="260px" p={3}>
              <Box>
                <Text fontSize="xs" color="gray.600" mb={1}>
                  From
                </Text>
                <InputGroup size="sm">
                  <InputLeftElement pointerEvents="none">
                    <IoMdCalendar />
                  </InputLeftElement>
                  <Input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </InputGroup>
              </Box>

              <Box mt={3}>
                <Text fontSize="xs" color="gray.600" mb={1}>
                  To
                </Text>
                <InputGroup size="sm">
                  <InputLeftElement pointerEvents="none">
                    <IoMdCalendar />
                  </InputLeftElement>
                  <Input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </InputGroup>
              </Box>

              <Flex justify="flex-end" gap={2} mt={3}>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    // clear date filters
                    const copy = { ...appliedFilters };
                    delete copy.start_date;
                    delete copy.end_date;
                    setAppliedFilters(copy);
                    setFromDate(new Date().toISOString().slice(0, 10));
                    setToDate(new Date().toISOString().slice(0, 10));
                    fetchMyHistory({ status: copy.status });
                  }}
                >
                  Clear
                </Button>
                <Button
                  size="sm"
                  bg="#1A365D"
                  color="white"
                  onClick={() => {
                    const newFilters = {
                      ...appliedFilters,
                      start_date: fromDate,
                      end_date: toDate,
                    };
                    setAppliedFilters(newFilters);
                    fetchMyHistory({
                      status: newFilters.status,
                      from_date: newFilters.start_date,
                      to_date: newFilters.end_date,
                    });
                  }}
                >
                  Apply
                </Button>
              </Flex>
            </MenuList>
          </Menu>

          {/* Search (UI only) */}

          {/* Filter */}
          <FilterDropdownLeave />

          {/* Menu */}
          <Box border="1px solid #cccccc" borderRadius="8px"
            height={'38px'} display="flex"
            alignItems="center"
            justifyContent="center">
            <Menu>
              <MenuButton
                as={Button}
                size="sm"
                bg="white"
                borderRadius="8px"
                px={3}
                pt={1}
              >
                <Icon as={BsThreeDots} />
              </MenuButton>
              <MenuList minW="200px" borderRadius="8px" />
            </Menu>
          </Box>
        </Flex>
      </Flex>

      {/* ================= DIVIDER ================= */}
      <Box
        w="100%"
        // bgImage="repeating-linear-gradient(to right,#C7C7C7 0,#C7C7C7 4px,transparent 3px,transparent 8px)"
        h="2px"
        bgImage="repeating-linear-gradient(
    to right,
    #C7C7C7 0 6px,
    transparent 6px 14px
  )"
        mb={4}
      />

      {/* ================= STATUS LEGEND ================= */}
      <HStack pl={4} pb={4} align="center">
        <Text fontWeight={600}>Current Status</Text>
        {[
          { label: "Approved", key: "APPROVED", color: "#74D27E", lightc: '#21d433', bg: '#bdf6c1' },
          { label: "Pending", key: "PENDING", color: "#D0860F", lightc: '#d2a65e', bg: '#f6e097' },
          { label: "Rejected", key: "REJECTED", color: "#EE5D50", lightc: '#f19c94', bg: '#fccbc7' },
        ].map((s) => {
          const active = statusFilter === s.key;
          const anySelected = Boolean(statusFilter);
          const faded = anySelected && !active;

          return (
            <Button
              key={s.key}
              size="sm"
              onClick={() => {
                const next = statusFilter === s.key ? "" : s.key;
                setStatusFilter(next);
                const newFilters = {
                  ...appliedFilters,
                  status: next || undefined,
                };
                setAppliedFilters(newFilters);
                fetchMyHistory({
                  status: newFilters.status,
                  from_date: newFilters.start_date,
                  to_date: newFilters.end_date,
                });
              }}
              position="relative"
              borderRadius="full"
              px={6}
              py={1.5}
              h="36px"
              _focus={{ boxShadow: "none" }}
              borderWidth="1px"
              // borderColor={
              //   active ? `${s.color}.300` : faded ? "gray.200" : "#cccccc"
              // }
              // bg={active ? `${s.color}.100` : "transparent"}
              // color={active ? `${s.color}.600` : "gray.700"}
              // opacity={faded ? 0.45 : 1}
              // _hover={{
              //   bg: active ? `${s.color}.200` : faded ? "transparent" : "gray.50",
              // }}
              borderColor={`${s.color}`}
              bg={active ? `${s.bg}` : `${s.bg}`}
              color={active ? `${s.color}` : `${s.lightc}`}
              opacity={faded ? 0.45 : 1}
              _hover={{
                bg: active ? `${s.bg}` : `${s.bg}`,
              }}
            >
              <Text fontSize="14px" fontWeight={500} letterSpacing="-0.03em">
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
                  bg={`${s.color}`}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  // border=`2px solid ${s.color}`
                  border={`2px solid ${s.color}`}
                  cursor="pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setStatusFilter("");
                    const copy = { ...appliedFilters };
                    delete copy.status;
                    setAppliedFilters(copy);
                    fetchMyHistory({ status: copy.status });
                  }}
                >
                  <Icon
                    viewBox="0 0 24 24"
                    boxSize="11px"
                    color="gray.900"
                  >
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

      {/* ================= DIVIDER ================= */}
      <Box
        w="100%"
        // bgImage="repeating-linear-gradient(to right,#C7C7C7 0,#C7C7C7 4px,transparent 3px,transparent 8px)"
        h="2px"
        bgImage="repeating-linear-gradient(
    to right,
    #C7C7C7 0 6px,
    transparent 6px 14px
  )"
        mb={4}
      />

      {/* ================= TABLE ================= */}
      <Table
        size="sm"
        sx={{
          "& tbody tr:nth-of-type(odd) td": { background: "#f0f2f5" },
          "& tbody tr:nth-of-type(even) td": { background: "white" },
        }}
        pt={4}
      >
        <Thead>
          <Tr>
            {[
              "Leave Type",
              "Current Balance",
              "Requested Days",
              "Approved Days",
              "Effective Balance",
              "Date Submitted",
              "Status",
            ].map((label) => (
              <Th
                key={label}
                fontSize="14px"
                fontWeight={600}
                textTransform="none"
                color="black"
                textAlign="left"
                px={4}
                py={4}
              >
                {label}
              </Th>
            ))}
          </Tr>
        </Thead>

        <Tbody>
          {rows.map((r) => (
            <Tr key={r._id}>
              <Td px={4}>{r.leave_type}</Td>
              <Td px={4}>--</Td>
              <Td px={4}>
                {typeof r.requested_days === "object" && r.requested_days !== null
                  ? `${r.requested_days.carry_forward ?? 0}${r.requested_days.encashment
                    ? ` + ${r.requested_days.encashment}`
                    : ""
                  }`
                  : r.requested_days}
              </Td>
              <Td px={4}>{r.approved_days ?? 0}</Td>
              <Td px={4}>--</Td>
              <Td px={4}>
                {new Date(r.requested_at).toLocaleDateString("en-GB")}
              </Td>
              <Td px={4}>
                <Text
                  fontWeight={500}
                  color={
                    r.status === "APPROVED"
                      ? "green.500"
                      : r.status === "PENDING"
                        ? "orange.400"
                        : "red.500"
                  }
                >
                  {r.status.toLowerCase()}
                </Text>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* ================= STATES ================= */}
      {loading && (
        <VStack py={8}>
          <Text>Loading rollover history...</Text>
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
