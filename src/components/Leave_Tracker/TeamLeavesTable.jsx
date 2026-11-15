import React, { useState } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Avatar,
  Tag,
  HStack,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Image,
  Stack,
  Input,
  Divider,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Box as ChakraBox,
  Icon,
  MenuDivider,
  useToast,
  FormControl,
  FormLabel,
  InputRightElement,
  CloseButton,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { LuEye } from "react-icons/lu";
import { BiCalendar } from "react-icons/bi";
import FilterDropdownLeave from "./Filters/FilterDropdownLeave";
import SortDropdownLeave from "./Filters/SortDropdownLeave";
import { IoMdCalendar } from "react-icons/io";
import { BsThreeDots } from "react-icons/bs";
import {
  AiOutlineCheckCircle,
  AiOutlineFile,
  AiTwotoneClockCircle,
} from "react-icons/ai";
import { FaFileExcel } from "react-icons/fa";
import { FiUpload } from "react-icons/fi";
import { useEffect } from "react";
import api from "../../api/axios";
import { getOrgCode } from "../../utils/token";
import { decodeTokenPayload } from "../../utils/token";

const statusColor = (s) => {
  const st = (s || "").toLowerCase();
  if (st.includes("approve")) return "green.500";
  if (st.includes("pending")) return "yellow.600";
  if (st.includes("reject")) return "red.500";
  return "gray.500";
};

