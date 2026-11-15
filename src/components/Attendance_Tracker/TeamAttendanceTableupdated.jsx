//new code
import React, { useCallback, useEffect, useRef, useState } from "react";
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
  Checkbox,
  background,
  TableContainer,
  useBreakpointValue,
} from "@chakra-ui/react";
import { SearchIcon, DeleteIcon } from "@chakra-ui/icons";
import { LuEye } from "react-icons/lu";
import { BiCalendar } from "react-icons/bi";
import FilterDropdownLeave from "../Leave_Tracker/Filters/FilterDropdownLeave";
import SortDropdownLeave from "../Leave_Tracker/Filters/SortDropdownLeave";
import { IoMdCalendar } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useDispatch, useSelector } from "react-redux";
import { getOrgIdFromReduxOrStorage } from "../../utils/token";
import SortDropdownEmp from "../Employees/Filters/SortDropdownEmp";
import searchImg from "../../assets/search_icon2.svg";

const TeamAttendanceTable = () => {
  const [rows, setRows] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  //new
  const limit = 20;
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(false);

  const containerRef = useRef(null);
  const sentinelRef = useRef(null);
  const paginationLockRef = useRef(false);
  //new
  const [selectedRows, setSelectedRows] = useState([]);
  const { user, token, loading } = useSelector((state) => state.auth);
  const [sort, setSort] = useState({});
  const isMobile = useBreakpointValue({ base: true, md: false });
  const placeholders = ["Search by Full Name", "Search by Employee ID"];
  const placeholderexpandsearch = [
    "Search by Full Name",
    "Search by Employee ID",
  ];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [searchExpand, setSearchExpand] = useState(false);

  const [filters, setFilters] = useState({
    departments: [],
    locations: [],
    positions: [],
  });
  useEffect(() => {
    (filters.departments || []).forEach((id) => {
      console.log("Department ID:", id);
    });

    (filters.locations || []).forEach((id) => {
      console.log("Designation/Location ID:", id);
    });
  }, [filters]);

  const onViewAdmin = (rowData) => {
    navigate(
      `/attendances/adminview?employee_id=${
        rowData?.employee_id || rowData?.employee_code || ""
      }`,
      {
        state: {
          employee: rowData,
        },
      },
    );
  };
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000); // slow & smooth

    return () => clearInterval(interval);
  }, []);

  const navigate = useNavigate();

  // useEffect(() => {
  //   getTeamAttendanceData(filters, sort);
  // }, []);
  useEffect(() => {
    setOffset(0);
    setHasMore(true);

    getTeamAttendanceData(filters, sort, 0, false);
  }, []);

  //old
  // const getTeamAttendanceData = async (
  //   appliedFilters = filters,
  //   appliedSort = sort,
  // ) => {
  //   try {
  //     const orgId = getOrgIdFromReduxOrStorage(user);

  //     const params = {
  //       organisation_id: orgId,

  //       location_ids:
  //         appliedFilters.locations?.length > 0
  //           ? appliedFilters.locations.join(",")
  //           : "",

  //       department_ids:
  //         appliedFilters.departments?.length > 0
  //           ? appliedFilters.departments.join(",")
  //           : "",

  //       position_ids:
  //         appliedFilters.positions?.length > 0
  //           ? appliedFilters.positions.join(",")
  //           : "",

  //       sort:
  //         appliedSort?.sortOrder === 1
  //           ? "asc"
  //           : appliedSort?.sortOrder === -1
  //             ? "desc"
  //             : "asc",
  //     };

  //     console.log("ATTENDANCE FILTER PARAMS:", params);

  //     const res = await api.get("/attendance/get_team_attendance_list", {
  //       params,
  //     });

  //     setRows(Array.isArray(res.data?.result) ? res.data.result : []);
  //   } catch (error) {
  //     console.error("Error fetching team attendance data:", error);
  //   }
  // };
  //new
  const getTeamAttendanceData = useCallback(
    async (
      appliedFilters = filters,
      appliedSort = sort,
      offsetParam = 0,
      append = false,
    ) => {
      try {
        if (append) {
          setLoadingMore(true);
        } else {
          setLoadingInitial(true);
        }

        const orgId = getOrgIdFromReduxOrStorage(user);

        const params = {
          organisation_id: orgId,

          location_ids:
            appliedFilters.locations?.length > 0
              ? appliedFilters.locations.join(",")
              : "",

          department_ids:
            appliedFilters.departments?.length > 0
              ? appliedFilters.departments.join(",")
              : "",

          position_ids:
            appliedFilters.positions?.length > 0
              ? appliedFilters.positions.join(",")
              : "",

          sort:
            appliedSort?.sortOrder === 1
              ? "asc"
              : appliedSort?.sortOrder === -1
                ? "desc"
                : "asc",

          offset: offsetParam,
          limit: limit,
        };

        console.log("ATTENDANCE FILTER PARAMS:", params);

        const res = await api.get("/attendance/get_team_attendance_list", {
          params,
        });

        const pageData = Array.isArray(res.data?.result) ? res.data.result : [];

        setRows((prev) => {
          if (!append) {
            return pageData;
          }

          const existingIds = new Set(
            prev.map((item) => item.employee_id || item.employee_code),
          );

          const newItems = pageData.filter(
            (item) => !existingIds.has(item.employee_id || item.employee_code),
          );

          return [...prev, ...newItems];
        });

        if (pageData.length < limit) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }

        if (append) {
          setOffset((prev) => prev + pageData.length);
        } else {
          setOffset(pageData.length);
        }
      } catch (error) {
        console.error("Error fetching team attendance data:", error);
      } finally {
        setLoadingInitial(false);
        setLoadingMore(false);
      }
    },
    [filters, sort, user],
  );
  //new
  //new
  const loadNextPage = useCallback(() => {
    if (
      loadingMore ||
      loadingInitial ||
      !hasMore ||
      paginationLockRef.current
    ) {
      return;
    }

    paginationLockRef.current = true;

    getTeamAttendanceData(filters, sort, offset, true).finally(() => {
      paginationLockRef.current = false;
    });
  }, [
    getTeamAttendanceData,
    filters,
    sort,
    offset,
    hasMore,
    loadingMore,
    loadingInitial,
  ]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const container = containerRef.current;

    if (!sentinel || !container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        if (
          hasMore &&
          !loadingMore &&
          !loadingInitial &&
          !paginationLockRef.current
        ) {
          loadNextPage();
        }
      },
      {
        root: container,
        threshold: 0.1,
      },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [loadNextPage, hasMore, loadingMore, loadingInitial]);
  //new

  const todayISO = (() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  })();
  const [fromDate, setFromDate] = useState(todayISO);
  const [toDate, setToDate] = useState(todayISO);

  const openFor = (row) => {
    setSelected(row);
    onOpen();
  };
  const filtered = [...rows]
    .filter((r) => {
      if (!search || search.length < 3) return true;

      const s = search.toLowerCase();

      return (
        String(
          `${r.first_name || ""} ${r.middle_name || ""} ${r.last_name || ""}`,
        )
          .toLowerCase()
          .includes(s) ||
        String(r.employee_code || "")
          .toLowerCase()
          .includes(s)
      );
    })
    .sort((a, b) => {
      if (!sort?.sortBy) return 0;

      const field = sort.sortBy;

      const aVal = (a[field] || "").toString().toLowerCase();
      const bVal = (b[field] || "").toString().toLowerCase();

      if (sort.sortOrder === 1) {
        return aVal.localeCompare(bVal); // A-Z
      }

      return bVal.localeCompare(aVal); // Z-A
    });

  const handleSortApply = (sortObj) => {
    setSort(sortObj);

    getTeamAttendanceData(filters, sortObj);
  };

  const handleSortClear = () => {
    setSort({});

    getTeamAttendanceData(filters, {});
  };

  const searchInputStyle = {
    fontFamily: "Poppins",
    fontSize: "14px",
    _placeholder: {
      color: "#757575",
      fontFamily: "Poppins",
      fontSize: "14px",
    },
    h: "39px",
    borderWidth: "1.5px",
    borderColor: "#cccccc",
    borderRadius: "10px",
  };

  const formatHours = (minutes) => {
    if (minutes === null || minutes === undefined) return "-";

    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
  };

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
        ref={containerRef}
        bg="white"
        borderRadius={"14px"}
        shadow="sm"
        fontFamily={"Poppins"}
        border={"1px solid #c4c4c4"}
        pb={2}
        mb={5}
        mt={3}
        h={{ base: "70vh", sm: "70vh", md: "60vh", lg: "74vh" }}
        overflowY="auto"
        sx={{
          "&::-webkit-scrollbar": {
            width: "0px",
          },
        }}
      >
        {/* Header */}
        <Box py={3} pb={2} bg="transparent">
          <Flex
            justify="space-between"
            align="center"
            gap={{ base: 1, md: 2 }}
            wrap="wrap"
            m={{ base: 2, md: 3 }}
            mt={1}
            mb={1}
          >
            <Text
              fontSize={{ base: "lg", md: "xl" }}
              fontWeight="700"
              color="gray.800"
              ml={{ base: 0, md: 1 }}
              fontFamily="Poppins"
            >
              All employees attendance
            </Text>
            <Flex
              align="center"
              gap={{ base: 2, md: 3 }}
              wrap={{ base: "wrap", md: "nowrap" }}
              w={{ base: "100%", md: "auto" }}
              justify={{ base: "flex-start", md: "flex-end" }}
            >
              <Flex
                align="center"
                gap={{ base: 1.5, md: 3 }}
                wrap={{ base: "wrap", md: "nowrap" }}
              >
                <Box
                  position="relative"
                  w={{
                    base: searchExpand ? "170px" : "140px",
                    md: searchExpand ? "320px" : "210px",
                  }}
                  overflow="hidden"
                  _focusWithin={{
                    borderColor: "#cccccc",
                    boxShadow: "none",
                  }}
                >
                  <InputGroup size="sm">
                    <InputLeftElement pointerEvents="none">
                      <Image
                        src={searchImg}
                        alt="search"
                        boxSize="16px"
                        mt={2}
                      />
                    </InputLeftElement>
                    {/* 🔥 Animated Placeholder Text */}
                    {!search && (
                      <Text
                        // key={placeholderIndex}
                        key={`${placeholderIndex}-${searchExpand}`}
                        position="absolute"
                        left="38px"
                        top="50%"
                        transform="translateY(-50%)"
                        fontSize={{ base: "11px", md: "14px" }}
                        fontFamily="Poppins"
                        fontWeight={"400"}
                        color="#757575"
                        pointerEvents="none"
                        animation="slideFade 3s ease-in-out"
                        whiteSpace="nowrap"
                      >
                        {/* {placeholders[placeholderIndex]} */}
                        {searchExpand
                          ? placeholderexpandsearch[placeholderIndex]
                          : placeholders[placeholderIndex]}
                      </Text>
                    )}

                    {/* Actual Input */}
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onFocus={() => setSearchExpand(true)}
                      onBlur={() => {
                        if (!search) setSearchExpand(false);
                      }}
                      fontFamily="Poppins"
                      h={{ base: "35px", md: "39px" }}
                      fontSize={{ base: "12px", md: "14px" }}
                      borderWidth="1.5px"
                      borderColor="#cccccc"
                      borderRadius="10px"
                      pl="30px"
                      _focus={{
                        borderColor: "#cccccc",
                        boxShadow: "none",
                      }}
                    />
                  </InputGroup>
                </Box>

                {/* Filter button */}
                <Box display={{ base: "none", md: "block" }}>
                  {/* <FilterDropdownLeave
                    onApply={(selectedFilters) => {
                      setFilters(selectedFilters);
                    }} */}
                  <FilterDropdownLeave
                    onApply={(selectedFilters) => {
                      setFilters(selectedFilters);

                      getTeamAttendanceData(selectedFilters, sort);
                    }}
                    onClear={() => {
                      const cleared = {
                        departments: [],
                        locations: [],
                        positions: [],
                      };

                      setFilters(cleared);

                      getTeamAttendanceData(cleared, sort);
                    }}
                    showHolidayType={false}
                  />
                </Box>

                <Box display={{ base: "none", md: "block" }}>
                  <SortDropdownEmp
                    onApply={handleSortApply}
                    onClear={handleSortClear}
                    defaultSort={sort}
                    lastModifiedOption={false}
                  />
                </Box>
              </Flex>
            </Flex>
          </Flex>
        </Box>

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
        <Box
          pb={{ base: "2vh", md: "2vh", xl: "0vh" }}
          overflowX={{ base: "auto", md: "visible" }}
        >
          {isMobile ? (
            // MOBILE CARD VIEW
            <VStack spacing={3} align="stretch" px={3} pb={4}>
              {filtered?.map((r, index) => (
                <Box
                  key={index}
                  borderRadius="lg"
                  border="1px solid #E2E8F0"
                  bg="white"
                  boxShadow="sm"
                  p={3}
                >
                  <Flex justify="space-between" align="start" mb={2}>
                    <Box>
                      <Text fontWeight="600" fontSize="sm">
                        {r.first_name} {r.middle_name} {r.last_name}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        ID: {r.employee_code}
                      </Text>
                    </Box>
                    <IconButton
                      aria-label="View"
                      icon={<LuEye />}
                      size="sm"
                      variant="ghost"
                      onClick={() => onViewAdmin(r)}
                    />
                  </Flex>

                  <Divider my={2} />

                  <VStack align="stretch" spacing={2} fontSize="sm">
                    <Flex justify="space-between">
                      <Text color="gray.600">Location:</Text>
                      <Text fontWeight="500">{r.location || "-"}</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text color="gray.600">Designation:</Text>
                      <Text fontWeight="500">{r.job_title || "-"}</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text color="gray.600">Department:</Text>
                      <Text fontWeight="500">{r.department || "-"}</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text color="gray.600">Attendance Status:</Text>
                      <Tag
                        size="sm"
                        colorScheme={
                          r.attendance_status === "Present" ? "green" : "red"
                        }
                        borderRadius="full"
                      >
                        {r.attendance_status || "-"}
                      </Tag>
                    </Flex>
                    <Flex justify="space-between">
                      <Text color="gray.600">Total Hours Worked:</Text>
                      <Text fontWeight="500">{formatHours(r.work_hours)}</Text>
                    </Flex>
                  </VStack>
                </Box>
              ))}
              <Box ref={sentinelRef} h="1px" />

              {loadingMore && (
                <Flex justify="center" py={4}>
                  <Text fontSize="sm" color="gray.500">
                    Loading more...
                  </Text>
                </Flex>
              )}
              {filtered.length === 0 && (
                <VStack py={8}>
                  <Text fontFamily="Poppins">No Attendance found</Text>
                </VStack>
              )}
            </VStack>
          ) : (
            // DESKTOP TABLE VIEW
            <>
              <Table
                variant="simple"
                size="sm"
                sx={{
                  "& tbody tr:nth-of-type(odd) td": { background: "#f0f2f5" },
                  "& tbody tr:nth-of-type(even) td": { background: "white" },
                  "& td, & th": {
                    border: "none !important",
                    //  pl: 6,
                    // pr: 3,
                  },
                  "& thead th": { paddingBottom: "14px" },
                  "& tbody tr:first-of-type td": { paddingTop: "12px" },
                }}
              >
                <Thead
                  sx={{
                    th: {
                      textTransform: "none",
                      fontWeight: "600",
                      fontFamily: "'Poppins', sans-serif",
                      color: "#000000",
                      fontSize: "14px",
                      // whiteSpace: "nowrap",
                    },
                    td: {
                      fontFamily: "'Poppins', sans-serif",
                      // whiteSpace: "nowrap",
                    },
                  }}
                >
                  <Tr>
                    <Th>Employee ID</Th>
                    <Th>Full Name</Th>
                    <Th>Location</Th>
                    <Th>Designation</Th>
                    <Th>Department</Th>
                    <Th>Attendance Status</Th>
                    <Th>Total Hours Worked</Th>
                    <Th>Action</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {/* {rows?.map((r, index) => ( */}
                  {filtered?.map((r, index) => (
                    <Tr key={index}>
                      <Td>{r.employee_code}</Td>
                      <Td>
                        {r.first_name} {r.middle_name} {r.last_name}
                      </Td>
                      <Td>{r.location}</Td>
                      <Td>{r.job_title}</Td>
                      <Td>{r.department}</Td>
                      <Td>{r.attendance_status}</Td>
                      <Td>{formatHours(r.work_hours)}</Td>

                      <Td>
                        <IconButton
                          aria-label="View"
                          // icon={<BsThreeDots />}
                          icon={<LuEye />}
                          size="sm"
                          variant="ghost"
                          // onClick={onViewAdmin}
                          onClick={() => onViewAdmin(r)}
                        />
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
              {/* </TableContainer> */}
              {/* if no rows */}
              <Box ref={sentinelRef} h="1px" />
              {loadingMore && (
                <Flex justify="center" py={4}>
                  <Text fontSize="sm" color="gray.500">
                    Loading more...
                  </Text>
                </Flex>
              )}
              {filtered.length === 0 && (
                <VStack py={8}>
                  {/* <Text fontFamily="Poppins">No Attendance found</Text> */}
                  <Text fontFamily="Poppins">No Attendance found</Text>
                </VStack>
              )}
            </>
          )}
        </Box>

        {/* Modal for details */}
        <Modal isOpen={isOpen} onClose={onClose} size="md">
          <ModalOverlay />
          <ModalContent borderRadius="16px">
            <ModalHeader>
              <Text fontSize="lg" fontWeight={700} fontFamily="Poppins">
                {selected?.fullName}
              </Text>
              <Divider />
              <Text fontSize="sm" color="gray.500" fontFamily="Poppins">
                {selected?.employeeId}
              </Text>
              <Divider />
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Stack spacing={4}>
                <Box>
                  <Text
                    fontSize="sm"
                    mb={1}
                    color="gray.600"
                    fontFamily="Poppins"
                  >
                    {selected?.leaveType}
                  </Text>
                  <Divider />
                  <Flex gap={4}>
                    <Box>
                      <Text fontSize="xs" color="gray.500" fontFamily="Poppins">
                        From*
                      </Text>
                      <Text fontWeight={600}>{selected?.from}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.500" fontFamily="Poppins">
                        To*
                      </Text>
                      <Text fontWeight={600} fontFamily="Poppins">
                        {selected?.to}
                      </Text>
                    </Box>
                  </Flex>
                </Box>
                <Divider />
                <Box>
                  <Text fontSize="xs" color="gray.500" fontFamily="Poppins">
                    No. of days :
                  </Text>
                  <Text fontWeight={600} fontFamily="Poppins">
                    {selected?.days}
                  </Text>
                </Box>

                <Divider />

                <Box>
                  <Text
                    fontSize="xs"
                    color="gray.500"
                    mb={1}
                    fontFamily="Poppins"
                  >
                    Reason
                  </Text>
                  <Text fontFamily="Poppins">{selected?.reason}</Text>
                </Box>

                <Box>
                  <Text
                    fontSize="xs"
                    color="gray.500"
                    mb={2}
                    fontFamily="Poppins"
                  >
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
                </Box>
              </Stack>
            </ModalBody>

            <ModalFooter>
              <Button
                variant="ghost"
                mr={3}
                onClick={onClose}
                fontFamily="Poppins"
              >
                Cancel
              </Button>
              <Button
                w={{ base: "100%", md: "auto" }}
                borderRadius="md"
                bg="#274167"
                color="white"
                _hover={{ bg: "#1f3143" }}
                fontFamily={"Poppins"}
                fontWeight={"500"}
              >
                Approve
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </>
  );
};
export default TeamAttendanceTable;

//  nilava code
