import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
  Table,
  Icon,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Checkbox,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  Image,
  CloseButton,
  HStack,
  Tag,
  Spinner,
  VStack,
  useBreakpointValue,
  VisuallyHidden,
  useToast,
  Divider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Progress,
  useDisclosure,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { LuEye } from "react-icons/lu";
import api from "../../api/axios";
import { getOrgCode } from "../../utils/token";
import FilterDropdownEmp from "./Filters/FilterDropdownEmp";
import SortDropdownEmp from "./Filters/SortDropdownEmp";
import { useSelector } from "react-redux";
import { getOrgIdFromReduxOrStorage } from "../../utils/token";
import { FiUpload } from "react-icons/fi";
import { FaFileExcel, FaUpload } from "react-icons/fa";
import { AiOutlineFile, AiOutlineCheckCircle } from "react-icons/ai";
import { LuUpload } from "react-icons/lu";
import { Circle } from "@chakra-ui/react";
import { FaCheck } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
const statusOptions = [
  // { id: 1, label: "Full Time" },
  // { id: 2, label: "Part Time" },
  // { id: 3, label: "Contractual" },
  // { id: 4, label: "Intern" },
  { id: 1, label: "Full Time", color: "green" },
  { id: 2, label: "Part Time", color: "orange" },
  { id: 3, label: "Contractual", color: "purple" },
  { id: 4, label: "Intern", color: "blue" },
];

const numericToLabel = {
  1: "Full Time",
  2: "Part Time",
  3: "Contractual",
  4: "Intern",
};

const getStatusColor = (label = "") => {
  const s = label.toLowerCase();
  if (s.includes("full")) return "green";
  if (s.includes("part")) return "orange";
  if (s.includes("contract")) return "purple";
  if (s.includes("intern")) return "blue";
  return "gray";
};