export default function TeamLeavesTable() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selected, setSelected] = useState(null);
  const [selectedLoading, setSelectedLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [appliedDateFilter, setAppliedDateFilter] = useState(null);
  const searchDebounceRef = React.useRef(null);
  const [sortConfig, setSortConfig] = useState({
    sortBy: "",
    sortOrder: "",
  });
  const toast = useToast();
  const [actionLoading, setActionLoading] = useState(false);
  const placeholders = ["Search by Full Name", "Search by Employee ID"];
  const placeholderexpandsearch = [
    "Search by Full Name (Min 3 char.)",
    "Search by Employee ID  (Min3 char.)",
  ];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [searchExpand, setSearchExpand] = useState(false);
  const searchInputStyle = {
    fontFamily: "Poppins",
    fontSize: "14px",
    _placeholder: {
      color: "gray.400",
      fontFamily: "Poppins",
      fontSize: "14px",
    },
    h: "35px",
    borderWidth: "1.5px",
    borderColor: "#cccccc",
    borderRadius: "8px",
  };

  // approve/reject handler
  const handleAction = async (type) => {
    if (!selected?._id && !selected?.id) return;

    try {
      setActionLoading(true);

      const payloadToken = decodeTokenPayload();
      const approverId = payloadToken?.employee_id;

      if (!approverId) {
        throw new Error("Approver ID not found");
      }

      const leaveId = selected.id; // mapped from API (_id → id)

      const url =
        type === "approve"
          ? `/leave/approve_leave/${leaveId}`
          : `/leave/reject_leave/${leaveId}`;

      await api.put(url, {
        approver_id: approverId,
      });

      toast({
        title:
          type === "approve"
            ? "Leave approved successfully"
            : "Leave rejected successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onClose(); // close modal
      setSelected(null);

      // refresh list
      await fetchTeamLeaves();
    } catch (err) {
      toast({
        title: "Action failed",
        description:
          err?.response?.data?.message ||
          err?.message ||
          "Something went wrong",
        status: "error",
        isClosable: true,
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Fetch team leaves
  const fetchTeamLeaves = async () => {
    try {
      setLoading(true);
      const orgId = getOrgCode();
      if (!orgId) return;

      // Build query params (status and search optional)
      const params = {
        organisation_id: orgId,
      };
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      if (appliedDateFilter?.fromDate)
        params.from_date = appliedDateFilter.fromDate;
      if (appliedDateFilter?.toDate) params.to_date = appliedDateFilter.toDate;
      if (sortConfig?.sortBy && sortConfig?.sortOrder) {
        params.sort_by = sortConfig.sortBy;
        params.sort_order = sortConfig.sortOrder;
      }
      const res = await api.get(`/leave/get_team_leave_list`, { params });

      if (res?.data?.data) {
        // const normalized = res.data.data.map((l) => ({
        //   id: l._id,
        //   fullName: l.employee_name,
        //   employeeId: l.employee_id,
        //   leaveType: l.leave_type,
        //   from: formatIsoToDmy(l.from || l.start_date || l.from_date),
        //   to: formatIsoToDmy(l.to || l.end_date || l.to_date),
        //   days: l.total_days,
        //   status:
        //     l.status === "APPROVED"
        //       ? "Approved"
        //       : l.status === "REJECTED"
        //         ? "Rejected"
        //         : "Pending",
        //   reason: "-",
        //   document: null,
        // }));

        // setRows(normalized);
        const normalized = res.data.data.map((l) => ({
          id: l._id,

          // raw dates for sorting
          rawFrom: l.from || l.start_date || l.from_date,
          rawTo: l.to || l.end_date || l.to_date,

          // formatted dates for UI
          from: formatIsoToDmy(l.from || l.start_date || l.from_date),
          to: formatIsoToDmy(l.to || l.end_date || l.to_date),

          fullName: l.employee_name,
          employeeId: l.employee_code,
          leaveType: l.leave_type,
          days: l.total_days,

          status:
            l.status === "APPROVED"
              ? "Approved"
              : l.status === "REJECTED"
                ? "Rejected"
                : "Pending",

          reason: "-",
          document: null,
        }));

        // frontend sorting fallback
        let sortedRows = [...normalized];

        if (sortConfig?.sortBy === "from") {
          sortedRows.sort((a, b) => {
            return sortConfig.sortOrder === 1
              ? new Date(a.rawFrom) - new Date(b.rawFrom)
              : new Date(b.rawFrom) - new Date(a.rawFrom);
          });
        }

        setRows(sortedRows);
      }
    } catch (err) {
      console.error("Failed to fetch team leave list", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch + refetch when status filter changes + search debounce
  const didInitRef = React.useRef(false);
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // useEffect(() => {
  //   if (!didInitRef.current) {
  //     didInitRef.current = true;
  //     fetchTeamLeaves();
  //     return;
  //   }

  //   const q = search.trim();

  //   const timeout = setTimeout(
  //     () => {
  //       fetchTeamLeaves();
  //     },
  //     q.length >= 3 || q === "" ? 500 : 0
  //   );

  //   return () => clearTimeout(timeout);
  // }, [statusFilter, search]);
  useEffect(() => {
    const q = search.trim();
    // agar 3 se kam characters hain (aur empty bhi nahi)
    if (q.length > 0 && q.length < 3) {
      return; // kuch bhi mat karo
    }

    const timeout = setTimeout(() => {
      fetchTeamLeaves();
    }, 500);

    return () => clearTimeout(timeout);
  }, [search, statusFilter, appliedDateFilter, sortConfig]);

  // Apply date range filter
  const applyDateRange = () => {
    if (!fromDate || !toDate) {
      toast({
        title: "Please select both dates",
        status: "warning",
        duration: 2000,
        isClosable: true,
      });
      return;
    }
    setAppliedDateFilter({ fromDate, toDate });
  };

  // Clear date range filter and reset to today
  const clearDateRange = () => {
    // setFromDate(todayISO);
    // setToDate(todayISO);
    setFromDate("");
    setToDate("");
    setAppliedDateFilter(null);
  };

  // date default display and ISO helpers
  const todayISO = (() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  })();
  // const [fromDate, setFromDate] = useState(todayISO);
  // const [toDate, setToDate] = useState(todayISO);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Format an ISO date into dd/mm/yyyy (e.g. 2025-08-14T00:00:00.000Z -> 14/08/2025)
  const formatIsoToDmy = (iso) => {
    if (!iso) return "-";
    try {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return "-";
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    } catch (e) {
      return "-";
    }
  };

  const openFor = async (row) => {
    try {
      setSelectedLoading(true);
      const leaveId = row?.id || row?._id;
      const orgId = getOrgCode();
      if (!leaveId || !orgId) {
        // fallback
        setSelected(row);
        onOpen();
        return;
      }

      const res = await api.get(`/leave/get_single_team_leave/${leaveId}`, {
        params: { organisation_id: orgId },
      });

      const d = res?.data?.data;
      if (!d) {
        setSelected(row);
        onOpen();
        return;
      }

      const mapped = {
        id: d._id,
        fullName: d.employee?.name || row.fullName,
        employeeId: d.employee?.employee_id || row.employeeId,
        leaveType: d.leave_policy?.leave_name || row.leaveType,
        from: formatIsoToDmy(d.start_date),
        to: formatIsoToDmy(d.end_date),
        days: d.total_days,
        reason: d.reason,
        status:
          d.status === "APPROVED"
            ? "Approved"
            : d.status === "REJECTED"
              ? "Rejected"
              : "Pending",
        document: null,
        appliedAt: d.applied_at,
        approvedAt: d.approved_at,
        approvedBy: d.approved_by,
        raw: d,
      };
      setSelected(mapped);
      onOpen();
    } catch (err) {
      toast({
        title: "Failed to load details",
        description: err?.response?.data?.message || err?.message || "",
        status: "error",
        isClosable: true,
      });
      // fallback
      setSelected(row);
      onOpen();
    } finally {
      setSelectedLoading(false);
    }
  };

  // const filtered = rows.filter((r) => {
  //   if (!search) return true;
  //   const s = search.toLowerCase();
  //   return (
  //     String(r.fullName).toLowerCase().includes(s) ||
  //     String(r.employeeId).toLowerCase().includes(s) ||
  //     String(r.leaveType).toLowerCase().includes(s)
  //   );
  // });

  const filtered = rows;

  return (
    <>
      <style>
        {`
@keyframes slideFade {
  0% {
    opacity: 0;
    transform: translateY(-18px);
  }
  30% {
    opacity: 1;
    transform: translateY(-50%);
  }
  70% {
    opacity: 1;
    transform: translateY(-50%);
  }
  100% {
    opacity: 0;
    transform: translateY(18px);
  }
}
`}
      </style>
      <Box
        bg="white"
        borderRadius={"14px"}
        shadow="sm"
        fontFamily={"Poppins"}
        border={"1px solid #c4c4c4"}
        overflow="hidden"
      >
        {/* Header */}
        <Box py={3} pb={2} bg="transparent">
          <Flex
            justify="space-between"
            align="center"
            gap={3}
            wrap="wrap"
            m={3}
          >
            <Text fontSize="xl" fontWeight="700" color="gray.800" ml={4}>
              My Team Leave
            </Text>
            <Flex align="center" gap={3}>
              <Flex align="center" gap={3} wrap={"wrap"}>
                {/* Search input */}
                {/* <InputGroup size="sm" w="130px">
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  {...searchInputStyle}
                />
              </InputGroup> */}
                <Box
                  position="relative"
                  w={searchExpand ? "320px" : "210px"}
                  overflow="hidden"
                  _focusWithin={{
                    borderColor: "#cccccc",
                    boxShadow: "none",
                  }}
                >
                  <InputGroup size="sm">
                    <InputLeftElement pointerEvents="none">
                      <SearchIcon color="#757575" mt={2} />
                    </InputLeftElement>
                    {!search && (
                      <Text
                        key={`${placeholderIndex}-${searchExpand}`}
                        position="absolute"
                        left="30px"
                        top="50%"
                        transform="translateY(-50%)"
                        fontSize="14px"
                        fontFamily="Poppins"
                        fontWeight={"400"}
                        color="#757575"
                        pointerEvents="none"
                        animation="slideFade 3s ease-in-out"
                        whiteSpace="nowrap"
                      >
                        {searchExpand
                          ? placeholderexpandsearch[placeholderIndex]
                          : placeholders[placeholderIndex]}
                      </Text>
                    )}

                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onFocus={() => setSearchExpand(true)}
                      onBlur={() => {
                        if (!search) setSearchExpand(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const q = search.trim();

                          if (q.length === 0 || q.length >= 3) {
                            fetchTeamLeaves();
                          } else {
                            toast({
                              title: "Type at least 3 characters to search",
                              status: "info",
                              duration: 2000,
                              isClosable: true,
                            });
                          }
                        }
                      }}
                      fontFamily="Poppins"
                      h="39px"
                      borderWidth="1.5px"
                      borderColor="#cccccc"
                      borderRadius="10px"
                      pl="30px"
                      _focus={{
                        borderColor: "#cccccc",
                        boxShadow: "none",
                      }}
                    />

                    {search && (
                      <InputRightElement>
                        <CloseButton
                          size="sm"
                          onClick={() => {
                            setSearch("");
                            if (debounceRef.current)
                              clearTimeout(debounceRef.current);
                            loadFirstPage();
                          }}
                        />
                      </InputRightElement>
                    )}
                  </InputGroup>
                </Box>
                {/* <SortDropdownLeave /> */}
                <SortDropdownLeave
                  defaultSort={sortConfig}
                  onApply={(sort) => {
                    setSortConfig(sort);
                  }}
                  onClear={() => {
                    setSortConfig({ sortBy: "", sortOrder: "" });
                  }}
                />

                {/* Calendar button */}
                <Menu>
                  <MenuButton
                    as={Button}
                    size="sm"
                    bg="white"
                    borderRadius="8px"
                    border={"1px solid #cccccc"}
                    h="39px"
                  >
                    <IoMdCalendar size={18} color="#757575" />
                  </MenuButton>

                  <MenuList minW="260px" p={3}>
                    <Stack spacing={3}>
                      <Box>
                        <Text fontSize="xs" color="gray.600" mb={1}>
                          From
                        </Text>
                        <InputGroup size="sm">
                          <InputLeftElement pointerEvents="none">
                            <IoMdCalendar style={{ opacity: 0.8 }} />
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
                            <IoMdCalendar style={{ opacity: 0.8 }} />
                          </InputLeftElement>
                          <Input
                            type="date"
                            value={toDate}
                            min={fromDate || undefined}
                            onChange={(e) => setToDate(e.target.value)}
                          />
                        </InputGroup>
                      </Box>

                      <Flex gap={2} justify="flex-end" pt={2}>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={clearDateRange}
                        >
                          Clear
                        </Button>
                        <Button
                          size="sm"
                          _hover={{ bg: "blue.800", color: "white" }}
                          border={"1px solid #1A365D"}
                          bg={"#1A365D"}
                          color="white"
                          onClick={applyDateRange}
                        >
                          Apply
                        </Button>
                      </Flex>
                    </Stack>
                  </MenuList>
                </Menu>

                {/* More menu */}
                <ChakraBox overflow="hidden">
                  <Menu>
                    <MenuButton
                      as={Button}
                      size="sm"
                      bg="white"
                      borderRadius="8px"
                      border="1px solid #cccccc"
                      px={3}
                      py={2}
                      h="39px"
                    >
                      <Flex align="center" justify="center" w="100%">
                        <Icon as={BsThreeDots} boxSize={4} color="gray.600" />
                      </Flex>
                    </MenuButton>

                    {/* <MenuList
                      minW="220px"
                      borderRadius="8px"
                      boxShadow="lg"
                      py={0}
                    >
                      <MenuItem px={4} py={3}>
                        <HStack spacing={3}>
                          <ChakraBox
                            borderRadius="md"
                            p={2}
                            bg="gray.50"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            minW="36px"
                            minH="36px"
                          >
                            <Icon
                              as={AiOutlineFile}
                              boxSize={5}
                              color="gray.700"
                            />
                          </ChakraBox>
                          <ChakraBox>
                            <Text fontSize="sm" fontWeight={600}>
                              Export as .csv
                            </Text>
                          </ChakraBox>
                        </HStack>
                      </MenuItem>

                      <MenuDivider />

                      <MenuItem px={4} py={3}>
                        <HStack spacing={3} align="center" w="100%">
                          <ChakraBox
                            borderRadius="md"
                            p={2}
                            bg="gray.50"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            minW="36px"
                            minH="36px"
                          >
                            <Icon
                              as={FaFileExcel}
                              boxSize={5}
                              color="green.600"
                            />
                          </ChakraBox>

                          <ChakraBox flex="1">
                            <Text
                              fontSize="sm"
                              fontWeight={600}
                              color="gray.800"
                            >
                              Export as .xls
                            </Text>
                          </ChakraBox>

                          <Icon
                            as={AiOutlineCheckCircle}
                            boxSize={5}
                            color="green.500"
                          />
                        </HStack>
                      </MenuItem>

                      <MenuDivider />

                      <MenuItem px={4} py={3}>
                        <HStack spacing={3}>
                          <ChakraBox
                            borderRadius="md"
                            p={2}
                            bg="gray.50"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            minW="36px"
                            minH="36px"
                          >
                            <Icon as={FiUpload} boxSize={5} color="gray.700" />
                          </ChakraBox>
                          <ChakraBox>
                            <Text fontSize="sm" fontWeight={600}>
                              Import
                            </Text>
                          </ChakraBox>
                        </HStack>
                      </MenuItem>
                    </MenuList> */}

                    <MenuList
                      minW="220px"
                      borderRadius="8px"
                      boxShadow="lg"
                      py={0}
                    >
                      {/* <Box px={4} py={3}> */}
                      <MenuItem px={4} py={3}>
                        <HStack spacing={3}>
                          <Box
                            borderRadius="md"
                            p={2}
                            bg="gray.50"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            minW="36px"
                            minH="36px"
                          >
                            <Icon
                              as={AiOutlineFile}
                              boxSize={5}
                              color="gray.700"
                            />
                          </Box>
                          <Box>
                            <Text fontSize="sm" fontWeight={600}>
                              Export as .csv
                            </Text>
                          </Box>
                        </HStack>
                      </MenuItem>

                      <Divider
                        /*m={4} p={4} */ m={4}
                        mt={0}
                        p={4}
                        pt={0}
                        pb={0}
                      />

                      <MenuItem px={4} py={3} pt={0}>
                        <HStack spacing={3} align="center" w="100%">
                          <Box
                            borderRadius="md"
                            p={2}
                            bg="gray.50"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            minW="36px"
                            minH="36px"
                          >
                            <Icon
                              as={FaFileExcel}
                              boxSize={5}
                              color="green.600"
                            />
                          </Box>

                          <Box flex="1">
                            <Text
                              fontSize="sm"
                              fontWeight={600}
                              color="gray.800"
                            >
                              Export as .xls
                            </Text>
                          </Box>

                          <Icon
                            as={AiOutlineCheckCircle}
                            boxSize={5}
                            color="green.500"
                          />
                        </HStack>
                      </MenuItem>

                      <Divider m={0} />

                      <MenuItem px={4} py={3}>
                        <HStack spacing={3}>
                          <Box
                            borderRadius="md"
                            p={2}
                            bg="gray.50"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            minW="36px"
                            minH="36px"
                          >
                            <Icon as={FiUpload} boxSize={5} color="gray.700" />
                          </Box>
                          <Box>
                            <Text fontSize="sm" fontWeight={600}>
                              Import
                            </Text>
                          </Box>
                        </HStack>
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </ChakraBox>
              </Flex>
            </Flex>
          </Flex>
        </Box>

        <Box
          w="100%"
          h="1.5px"
          bgImage="repeating-linear-gradient(
          to right,
          #C7C7C7 0 6px,
          transparent 6px 14px
          )"
          mb={4}
        />
        {/* Status chips row */}
        <Flex gap={3} mb={2} align="center" wrap="wrap" m={3}>
          <Text fontWeight={600} minW="120px" ml={4}>
            Current Status
          </Text>

          <HStack spacing={2} wrap="wrap">
            {[
              { label: "Approved", key: "APPROVED", color: "green" },
              { label: "Pending", key: "PENDING", color: "orange" },
              { label: "Rejected", key: "REJECTED", color: "red" },
            ].map((s) => {
              const active = statusFilter === s.key;
              const anySelected = Boolean(statusFilter);
              const faded = anySelected && !active;

              return (
                <Button
                  key={s.key}
                  size="sm"
                  onClick={() =>
                    setStatusFilter((prev) => (prev === s.key ? "" : s.key))
                  }
                  position="relative"
                  borderRadius="full"
                  px={6}
                  py={1.5}
                  h="36px"
                  display="inline-flex"
                  alignItems="center"
                  gap={2}
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
                  <Text
                    fontSize="14px"
                    fontWeight={600}
                    letterSpacing="-0.03em"
                  >
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
                      cursor="pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setStatusFilter("");
                      }}
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
          w="100%"
          h="2px"
          bgImage="repeating-linear-gradient(
    to right,
    #C7C7C7 0 6px,
    transparent 6px 14px
  )"
          mb={2}
        />

        {/* Table area */}
        <Box
          pb={3}
          pt={3}
          h={{ base: "28vh", sm: "45vh", md: "80vh", lg: "52vh" }}
          overflowY="auto"
          sx={{
            "&::-webkit-scrollbar": {
              width: "0px",
            },
          }}
        >
          <Box display={{ base: "block", md: "none" }} px={3}>
            {filtered.map((r) => (
              <Box
                key={r.id}
                p={4}
                mb={4}
                border="1px solid #e0e0e0"
                borderRadius="14px"
                boxShadow="sm"
                bg="white"
              >
                <Flex justify="space-between" align="flex-start" gap={3}>
                  <Box>
                    <Text fontSize="sm" color="gray.500" mb={1}>
                      Employee ID
                    </Text>
                    <Text fontWeight={600}>{r.employeeId}</Text>
                  </Box>
                  <IconButton
                    aria-label={`View ${r.fullName}`}
                    icon={<LuEye />}
                    size="sm"
                    variant="ghost"
                    onClick={() => openFor(r)}
                  />
                </Flex>

                <Box mt={4}>
                  <Text fontSize="sm" color="gray.500" mb={1}>
                    Full Name
                  </Text>
                  <Text fontWeight={600}>{r.fullName}</Text>
                </Box>

                <Box mt={4}>
                  <Text fontSize="sm" color="gray.500" mb={1}>
                    Leave Type
                  </Text>
                  <Text>{r.leaveType}</Text>
                </Box>

                <Flex mt={4} gap={4}>
                  <Box flex="1">
                    <Text fontSize="sm" color="gray.500" mb={1}>
                      From
                    </Text>
                    <Text>{r.from}</Text>
                  </Box>
                  <Box flex="1">
                    <Text fontSize="sm" color="gray.500" mb={1}>
                      To
                    </Text>
                    <Text>{r.to}</Text>
                  </Box>
                </Flex>

                <Flex mt={4} gap={4}>
                  <Box flex="1">
                    <Text fontSize="sm" color="gray.500" mb={1}>
                      No.of Days
                    </Text>
                    <Text>{r.days}</Text>
                  </Box>
                  <Box flex="1">
                    <Text fontSize="sm" color="gray.500" mb={1}>
                      Status
                    </Text>
                    <Text color={statusColor(r.status)} fontWeight={600}>
                      {r.status}
                    </Text>
                  </Box>
                </Flex>
              </Box>
            ))}
          </Box>

          <Box display={{ base: "none", md: "block" }}>
            <Table
              variant="simple"
              size="sm"
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
                    fontFamily: "'Poppins', sans-serif",
                    color: "#000000",
                  },
                }}
              >
                <Tr>
                  <Th>Employee ID</Th>
                  <Th>Full Name</Th>
                  <Th>Leave Type</Th>
                  <Th textAlign="center">From</Th>
                  <Th textAlign="center">To</Th>
                  <Th textAlign="center">No.of Days</Th>
                  <Th>Status</Th>
                  <Th>Action</Th>
                </Tr>
              </Thead>

              <Tbody>
                {filtered.map((r) => (
                  <Tr key={r.id}>
                    <Td>{r.employeeId}</Td>
                    <Td>
                      <Flex align="center" gap={3}>
                        <Box>
                          <Text fontWeight={500}>{r.fullName}</Text>
                        </Box>
                      </Flex>
                    </Td>
                    <Td>{r.leaveType}</Td>
                    <Td textAlign="center">{r.from}</Td>
                    <Td textAlign="center">{r.to}</Td>
                    <Td textAlign="center">{r.days}</Td>
                    <Td color={statusColor(r.status)}>{r.status}</Td>
                    <Td>
                      <IconButton
                        aria-label={`View ${r.fullName}`}
                        icon={<LuEye />}
                        size="sm"
                        variant="ghost"
                        onClick={() => openFor(r)}
                      />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>

          {/* if no rows */}
          {loading && (
            <VStack py={8}>
              <Text>Loading team leaves...</Text>
            </VStack>
          )}

          {!loading && filtered.length === 0 && (
            <VStack py={8}>
              <Text fontFamily="poppins">No Leave Requests For Now!</Text>
            </VStack>
          )}
        </Box>

        {/* Modal for details */}
        <Box>
          <Modal
            isOpen={isOpen}
            onClose={() => {
              onClose();
              setSelected(null);
            }}
            size="md"
          >
            <ModalOverlay />
            <ModalContent borderRadius="16px" fontFamily="Poppins">
              <ModalHeader>
                <Flex direction="column" gap={2}>
                  <Text fontSize="lg" fontWeight={700}>
                    {selected?.fullName}
                  </Text>

                  {/* <Text fontSize="sm" color="gray.500">
                    {selected?.employeeId}
                  </Text> */}

                  {selected?.status && (
                    <Tag
                      size="sm"
                      mt={2}
                      colorScheme={
                        selected.status.toLowerCase().includes("approve")
                          ? "green"
                          : selected.status.toLowerCase().includes("pending")
                            ? "yellow"
                            : "red"
                      }
                    >
                      {selected.status}
                    </Tag>
                  )}
                </Flex>
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                {selectedLoading ? (
                  <VStack py={8}>
                    <Text>Loading details...</Text>
                  </VStack>
                ) : (
                  <Stack spacing={4}>
                    <Box>
                      <Text fontSize="sm" mb={1} color="gray.600">
                        {selected?.leaveType}
                      </Text>
                      <Divider />
                      <Flex gap={4}>
                        <FormControl isRequired>
                          <FormLabel fontSize="xs" color="gray.500" mb={0}>
                            From
                          </FormLabel>
                          <Text fontWeight={600}>{selected?.from}</Text>
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel fontSize="xs" color="gray.500" mb={0}>
                            To
                          </FormLabel>
                          <Text fontWeight={600}>{selected?.to}</Text>
                        </FormControl>
                      </Flex>
                    </Box>
                    <Divider />
                    <Box>
                      <Text fontSize="xs" color="gray.500">
                        No. of days :
                      </Text>
                      <Text fontWeight={600}>{selected?.days}</Text>
                    </Box>

                    <Divider />

                    <Box>
                      <Text fontSize="xs" color="gray.500" mb={1}>
                        Reason
                      </Text>
                      <Text>{selected?.reason}</Text>
                    </Box>

                    {selected?.appliedAt && (
                      <>
                        <Divider />
                        <Box>
                          <Text fontSize="xs" color="gray.500" mb={1}>
                            Applied at
                          </Text>
                          <Text>
                            {new Date(selected.appliedAt).toLocaleString()}
                          </Text>
                        </Box>
                      </>
                    )}

                    {selected?.approvedAt && (
                      <>
                        <Divider />
                        <Box>
                          <Text fontSize="xs" color="gray.500" mb={1}>
                            Approved at
                          </Text>
                          <Text>
                            {new Date(selected.approvedAt).toLocaleString()}
                          </Text>
                        </Box>
                      </>
                    )}

                    {selected?.approvedBy && (
                      <>
                        <Divider />
                        <Box>
                          <Text fontSize="xs" color="gray.500" mb={1}>
                            Approved by
                          </Text>
                          <Text>{selected.approvedBy}</Text>
                        </Box>
                      </>
                    )}

                    {/* <Box>
                  <Text fontSize="xs" color="gray.500" mb={2}>
                    Uploaded document
                  </Text>
                  <Box
                    border="1px dashed #d1d5db"
                    borderRadius="8px"
                    p={6}
                    textAlign="center"
                  >
                    <Image
                      src={selected?.document || undefined}
                      alt="uploaded"
                      fallbackSrc="https://via.placeholder.com/200x120?text=uploaded+document"
                      mx="auto"
                      maxH="120px"
                      objectFit="contain"
                    />
                  </Box>
                </Box> */}
                  </Stack>
                )}
              </ModalBody>

              {selected?.status === "Pending" && (
                <Flex justifyContent="space-between" mb={4} p={6}>
                  <Button
                    w={{ base: "100%", md: "auto" }}
                    borderRadius="md"
                    bg="red.600"
                    color="white"
                    _hover={{ bg: "red.700" }}
                    fontFamily="Poppins"
                    fontWeight="500"
                    isLoading={actionLoading}
                    onClick={() => handleAction("reject")}
                  >
                    Reject
                  </Button>

                  <Button
                    w={{ base: "100%", md: "auto" }}
                    borderRadius="md"
                    bg="#274167"
                    color="white"
                    _hover={{ bg: "#1f3143" }}
                    fontFamily="Poppins"
                    fontWeight="500"
                    isLoading={actionLoading}
                    onClick={() => handleAction("approve")}
                  >
                    Approve
                  </Button>
                </Flex>
              )}
            </ModalContent>
          </Modal>
        </Box>
      </Box>
    </>
  );
}
