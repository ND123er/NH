import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Flex,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  VStack,
  CloseButton,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  HStack,
  Icon,
  useBreakpointValue,
  Divider,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { LuEye } from "react-icons/lu";
import { AiOutlineFile } from "react-icons/ai";
import { BsThreeDots } from "react-icons/bs";
import api from "../../api/axios";
import { getOrgCode } from "../../utils/token";
import CustomisedBalModal from "./CustomisedBalModal";
import FilterDropdownLeave from "./Filters/FilterDropdownLeave";

export default function CustomisedBal() {
  const toast = useToast();
  const isMobile = useBreakpointValue({ base: true, md: false });

  /* ================= refs ================= */
  const containerRef = useRef(null);
  const sentinelRef = useRef(null);
  const debounceRef = useRef(null);
  const reqIdRef = useRef(0);
  const blockObserverRef = useRef(true);
  const didInitialLoadRef = useRef(false);

  /* ================= state ================= */
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [searchExpand, setSearchExpand] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  // const placeholders = ["Search by full name", "Search by employee ID"];
  // const placeholderexpandsearch = ["Search by full name"];
  const placeholders = ["Search by Full Name", "Search by Employee ID"];

  const placeholderexpandsearch = [
    "Search by Full Name (Min 3 char.)",
    "Search by Employee ID  (Min3 char.)",
  ];
  const [leaveTypeFilter, setLeaveTypeFilter] = useState([]);
  const [departmentFilter, setDepartmentFilter] = useState([]);
  const [locationFilter, setLocationFilter] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  /* modal */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const inputStyle = {
    fontFamily: "Poppins",
    fontSize: "15px",
    _placeholder: {
      color: "gray.400",
      fontFamily: "Poppins",
      fontSize: "14px",
    },
    h: "55px",
    borderWidth: "1.5px",
    borderColor: "#D0D5DD",
    borderRadius: "8px",
  };

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

  const limit = 20;

  const orgId =
    (typeof getOrgCode === "function" && getOrgCode()) ||
    (typeof window !== "undefined" && localStorage.getItem("org_code"));

  /* ================= fetchPage ================= */
  const fetchPage = useCallback(
    async ({ q = "", offsetParam = 0, append = false }) => {
      const thisReqId = ++reqIdRef.current;

      append ? setLoadingMore(true) : setLoadingInitial(true);
      setError(null);

      try {
        const s = encodeURIComponent(q.trim());
        const leaveTypesParam = Array.isArray(leaveTypeFilter)
          ? leaveTypeFilter.join(",")
          : "";
        const deptParam = Array.isArray(departmentFilter)
          ? departmentFilter.join(",")
          : "";
        const locParam = Array.isArray(locationFilter)
          ? locationFilter.join(",")
          : "";

        const url = `/employee/get_employees_list?org_id=${encodeURIComponent(
          orgId || "",
        )}&search=${s}&offset=${offsetParam}&limit=${limit}&leave_types=${encodeURIComponent(
          leaveTypesParam,
        )}&departments=${encodeURIComponent(deptParam)}&locations=${encodeURIComponent(locParam)}`;

        const res = await api.get(url);
        const pageData = Array.isArray(res?.data?.data) ? res.data.data : [];

        if (thisReqId !== reqIdRef.current) return;

        setEmployees((prev) => (append ? [...prev, ...pageData] : pageData));
        // setEmployees(append ? [...employees, ...pageData] : pageData);

        if (pageData.length === 0) {
          setHasMore(false);
        } else {
          setHasMore(true);
          setOffset((prev) => prev + pageData.length);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load employees");
        toast({ title: "Failed to load employees", status: "error" });
      } finally {
        setLoadingInitial(false);
        setLoadingMore(false);

        // allow observer AFTER paint
        requestAnimationFrame(() => {
          blockObserverRef.current = false;
        });
      }
    },
    [orgId, toast, leaveTypeFilter, departmentFilter, locationFilter],
  );

  // useEffect(() => {
  //   if (!placeholders || placeholders.length === 0) return;
  //   const id = setInterval(() => {
  //     setPlaceholderIndex((i) => (i + 1) % placeholders.length);
  //   }, 3500);
  //   return () => clearInterval(id);
  // }, [placeholders]);
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  /* ================= loadFirstPage ================= */
  const loadFirstPage = useCallback(() => {
    blockObserverRef.current = true;
    reqIdRef.current += 1;
    setOffset(0);
    setHasMore(true);

    fetchPage({
      q: search,
      offsetParam: 0,
      append: false,
    });
  }, [fetchPage, search]);

  /* ================= initial mount ================= */
  useEffect(() => {
    if (!orgId) return;
    if (didInitialLoadRef.current) return;

    didInitialLoadRef.current = true;
    loadFirstPage();
  }, [orgId, loadFirstPage]);

  /* ================= search debounce ================= */
  useEffect(() => {
    if (!didInitialLoadRef.current) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const q = search.trim();
      if (q.length === 0 || q.length >= 3) {
        loadFirstPage();
      }
    }, 450);

    return () => clearTimeout(debounceRef.current);
  }, [search, loadFirstPage]);

  /* ================= intersection observer ================= */
  useEffect(() => {
    const sentinel = sentinelRef.current;
    const container = containerRef.current;
    if (!sentinel || !container) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          hasMore &&
          !loadingInitial &&
          !loadingMore &&
          !blockObserverRef.current
        ) {
          fetchPage({
            q: search,
            offsetParam: offset,
            append: true,
          });
        }
      },
      { root: container, threshold: 0.1 },
    );

    obs.observe(sentinel);
    return () => obs.disconnect();
  }, [fetchPage, offset, hasMore, loadingInitial, loadingMore, search]);

  /* ================= modal helpers ================= */
  //old
  // const openFor = (emp) => {
  //   setSelectedRow(emp);
  //   setIsModalOpen(true);
  // };
  //old
  //new
  const openFor = async (emp) => {
    try {
      const res = await api.get(
        `/leave/get_my_leave_summary?employee_id=${emp.employee_id}&organisation_id=${orgId}`,
      );

      const leaves = Array.isArray(res?.data?.leaves) ? res.data.leaves : [];

      if (leaves.length === 0) {
        toast({
          title: "No balance data available to customize",
          status: "info",
          duration: 2500,
          isClosable: true,
        });
        return;
      }

      setSelectedRow(emp);
      setIsModalOpen(true);
    } catch (err) {
      console.error(err);

      toast({
        title: "Failed to load leave balances",
        status: "error",
        duration: 2500,
        isClosable: true,
      });
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRow(null);
  };

  const exportCsv = async () => {
    try {
      const params = new URLSearchParams();

      if (search && search.trim().length >= 3) {
        params.append("search", search.trim());
      }

      if (departmentFilter.length > 0) {
        params.append("departments", departmentFilter.join(","));
      }

      if (locationFilter.length > 0) {
        params.append("locations", locationFilter.join(","));
      }

      if (leaveTypeFilter.length > 0) {
        params.append("leave_types", leaveTypeFilter.join(","));
      }

      params.append("org_id", orgId);
      params.append("export", "csv");

      const url = `/employee/get_employees_list_export?${params.toString()}`;

      const res = await api.get(url, {
        responseType: "blob",
      });

      const blob = new Blob([res.data], {
        type: "text/csv;charset=utf-8;",
      });

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = downloadUrl;
      link.setAttribute("download", "Employees.csv");

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      toast({
        title: "Balance downloaded successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error(err);

      toast({
        title: "Failed to download CSV",
        description: err.response?.data?.message || err.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  /* ================= render ================= */
  return (
    <>
      <style>{`
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
`}</style>
      <Box
        bg="white"
        borderRadius="14px"
        border="1px solid #c4c4c4"
        h={{ base: "57vh", sm: "67vh", md: "74vh", lg: "74vh" }}
        display="flex"
        flexDirection="column"
        overflow="hidden"
      >
        <Flex
          justify="space-between"
          align="center"
          pt={4}
          pr={{ base: 3, md: 4 }}
          pl={{ base: 3, md: 4 }}
          pb={3}
          gap={{ base: 2, md: 0 }}
          flexWrap={{ base: "wrap", md: "nowrap" }}
          flexShrink={0}
        >
          <Text
            fontSize={{ base: "lg", md: "xl" }}
            fontWeight="700"
            ml={{ base: 0, md: 4 }}
          >
            Customize balance
          </Text>

          {/* Filters Header Row */}
          <Box bg="transparent" w={{ base: "100%", md: "auto" }}>
            <Flex
              justify={{ base: "flex-start", md: "space-between" }}
              align="center"
              gap={{ base: 2, md: 3 }}
              wrap={{ base: "wrap", md: "nowrap" }}
              mb={0}
            >
              <Flex
                align="center"
                gap={{ base: 1.5, md: 3 }}
                wrap={{ base: "wrap", md: "nowrap" }}
              >
                {/* Search input */}
                <Box
                  position="relative"
                  // w={{
                  //   base: searchExpand ? "230px" : "170px",
                  //   md: searchExpand ? "320px" : "210px",
                  // }}
                  w={{
                    base: searchExpand ? "200px" : "170px",
                    md: searchExpand ? "220px" : "220px",
                    lg: searchExpand ? "320px" : "210px",
                  }}
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
                        // fontSize={{ base: "11px", md: "14px" }}
                        fontSize={{
                          base: "12px",
                          sm: "12px",
                          md: "11px",
                          lg: "14px",
                        }}
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
                      fontFamily="Poppins"
                      h={{ base: "38px", md: "39px" }}
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

                    {search && (
                      <InputRightElement>
                        <CloseButton
                          size="sm"
                          onClick={() => {
                            setSearch("");
                          }}
                        />
                      </InputRightElement>
                    )}
                  </InputGroup>
                </Box>

                <Box>
                  <FilterDropdownLeave
                    onApply={(filters) => {
                      setDepartmentFilter(filters.departments || []);
                      setLocationFilter(filters.locations || []);
                      // support holidayType as leaveTypeFilter if provided
                      if (filters.holidayType)
                        setLeaveTypeFilter(filters.holidayType || []);
                    }}
                    onClear={() => {
                      setDepartmentFilter([]);
                      setLocationFilter([]);
                      setLeaveTypeFilter([]);
                    }}
                  />
                </Box>

                {/* More menu */}
                <Menu>
                  <MenuButton
                    as={Button}
                    size="sm"
                    bg="white"
                    borderRadius="8px"
                    border="1px solid #cccccc"
                    px={3}
                    py={2}
                    h={{ base: "35px", md: "39px" }}
                  >
                    <Flex align="center" justify="center" w="100%">
                      <Icon as={BsThreeDots} boxSize={4} color="gray.600" />
                    </Flex>
                  </MenuButton>

                  <MenuList
                    minW="220px"
                    borderRadius="8px"
                    boxShadow="lg"
                    py={0}
                  >
                    <MenuItem px={4} py={3} onClick={exportCsv}>
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
                  </MenuList>
                </Menu>
              </Flex>
            </Flex>
          </Box>
        </Flex>

        <Box
          w="100%"
          h="1.5px"
          bgImage="repeating-linear-gradient(
                  to right,
                  #C7C7C7 0 6px,
                  transparent 6px 14px
                  )"
          mb={4}
          flexShrink={0}
        />

        <Box
          ref={containerRef}
          flex={1}
          overflowY="auto"
          overflowX="hidden"
          px={{ base: 3, md: 4 }}
          sx={{
            /* Firefox */
            scrollbarWidth: "none",

            /* IE / Edge */
            msOverflowStyle: "none",

            /* Chrome / Safari / Edge */
            "&::-webkit-scrollbar": {
              display: "none",
            },
          }}
          pb={5}
        >
          {loadingInitial && employees.length === 0 ? (
            <Flex justify="center" py={8}>
              <Spinner />
            </Flex>
          ) : error ? (
            <Flex justify="center" py={8} color="red.500">
              {error}
            </Flex>
          ) : employees.length === 0 ? (
            <VStack py={8}>
              <Text>No employees found</Text>
            </VStack>
          ) : isMobile ? (
            // MOBILE CARD VIEW
            <VStack spacing={3} align="stretch" pb={4}>
              {employees.map((e) => (
                <Box
                  key={e._id || e.employee_id}
                  borderRadius="lg"
                  border="1px solid #E2E8F0"
                  bg="white"
                  boxShadow="sm"
                  p={3}
                >
                  <Flex justify="space-between" align="start" mb={2}>
                    <Box>
                      <Text fontWeight="600" fontSize="sm">
                        {e.full_name || "-"}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        ID: {e.employee_code || "-"}
                      </Text>
                    </Box>
                    <IconButton
                      size="sm"
                      variant="ghost"
                      icon={<LuEye />}
                      onClick={() => openFor(e)}
                    />
                  </Flex>

                  <Divider my={2} />

                  <VStack align="stretch" spacing={2} fontSize="sm">
                    <Flex justify="space-between">
                      <Text color="gray.600">Location:</Text>
                      <Text fontWeight="500">{e.location || "-"}</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text color="gray.600">Department:</Text>
                      <Text fontWeight="500">{e.department || "-"}</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text color="gray.600">Job Title:</Text>
                      <Text fontWeight="500">{e.job_title || "-"}</Text>
                    </Flex>
                  </VStack>
                </Box>
              ))}
            </VStack>
          ) : (
            // DESKTOP TABLE VIEW
            <Table size="sm">
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
                  <Th>Full Name</Th>
                  <Th>Location</Th>
                  <Th>Department</Th>
                  <Th>Job Title</Th>
                  <Th>Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {employees.map((e) => (
                  <Tr key={e._id || e.employee_id}>
                    <Td>{e.employee_code || "-"}</Td>
                    <Td>{e.full_name || "-"}</Td>
                    <Td>{e.location || "-"}</Td>
                    <Td>{e.department || "-"}</Td>
                    <Td>{e.job_title || "-"}</Td>
                    <Td>
                      <IconButton
                        size="sm"
                        variant="ghost"
                        icon={<LuEye />}
                        onClick={() => openFor(e)}
                      />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}

          <Box ref={sentinelRef} h="1px" />

          {loadingMore && (
            <Flex justify="center" py={3}>
              <Spinner size="sm" />
            </Flex>
          )}
        </Box>

        <CustomisedBalModal
          isOpen={isModalOpen}
          onClose={closeModal}
          employee={selectedRow}
          onSave={closeModal}
        />
      </Box>
    </>
  );
}