export default function EmployeeTable() {
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const firstSearchRenderRef = useRef(true);
  const firstFilterRenderRef = useRef(true);
  const debounceRef = useRef(null);
  const blockObserverRef = useRef(false);
  const paginationLockRef = useRef(false);
  const [refreshing, setRefreshing] = useState(false);
  const { user, token, loading } = useSelector((state) => state.auth);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [uploadingEmployees, setUploadingEmployees] = useState(false);
  const fileInputRef = useRef(null);

  // const handleFileChange = (e) => {
  //   setFile(e.target.files[0]);
  // };
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setProgress(0);

    // Fake progress animation
    let value = 0;
    const interval = setInterval(() => {
      value += 10;
      setProgress(value);

      if (value >= 100) {
        clearInterval(interval);
      }
    }, 200);
  };

  const orgId =
    (typeof getOrgCode === "function" && getOrgCode()) ||
    (typeof window !== "undefined" && localStorage.getItem("org_code"));

  const [selectedFilters, setSelectedFilters] = useState({
    departments: [],
    positions: [],
    rules: [],
    locations: [],
  });
  const [sort, setSort] = useState({});

  const [selectedStatusIds, setSelectedStatusIds] = useState([]);
  const placeholders = ["Search by Full Name", "Search by Employee ID"];
  const placeholderexpandsearch = [
    "Search by Full Name (Min 3 char.)",
    "Search by Employee ID  (Min3 char.)",
  ];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [searchExpand, setSearchExpand] = useState(false);

  const limit = 20;
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const containerRef = useRef(null);
  const sentinelRef = useRef(null);
  const reqIdRef = useRef(0);
  const isMobile = useBreakpointValue({ base: true, md: false });

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

  const hiddenScrollbar = {
    overflowY: "auto",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
    "&::-webkit-scrollbar": {
      display: "none",
    },
  };

  const fetchPage = useCallback(
    async ({
      q = "",
      filters = {},
      sortObj = {},
      offsetParam = 0,
      append = false,
    } = {}) => {
      const thisReqId = ++reqIdRef.current;

      // FIXED LOADER LOGIC
      if (append) {
        setLoadingMore(true);
      } else {
        if (employees.length === 0) {
          setLoadingInitial(true);
        } else {
          setRefreshing(true);
        }
      }

      setError(null);

      try {
        const s = encodeURIComponent((q || "").trim());

        const baseUrl = `/employee/get_employees_list?org_id=${encodeURIComponent(
          orgId || "",
        )}&employee_id=${user?.employee_id || ""}&search=${s}`;

        const params = new URLSearchParams();

        if (filters) {
          if (filters.departments && filters.departments.length > 0)
            params.append("department_ids", filters.departments.join(","));

          if (filters.positions && filters.positions.length > 0)
            params.append("position_ids", filters.positions.join(","));

          if (filters.rules && filters.rules.length > 0)
            params.append("role_ids", filters.rules.join(","));

          if (filters.locations && filters.locations.length > 0)
            params.append("location_ids", filters.locations.join(","));
        }

        if (selectedStatusIds && selectedStatusIds.length > 0)
          params.append("employment_type_id", selectedStatusIds.join(","));
        0;

        if (sortObj && sortObj.sortBy) {
          params.append("sortBy", sortObj.sortBy);
          params.append("sortOrder", String(sortObj.sortOrder));
        }

        params.append("offset", String(offsetParam));
        params.append("limit", String(limit));

        const url = `${baseUrl}&${params.toString()}`;

        const res = await api.get(url);

        const pageData = (res && res.data && res.data.data) || [];

        // prevent stale requests
        if (thisReqId !== reqIdRef.current) {
          return;
        }

        setEmployees((prev) => {
          if (append) {
            const existingIds = new Set(prev.map((p) => p.employee_id || p.id));

            const newItems = pageData.filter(
              (it) => !existingIds.has(it.employee_id || it.id),
            );

            return [...prev, ...newItems];
          }

          return pageData;
        });

        if (!Array.isArray(pageData) || pageData.length === 0) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }

        if (append) {
          setOffset((prev) => prev + pageData.length);
        } else {
          setOffset(pageData.length);
        }
      } catch (err) {
        setError(err?.message || "Failed to load employees");
      } finally {
        setLoadingInitial(false);
        setLoadingMore(false);
        setRefreshing(false);

        setTimeout(() => {
          blockObserverRef.current = false;
        }, 400);
      }
    },
    [orgId, selectedStatusIds, employees.length],
  );

  const loadFirstPage = useCallback(() => {
    blockObserverRef.current = true;
    paginationLockRef.current = false;

    setOffset(0);
    setHasMore(true);

    // REMOVED:
    // reqIdRef.current += 1;

    fetchPage({
      q: search,
      filters: selectedFilters,
      sortObj: sort,
      offsetParam: 0,
      append: false,
    });
  }, [fetchPage, search, selectedFilters, sort]);

  // ============================
  // 4. REPLACE loadNextPage
  // ============================

  const loadNextPage = useCallback(() => {
    if (
      loadingMore ||
      loadingInitial ||
      !hasMore ||
      paginationLockRef.current
    ) {
      return Promise.resolve();
    }

    paginationLockRef.current = true;

    return fetchPage({
      q: search,
      filters: selectedFilters,
      sortObj: sort,
      offsetParam: offset,
      append: true,
    }).finally(() => {
      paginationLockRef.current = false;
    });
  }, [
    fetchPage,
    offset,
    hasMore,
    loadingMore,
    loadingInitial,
    search,
    selectedFilters,
    sort,
  ]);

  // initial mount
  useEffect(() => {
    if (!orgId) return;
    loadFirstPage();
  }, [orgId]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // prevent duplicate initial API call
    if (firstSearchRenderRef.current) {
      firstSearchRenderRef.current = false;
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      const q = (search || "").trim();

      if (q.length === 0 || q.length >= 3) {
        loadFirstPage();
      }
    }, 450);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [search]);

  useEffect(() => {
    if (firstFilterRenderRef.current) {
      firstFilterRenderRef.current = false;
      return;
    }

    if (!orgId) return;

    loadFirstPage();
  }, [selectedFilters, selectedStatusIds, sort]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const container = containerRef.current;

    if (!sentinel || !container) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        if (
          hasMore &&
          !loadingMore &&
          !loadingInitial &&
          !blockObserverRef.current
        ) {
          blockObserverRef.current = true;

          loadNextPage().finally(() => {
            blockObserverRef.current = false;
          });
        }
      },
      {
        root: container,
        threshold: 0.1,
      },
    );

    obs.observe(sentinel);

    return () => obs.disconnect();
  }, [loadNextPage, hasMore, loadingMore, loadingInitial]);

  const toggleStatus = (id) => {
    setSelectedStatusIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const clearSingleStatus = (id, e) => {
    if (e) e.stopPropagation();
    setSelectedStatusIds((prev) => prev.filter((s) => s !== id));
  };

  const clearAllStatus = () => {
    setSelectedStatusIds([]);
  };

  const allFilteredIds = employees.map(
    (e, idx) => e.employee_id || e.id || `emp-${idx}`,
  );
  const isAllSelected =
    employees.length > 0 &&
    allFilteredIds.every((id) => selectedIds.includes(id));
  const toggleSelectById = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };
  const handleSelectAll = (checked) => {
    if (checked) setSelectedIds(allFilteredIds);
    else setSelectedIds([]);
  };

  const normalizeEmpType = (val) => {
    if (val == null) return "";
    if (typeof val === "number" || /^\d+$/.test(String(val))) {
      return numericToLabel[Number(val)] || String(val);
    }
    const s = String(val).toLowerCase();
    if (s.includes("full")) return "Full Time";
    if (s.includes("part")) return "Part Time";
    if (s.includes("contract")) return "Contractual";
    if (s.includes("intern")) return "Intern";
    return String(val);
  };

  // const handleViewClick = (emp) => {
  //   try {
  //     const code = emp.employee_id || emp.employee_code || emp.id || "";
  //     if (typeof window !== "undefined") {
  //       if (code) localStorage.setItem("employee_emp_code", code);
  //       if (emp._id || emp.id)
  //         localStorage.setItem("employee_db_id", emp._id || emp.id);
  //       const org = getOrgCode && getOrgCode();
  //       if (org) localStorage.setItem("org_code", org);
  //     }
  //   } catch (e) {
  //     console.error("Failed to set employee id for view", e);
  //   }
  //   try {
  //     window.location.href = "/employee/add";
  //   } catch (e) {
  //     window.location = "/employee/add";
  //   }
  // };

  const handleViewClick = (emp) => {
    try {
      const code = emp.employee_id || emp.employee_code || emp.id || "";

      if (code) {
        localStorage.setItem("employee_emp_code", code);
      }

      if (emp._id || emp.id) {
        localStorage.setItem("employee_db_id", emp._id || emp.id);
      }

      const org = getOrgCode();

      if (org) {
        localStorage.setItem("org_code", org);
      }

      // React Router navigation without full page reload
      navigate("/employee/add");
    } catch (error) {
      console.error("Failed to navigate to employee view:", error);
    }
  };

  const handleFilterApply = (filters) => {
    const nextFilters = filters || {
      departments: [],
      positions: [],
      rules: [],
      locations: [],
    };

    setSelectedFilters(nextFilters);
  };

  const handleFilterClear = () => {
    setSelectedFilters({
      departments: [],
      positions: [],
      rules: [],
      locations: [],
    });
  };
  const handleSortApply = (s) => {
    setSort(s || {});
  };
  const handleSortClear = () => setSort({});

  const exportCsv = async () => {
    try {
      const params = new URLSearchParams();
      if (search && search.trim().length >= 3) {
        params.append("search", search.trim());
      }

      if (selectedFilters.departments.length > 0)
        params.append("department_ids", selectedFilters.departments.join(","));

      if (selectedFilters.positions.length > 0)
        params.append("position_ids", selectedFilters.positions.join(","));

      if (selectedFilters.rules.length > 0)
        params.append("role_ids", selectedFilters.rules.join(","));

      if (selectedFilters.locations.length > 0)
        params.append("location_ids", selectedFilters.locations.join(","));

      if (selectedStatusIds.length > 0)
        params.append("employment_type_id", selectedStatusIds.join(","));

      if (sort?.sortBy) {
        params.append("sortBy", sort.sortBy);
        params.append("sortOrder", String(sort.sortOrder));
      }

      const orgId = getOrgIdFromReduxOrStorage(user);
      params.append("org_id", orgId);
      params.append("export", "csv");
      const url = `/employee/get_employees_list_export?${params.toString()}`;

      const res = await api.get(url, { responseType: "blob" });
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
        title: "Employee list downloaded successfully",
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

  const downloadSampleCsv = async () => {
    try {
      setDownloadingTemplate(true);
      const activeOrgId =
        getOrgIdFromReduxOrStorage(user) || orgId || "HRMS000017";
      // const templateApiBase =
      //   import.meta.env.VITE_BASE_URL || "http://localhost:5001/api/v1/hrm";
      const url = `${templateApiBase}/employee/download_employee_template?org_id=${encodeURIComponent(
        activeOrgId,
      )}`;
      const res = await api.get(url, { responseType: "blob" });

      const blob = new Blob([res.data], {
        type:
          res.headers?.["content-type"] ||
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const contentDisposition = res.headers?.["content-disposition"];
      const utf8FilenameMatch = contentDisposition?.match(
        /filename\*=UTF-8''([^;]+)/i,
      );
      const filenameMatch = contentDisposition?.match(/filename="?([^"]+)"?/i);
      const fileName =
        (utf8FilenameMatch?.[1] &&
          decodeURIComponent(utf8FilenameMatch[1]).replace(/['"]/g, "")) ||
        filenameMatch?.[1] ||
        "employee_template.xlsx";

      link.href = downloadUrl;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error(err);
      toast({
        title: "Failed to download sample CSV",
        description: err.response?.data?.message || err.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const handleBulkEmployeeUpload = async () => {
    if (!file) {
      toast({
        title: "Please select an Excel file",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setUploadingEmployees(true);
      const activeOrgId =
        getOrgIdFromReduxOrStorage(user) || orgId || "HRMS000017";
      const createdBy =
        user?.employee_id || user?.user_id || user?.id || "admin";
      // const templateApiBase =
      //   import.meta.env.VITE_BASE_URL || "http://localhost:5001/api/v1/hrm";
      const url = `${templateApiBase}/employee/bulk_add_employees?org_id=${encodeURIComponent(
        activeOrgId,
      )}`;

      const formData = new FormData();
      formData.append("file", file);
      // formData.append("created_by", createdBy);
      formData.append("org_id", activeOrgId);

      await api.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast({
        title: "Employees uploaded successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setFile(null);
      setProgress(0);
      onClose();
      loadFirstPage();
    } catch (err) {
      console.error(err);
      toast({
        title: "Failed to upload employees",
        description: err.response?.data?.message || err.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setUploadingEmployees(false);
    }
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
        bg="white"
        borderRadius={"14px"}
        shadow="sm"
        fontFamily={"Poppins"}
        border={"1px solid #cccccc"}
        // mb={5}
        // h={'700px'}
        // h={'80vh'}
        overflow={"hidden"}
      >
        {/* Header */}
        <Box py={3} pb={2} borderColor="gray.300" bg="transparent">
          <Flex
            justify="space-between"
            align="center"
            gap={3}
            wrap="wrap"
            ml={3}
            mr={3}
            mt={1}
            mb={1}
          >
            <Text fontSize="22px" fontWeight="700" color="#000000" ml={4}>
              All employees
            </Text>

            <Flex align="center" gap={3} wrap={"wrap"}>
              <Box
                position="relative"
                // w={searchExpand ? "320px" : "210px"}
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
                      // fontSize="14px"
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
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        if (debounceRef.current)
                          clearTimeout(debounceRef.current);
                        const q = (search || "").trim();
                        if (q.length === 0 || q.length >= 3) {
                          setSearch(q);
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
                        mt={1}
                        onClick={() => {
                          setSearch("");
                          if (debounceRef.current)
                            clearTimeout(debounceRef.current);
                        }}
                      />
                    </InputRightElement>
                  )}
                </InputGroup>
              </Box>

              {/* Filter button */}
              <FilterDropdownEmp
                onApply={handleFilterApply}
                onClear={handleFilterClear}
                defaultSelected={selectedFilters}
              />
              {/* </Box> */}

              <SortDropdownEmp
                onApply={handleSortApply}
                onClear={handleSortClear}
                defaultSort={sort}
              />

              <Menu>
                <MenuButton
                  as={IconButton}
                  aria-label="More actions"
                  size="sm"
                  variant="outline"
                  height="37px"
                  width="37px"
                  borderRadius="10px"
                  border="1px solid #cccccc"
                  icon={
                    <Box as="span" fontSize="20px" fontWeight="bold">
                      ⋯
                    </Box>
                  }
                />
                <MenuList minW="220px" borderRadius="8px" boxShadow="lg" py={0}>
                  <Box px={4} py={3} onClick={exportCsv} cursor={"pointer"}>
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
                        <Icon as={AiOutlineFile} boxSize={5} color="gray.700" />
                      </Box>
                      <Box>
                        <Text fontSize="sm" fontWeight={600}>
                          Export as .csv
                        </Text>
                      </Box>
                    </HStack>
                  </Box>

                  <Divider m={4} mt={0} p={4} pt={0} pb={0} />

                  <Box px={4} py={3} pt={0} cursor={"pointer"} onClick={onOpen}>
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
                        <Icon as={FaFileExcel} boxSize={5} color="green.600" />
                      </Box>

                      <Box flex="1">
                        <Text fontSize="sm" fontWeight={600} color="gray.800">
                          Upload as .csv
                        </Text>
                      </Box>

                      <Icon
                        as={AiOutlineCheckCircle}
                        boxSize={5}
                        color="green.500"
                      />
                    </HStack>
                  </Box>
                </MenuList>
              </Menu>
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

        {/* Current Status filter row */}
        <Flex gap={3} align="center" wrap="wrap" m={3} mt={0} mb={3}>
          <Text fontWeight="600" minW="120px" ml={4}>
            Employment Type
          </Text>

          <HStack spacing={2} wrap="wrap">
            {statusOptions.map((s) => {
              const active = selectedStatusIds.includes(s.id);
              const anySelected = selectedStatusIds.length > 0;
              const faded = anySelected && !active;

              return (
                <Button
                  key={s.id}
                  size="sm"
                  onClick={() => {
                    toggleStatus(s.id);
                  }}
                  borderRadius="full"
                  px={3}
                  py={1.2}
                  position="relative"
                  _focus={{ boxShadow: "none" }}
                  display="inline-flex"
                  alignItems="center"
                  gap={2}
                  // borderWidth={active ? "1px" : "1px"}
                  // borderColor={active ? "#000" : "#C7C7C7"}
                  // bg={"#fff"}
                  // color={active ? "#000" : "#C7C7C7"}
                  // boxShadow={active ? "sm" : "none"}
                  height={"38px"}
                  borderWidth="1px"
                  borderColor={
                    active ? `${s.color}.300` : faded ? "gray.200" : "#cccccc"
                  }
                  bg={active ? `${s.color}.100` : "transparent"}
                  color={active ? `${s.color}.600` : "gray.700"}
                  opacity={faded ? 0.45 : 1}
                  transition="all 0.2s ease"
                  _hover={{
                    bg: active
                      ? `${s.color}.200`
                      : faded
                        ? "transparent"
                        : "gray.50",
                  }}
                >
                  <Text
                    as="span"
                    fontSize="sm"
                    // fontWeight={active ? 500 : 500}
                    fontWeight={600}
                    fontFamily={"poppins"}
                  >
                    {s.label}
                  </Text>

                  {active && (
                    <CloseButton
                      position="absolute"
                      top="-10px"
                      right="4px"
                      boxSize="20px"
                      minW="20px"
                      h="20px"
                      p="0"
                      fontSize="9px"
                      bg="#E5F4EC"
                      color="#000"
                      borderRadius="full"
                      onClick={(e) => clearSingleStatus(s.id, e)}
                      aria-label={`Clear ${s.label}`}
                      _hover={{ bg: "#C6EAD8" }}
                    />
                  )}
                </Button>
              );
            })}
          </HStack>

          {selectedStatusIds.length > 0 && (
            <Button size="sm" variant="ghost" onClick={clearAllStatus} ml={2}>
              Clear
            </Button>
          )}
        </Flex>

        <Box
          // h="0.5px"
          w="100%"
          h="1.5px"
          bgImage="repeating-linear-gradient(
          to right,
          #C7C7C7 0 6px,
          transparent 6px 14px
          )"
          mb={4}
        />

        <Box>
          {refreshing && (
            <Box px={4} pb={2}>
              {/* <Progress
                size="xs"
                isIndeterminate
                borderRadius="full"
                colorScheme="blue"
              /> */}
              <Spinner />
            </Box>
          )}

          <Box
            ref={containerRef}
            mx={{ base: 0, sm: 0, md: 0, lg: -3 }}
            borderRadius="md"
            maxH={{ base: "calc(100vh - 450px)", md: "60vh" }}
            overflowY="auto"
            pl={{ base: 2, sm: 2, md: 2, lg: 3 }}
            pr={{ base: 2, sm: 2, md: 2, lg: 1 }}
            sx={hiddenScrollbar}
          >
            {/* Loading initial */}
            {loadingInitial && employees.length === 0 ? (
              <Flex justify="center" py={8}>
                <Spinner />
              </Flex>
            ) : error ? (
              <Flex justify="center" py={8} color="gray.500">
                No employees found
              </Flex>
            ) : employees?.length === 0 ? (
              <Flex justify="center" py={8}>
                No employees found
              </Flex>
            ) : (
              <>
                {/* Desktop table OR mobile card list */}
                {isMobile ? (
                  <>
                    <VStack spacing={4} align="stretch" pb={4}>
                      {employees?.map((emp, i) => {
                        const empId = emp.employee_id || emp.id || `emp-${i}`;
                        const empTypeLabel = normalizeEmpType(
                          emp.employment_type ||
                            emp.type ||
                            emp.employment_type_label ||
                            "",
                        );
                        const name = emp.full_name || emp.name || "";
                        const jobTitle = emp.job_title || emp.job || "";
                        return (
                          <Box
                            key={empId}
                            borderRadius="xl"
                            border="1px solid #E2E8F0"
                            bg="white"
                            boxShadow="sm"
                            p={4}
                          >
                            <Flex justify="space-between" align="center">
                              <Flex align="center" gap={3}>
                                <Checkbox
                                  isChecked={selectedIds.includes(empId)}
                                  onChange={() => toggleSelectById(empId)}
                                />
                                <Avatar
                                  size="md"
                                  src={emp.avatar}
                                  name={name}
                                  bg="gray.100"
                                  color="gray.700"
                                />
                                <Box>
                                  <Text fontWeight="600" fontSize="sm">
                                    {name || "-"}
                                  </Text>
                                  <Text fontSize="xs" color="gray.500">
                                    {jobTitle || "Human Resource"}
                                  </Text>
                                </Box>
                              </Flex>

                              {empTypeLabel && (
                                <Tag
                                  size="sm"
                                  variant="subtle"
                                  colorScheme={getStatusColor(empTypeLabel)}
                                  borderRadius="full"
                                  px={3}
                                  py={1}
                                >
                                  {empTypeLabel}
                                </Tag>
                              )}
                            </Flex>

                            <Box
                              borderTopWidth="1px"
                              borderColor="gray.100"
                              mt={3}
                              pt={3}
                            >
                              <Flex justify="space-between" align="center">
                                <Box>
                                  <Text fontSize="xs" color="gray.500">
                                    ID
                                  </Text>
                                  <Text fontSize="sm" fontWeight="500">
                                    {emp?.employee_id || emp?.id || "-"}
                                  </Text>
                                </Box>

                                <Box textAlign="right">
                                  <Text fontSize="xs" color="gray.500">
                                    Location
                                  </Text>
                                  <Text fontSize="sm" fontWeight="500">
                                    {emp.location || "-"}
                                  </Text>
                                </Box>
                              </Flex>

                              <Flex justify="flex-end" mt={3}>
                                <IconButton
                                  aria-label="View employee"
                                  icon={<LuEye />}
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewClick(emp)}
                                />
                              </Flex>
                            </Box>
                          </Box>
                        );
                      })}
                    </VStack>
                    <Box ref={sentinelRef} h="1px" />
                  </>
                ) : (
                  <>
                    <Table
                      variant="striped"
                      size="sm"
                      sx={{
                        "& tbody tr:nth-of-type(odd) td": {
                          background: "#f0f2f5",
                        },
                        "& tbody tr:nth-of-type(even) td": {
                          background: "white",
                        },
                        "& td, & th": {
                          border: "none !important",
                        },
                        "& tr": {
                          border: "none !important",
                        },
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
                          <Th>
                            <Checkbox
                              isChecked={isAllSelected}
                              onChange={(e) =>
                                handleSelectAll(e.target.checked)
                              }
                              size="lg"
                              sx={{
                                ".chakra-checkbox__control": {
                                  w: "20px",
                                  h: "20px",
                                  borderRadius: "4px",
                                  border: "1px solid #cccccc",
                                },

                                ".chakra-checkbox__control[data-checked]": {
                                  bg: "#274066",
                                  borderColor: "#274066",
                                  color: "white",
                                },

                                ".chakra-checkbox__control[data-indeterminate]":
                                  {
                                    bg: "#274066",
                                    borderColor: "#274066",
                                    color: "white",
                                  },
                              }}
                            />
                          </Th>
                          <Th>Employee ID</Th>
                          <Th>Full Name</Th>
                          <Th>Location</Th>
                          <Th>Designation</Th>
                          <Th>Department</Th>
                          <Th>Role</Th>
                          <Th>Employment Type</Th>
                          <Th>View</Th>
                        </Tr>
                      </Thead>
                      <Tbody overflow={"hidden"}>
                        {employees?.map((emp, i) => {
                          const empId = emp.employee_id || emp.id || `emp-${i}`;
                          const empTypeLabel = normalizeEmpType(
                            emp.employment_type ||
                              emp.type ||
                              emp.employment_type_label ||
                              "",
                          );
                          return (
                            <Tr key={empId}>
                              <Td>
                                <Checkbox
                                  isChecked={selectedIds.includes(empId)}
                                  onChange={() => toggleSelectById(empId)}
                                  size="lg"
                                  sx={{
                                    ".chakra-checkbox__control": {
                                      w: "20px",
                                      h: "20px",
                                      borderRadius: "4px",
                                      border: "1px solid #cccccc",
                                    },

                                    ".chakra-checkbox__control[data-checked]": {
                                      bg: "#274066",
                                      borderColor: "#274066",
                                      color: "white",
                                    },

                                    ".chakra-checkbox__control[data-indeterminate]":
                                      {
                                        bg: "#274066",
                                        borderColor: "#274066",
                                        color: "white",
                                      },
                                  }}
                                />
                              </Td>
                              <Td>{emp?.employee_code || ""}</Td>
                              <Td>
                                <Flex align="center" gap={2}>
                                  {emp?.avatar && (
                                    <Avatar
                                      size="sm"
                                      src={emp.avatar}
                                      name={emp.full_name || emp.name}
                                    />
                                  )}
                                  <Box>
                                    <Text>
                                      {emp.full_name || emp.name || ""}
                                    </Text>
                                  </Box>
                                </Flex>
                              </Td>
                              <Td>{emp.location || ""}</Td>
                              <Td>{emp.job_title || emp.job || ""}</Td>
                              <Td>{emp.department || ""}</Td>
                              <Td>{emp.role || ""}</Td>
                              <Td>{empTypeLabel}</Td>
                              <Td>
                                <IconButton
                                  aria-label="View employee"
                                  icon={<LuEye />}
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewClick(emp)}
                                />
                              </Td>
                            </Tr>
                          );
                        })}
                      </Tbody>
                    </Table>
                    <Box ref={sentinelRef} h="1px" />
                  </>
                )}

                <Box mt={3}>
                  {loadingMore && (
                    <Flex justify="center" py={3}>
                      <Spinner size="sm" />
                      <VisuallyHidden>Loading more</VisuallyHidden>
                    </Flex>
                  )}
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Box>
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
        <ModalOverlay />
        <ModalContent borderRadius="xl">
          <ModalHeader fontFamily={"Poppins"}>File Upload</ModalHeader>
          <ModalCloseButton
            onClick={() => {
              setFile(null);
              setProgress(0);
            }}
          />
          {/* <Button
            size="xs"
            variant="outline"
            as="a"
            href="/sample.csv"
            download
          >
            Download sample .csv
          </Button> */}
          <HStack
            justify="space-between"
            align="center"
            mb={1}
            mt={-2}
            paddingRight={6}
          >
            <Text fontSize="md" fontWeight="600"></Text>

            <Button
              size="md"
              variant="outline"
              colorScheme="gray"
              onClick={downloadSampleCsv}
              isLoading={downloadingTemplate}
              loadingText="Downloading"
              borderRadius="md"
              fontWeight={400}
              color="#757575"
              border="1px solid"
              borderColor="#757575"
              fontFamily={"Poppins"}
              boxShadow="sm"
              _hover={{
                boxShadow: "md",
                borderColor: "#757575",
              }}
            >
              Download sample .csv
            </Button>
          </HStack>
          <ModalBody pb={6}>
            {/* Upload Area */}
            <Box
              border="2px dashed"
              borderColor="gray.300"
              borderRadius="md"
              p={10}
              textAlign="center"
              cursor="pointer"
              _hover={{
                borderColor: "#1849D6",
                bg: "blue.50",
              }}
              onClick={() => fileInputRef.current.click()}
            >
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                style={{ display: "none" }}
                id="fileUpload"
                ref={fileInputRef}
              />

              <label>
                {/* <Icon as={FaUpload} boxSize={6} mb={2} /> */}
                <Icon as={LuUpload} boxSize={6} mb={2} />
                <Text fontSize="sm" fontFamily={"Poppins"}>
                  Drag your file(s) or{" "}
                  <Text
                    as="span"
                    color="#1849D6"
                    fontWeight="600"
                    cursor="pointer"
                  >
                    browse
                  </Text>
                </Text>
                {/* <Text fontSize="xs" color="gray.500">
                  Only support .csv files
                </Text> */}
              </label>
            </Box>

            {/* File Preview */}
            {/* {file && (
              <Box mt={4}>
                <Text fontSize="sm">{file.name}</Text>
                <Progress value={60} size="sm" mt={2} />
              </Box>
            )} */}
            <HStack justify="space-between" w="100%" mt={2}>
              <Text fontSize={"14px"} color="#4B4A4A" fontFamily={"Poppins"}>
                Only support .xlsx files
              </Text>

              <Text fontSize={"14px"} color="#4B4A4A" fontFamily={"Poppins"}>
                Max Size 25 kb
              </Text>
            </HStack>
            <Box display="flex" justifyContent="flex-end" mt={3}>
              {/* Button */}
              <Button
                bg="#274167"
                w="40%"
                color="#FFFFFF"
                fontWeight={400}
                fontFamily="Poppins"
                onClick={handleBulkEmployeeUpload}
                isLoading={uploadingEmployees}
                loadingText="Uploading"
                isDisabled={!file || uploadingEmployees}
                _hover={{
                  bg: "#1f3454",
                  transform: "translateY(-1px)",
                  boxShadow: "md",
                }}
                _active={{
                  bg: "#182a45",
                  transform: "translateY(0px)",
                }}
                _focus={{
                  boxShadow: "outline",
                }}
                transition="all 0.2s ease"
              >
                Continue
              </Button>
            </Box>
            {file && (
              <Box
                mt={4}
                p={3}
                border="1px solid #E2E8F0"
                borderRadius="lg"
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                {/* Left side */}
                <HStack spacing={1}>
                  <Icon as={FaFileExcel} boxSize={6} color="gray.500" />
                  <Text fontSize="sm" fontFamily={"Poppins"}>
                    {file.name}
                  </Text>
                  {/* {progress === 100 && (
                    <Circle size="20px" bg="green.500">
                      <Icon as={FaCheck} color="white" boxSize={3} />
                    </Circle>
                  )} */}
                </HStack>

                {/* Middle Progress */}
                {progress !== 100 && (
                  <>
                    <Box flex="1" mx={1}>
                      <Progress
                        value={progress}
                        size="sm"
                        borderRadius="full"
                        bg="gray.200"
                        sx={{
                          "& > div": {
                            background:
                              progress === 100
                                ? "repeating-linear-gradient(45deg, #003f86, #003f86 10px, #1559ac 10px, #1559ac 20px)"
                                : "repeating-linear-gradient(45deg, #003f86, #003f86 10px, #1559ac 10px, #1559ac 20px)",
                          },
                        }}
                      />
                    </Box>
                    {/* <Text fontSize="sm" color="#6D6D6D">
                      {(file.size / 1024).toFixed(2)} KB
                    </Text> */}
                  </>
                )}
                <Box display={"flex"}>
                  {progress === 100 && (
                    <Text fontSize="sm" fontFamily={"Poppins"} color="#06BF5C">
                      Successfully Uploaded
                    </Text>
                  )}
                  {/* Right side (file size) */}
                  <Text
                    fontSize="sm"
                    color="#6D6D6D"
                    ml={2}
                    fontFamily={"Poppins"}
                  >
                    {(file.size / 1024).toFixed(2)} KB
                  </Text>
                </Box>
                {/* Right side */}
                {/* {progress !== 100 ? (
                  <Text fontSize="sm" color="#6D6D6D">
                    {(file.size / 1024).toFixed(2)} KB
                  </Text>
                ) : (

                  <Circle size="24px" bg="green.500">
                    <Icon as={FaCheck} color="white" boxSize={3} />
                  </Circle>
                )} */}
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
