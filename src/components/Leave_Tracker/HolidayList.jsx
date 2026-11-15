import React, { useEffect, useState } from "react";
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
  HStack,
  VStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  InputGroup,
  InputLeftElement,
  Input,
  Stack,
  InputRightElement,
  Divider,
  useDisclosure,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Select,
  RadioGroup,
  Radio,
  Checkbox,
  Textarea,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Box as ChakraBox,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Image,
  Tooltip,
  useToast,
} from "@chakra-ui/react";
import api from "../../api/axios";
import { getOrgCode, decodeTokenPayload } from "../../utils/token";
import { AiOutlineFile, AiOutlineCheckCircle } from "react-icons/ai";
import { useSelector } from "react-redux";

import { SearchIcon } from "@chakra-ui/icons";
import { IoMdCalendar } from "react-icons/io";
import { BsThreeDots } from "react-icons/bs";
import { FaFileExport } from "react-icons/fa";
import { FiUpload } from "react-icons/fi";
import { FaFileExcel } from "react-icons/fa";

import calendar_filter from "../../assets/calendar_filter.svg";

import FilterDropdownLeave from "./Filters/FilterDropdownLeave";
import SortDropdownLeave from "./Filters/SortDropdownLeave";

import { useForm, Controller } from "react-hook-form";
import EditHolidayModal from "./EditHolidayModal";

export default function HolidayList() {
  const [rows, setRows] = useState([]);
  const [loadingHolidays, setLoadingHolidays] = useState(false);
  const [search, setSearch] = useState("");
  // const [fromDate, setFromDate] = useState(() =>
  //   new Date().toISOString().slice(0, 10),
  // );
  // const [toDate, setToDate] = useState(() =>
  //   new Date().toISOString().slice(0, 10),
  // );
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const toast = useToast();

  const { isOpen, onOpen, onClose } = useDisclosure();

  // const tokenPayload = decodeTokenPayload() || {};
  // const isAdmin = tokenPayload?.is_admin ?? tokenPayload?.isAdmin ?? false;

  const { user } = useSelector((state) => state.auth);

  const isAdmin =
    ["owner", "admin"].includes(String(user?.role || "").toLowerCase()) ||
    user?.is_admin === true;

  // Locations state for "Applicable to" field
  const [locations, setLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [locationsFetched, setLocationsFetched] = useState(false);

  // Departments state for "Applicable to" field
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [departmentsFetched, setDepartmentsFetched] = useState(false);

  // edit modal
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  const [selectedHoliday, setSelectedHoliday] = useState(null);

  // delete dialog
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  const [holidayToDelete, setHolidayToDelete] = useState(null);
  const cancelRef = React.useRef();
  const [deleting, setDeleting] = useState(false);

  // filter and sort state
  const [appliedFilters, setAppliedFilters] = useState({});
  // const [appliedSort, setAppliedSort] = useState({});
  const [appliedSort, setAppliedSort] = useState({
    sortBy: "",
    sortOrder: "",
  });

  const inputStyle = {
    fontFamily: "Poppins",
    fontSize: "15px",
    _placeholder: {
      color: "gray.400",
      fontFamily: "Poppins",
      fontSize: "14px",
      fontWeight: "400",
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
    h: "38px",
    borderWidth: "1.5px",
    borderColor: "#cccccc",
    borderRadius: "8px",
  };

  // Format an ISO date string
  const formatIsoToDmy = (iso) => {
    if (!iso) return "-";
    try {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return "-";
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
      return `${dd}-${mm}-${yyyy}`;
    } catch (e) {
      return "-";
    }
  };

  // react-hook-form
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      days: "",
      from: "",
      to: "",
      type: "",
      // applicable: "all",
      // applicable: ["all"],
      applicable: [],
      locations: [],
      departments: [],
      notes: "",
    },
  });

  const applicable = watch("applicable");
  const type = watch("type");

  // useEffect(() => {
  //   if (type === "Public Holiday") {
  //     setValue("applicable", ["all"]);
  //     setValue("locations", []);
  //     setValue("departments", []);
  //   }
  // }, [type, setValue]);

  useEffect(() => {
    if (type === "Public Holiday") {
      setValue("applicable", ["all"]);
    } else {
      setValue("applicable", []);
    }

    setValue("locations", []);
    setValue("departments", []);
  }, [type, setValue]);

  useEffect(() => {
    // if (applicable !== "location" || locationsFetched) return;
    if (!applicable?.includes("location") || locationsFetched) return;

    const fetchLocations = async () => {
      try {
        setLoadingLocations(true);
        const orgId = getOrgCode();
        if (!orgId) return;

        const res = await api.get(
          `/settings/get_company_location_list?org_id=${orgId}`,
        );

        if (res?.data?.status) {
          setLocations(res.data.locations || []);
          setLocationsFetched(true);
        }
      } catch (err) {
        console.error("Failed to fetch locations", err);
      } finally {
        setLoadingLocations(false);
      }
    };

    fetchLocations();
  }, [applicable, locationsFetched]);

  // Fetch departments
  useEffect(() => {
    // if (applicable !== "department" || departmentsFetched) return;
    if (!applicable?.includes("department") || departmentsFetched) return;

    const fetchDepartments = async () => {
      try {
        setLoadingDepartments(true);
        const orgId = getOrgCode();
        if (!orgId) return;

        const res = await api.get(
          `/settings/get_company_departments?org_id=${orgId}`,
        );

        if (res?.data?.data) {
          setDepartments(res.data.data);
          setDepartmentsFetched(true);
        }
      } catch (err) {
        console.error("Failed to fetch departments", err);
      } finally {
        setLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, [applicable, departmentsFetched]);

  //fetch holidays
  const fetchHolidays = async (filters = {}, sort = {}) => {
    try {
      setLoadingHolidays(true);
      const orgId = getOrgCode();
      if (!orgId) return;

      // Build query parameters
      const params = new URLSearchParams();
      params.append("organisation_id", orgId);
      if (sort?.sortBy) {
        params.append("sort_by", sort.sortBy);
      }
      if (sort?.sortOrder !== undefined) {
        params.append("sort_order", sort.sortOrder);
      }

      console.log("query:", params.toString());

      // Add filters
      if (filters.departments && filters.departments.length > 0) {
        filters.departments.forEach((dept) => {
          params.append("department_id", dept);
        });
      }
      if (filters.locations && filters.locations.length > 0) {
        filters.locations.forEach((loc) => {
          params.append("location_id", loc);
        });
      }
      if (filters.holidayType && filters.holidayType.length > 0) {
        filters.holidayType.forEach((type) => {
          params.append("holiday_type", type);
        });
      }

      // Add date range filters
      if (filters.start_date) {
        params.append("start_date", filters.start_date);
      }
      if (filters.end_date) {
        params.append("end_date", filters.end_date);
      }

      // Add search
      if (filters.search && String(filters.search).trim().length > 0) {
        params.append("search", String(filters.search).trim());
      }

      // Add sort
      // if (sort.sortOrder) {
      //   params.append("sort_order", sort.sortOrder);
      // }

      if (sort?.sortBy && sort?.sortOrder) {
        params.append("sort_by", sort.sortBy);
        params.append("sort_order", sort.sortOrder);
      }
      console.log("Query:", params.toString());
      const res = await api.get(`/settings/get_holiday_list`, { params });

      // const res = await api.get(
      //   `/settings/get_holiday_list?${params.toString()}`,
      // );

      // if (res?.data?.data) {
      //   const normalized = res.data.data.map((h) => {
      //     const locationNames = Array.isArray(h.location)
      //       ? h.location
      //       : [];

      //     const departmentNames = Array.isArray(h.department)
      //       ? h.department
      //       : [];

      //     let locationDisplay = "---";
      //     let departmentDisplay = "---";

      //     if (h.applies_to === "ALL") {
      //       locationDisplay = "All locations";
      //       departmentDisplay = "All departments";
      //     } else {
      //       locationDisplay =
      //         locationNames.length > 1
      //           ? `${locationNames[0]}...`
      //           : locationNames[0] || "All locations";

      //       departmentDisplay =
      //         departmentNames.length > 1
      //           ? `${departmentNames[0]}...`
      //           : departmentNames[0] || "All departments";
      //     }

      //     // ✅ Calculate days properly
      //     let calculatedDays = 1;

      //     if (h.start_date && h.end_date) {
      //       const start = new Date(h.start_date);
      //       const end = new Date(h.end_date);

      //       if (!isNaN(start) && !isNaN(end) && end >= start) {
      //         const diffTime = end.getTime() - start.getTime();
      //         calculatedDays =
      //           Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
      //       }
      //     }

      //     return {
      //       id: h.id,
      //       date: formatIsoToDmy(h.start_date),
      //       name: h.holiday_name,
      //       type: h.holiday_type,
      //       location: locationDisplay,
      //       department: departmentDisplay,
      //       locationNames,
      //       departmentNames,
      //       days: calculatedDays,   // ✅ use calculated value
      //       notes: h.notes || "---",
      //       raw: h,
      //     };
      //   });

      //   setRows(normalized);
      // }
      // ... down inside your fetchHolidays function ...
      if (res?.data?.data) {
        const normalized = res.data.data.map((h) => {
          const locationNames = Array.isArray(h.location) ? h.location : [];

          const departmentNames = Array.isArray(h.department)
            ? h.department
            : [];

          let locationDisplay = "---";
          let departmentDisplay = "---";

          if (h.applies_to === "ALL") {
            locationDisplay = "All locations";
            departmentDisplay = "All departments";
          } else {
            locationDisplay =
              locationNames.length > 1
                ? `${locationNames[0]}...`
                : locationNames[0] || "All locations";

            departmentDisplay =
              departmentNames.length > 1
                ? `${departmentNames[0]}...`
                : departmentNames[0] || "All departments";
          }

          // ✅ Calculate days properly
          let calculatedDays = 1;

          if (h.start_date && h.end_date) {
            const start = new Date(h.start_date);
            const end = new Date(h.end_date);

            if (!isNaN(start) && !isNaN(end) && end >= start) {
              const diffTime = end.getTime() - start.getTime();
              calculatedDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
            }
          }
          return {
            id: h.id,
            date: formatIsoToDmy(h.start_date),
            name: h.holiday_name,
            type: h.holiday_type,
            location: locationDisplay,
            department: departmentDisplay,
            locationNames,
            departmentNames,
            days: calculatedDays,
            notes: h.notes || "---",
            raw: h, // holds the ISO 'start_date' string
          };
        });

        // 👇 ADD THIS FRONTEND SORTING BLOCK HERE 👇
        // if (sort && sort.sortOrder) {
        //   const order = Number(sort.sortOrder); // 1 for Ascending, -1 for Descending
        //   normalized.sort((a, b) => {
        //     // Always sort using the underlying timestamp or ISO string, NOT the formatted "DD-MM-YYYY" string
        //     const dateA = new Date(a.raw.start_date).getTime() || 0;
        //     const dateB = new Date(b.raw.start_date).getTime() || 0;

        //     if (order === -1) {
        //       return dateA - dateB; // Ascending: Oldest dates first
        //     } else {
        //       return dateB - dateA; // Descending: Newest dates first
        //     }
        //   });
        // }
        if (sort && sort.sortOrder) {
          const order = Number(sort.sortOrder);

          normalized.sort((a, b) => {
            const dateA = new Date(a.raw.start_date).getTime();
            const dateB = new Date(b.raw.start_date).getTime();

            if (order === 1) {
              // Ascending -> Oldest to Newest
              return dateA - dateB;
            }

            if (order === -1) {
              // Descending -> Newest to Oldest
              return dateB - dateA;
            }

            return 0;
          });
        }

        // Set the cleanly sorted rows to your state
        setRows(normalized);
      }
    } catch (err) {
      console.error("Failed to fetch holidays", err);
    } finally {
      setLoadingHolidays(false);
    }
  };

  useEffect(() => {
    fetchHolidays(appliedFilters, appliedSort);
  }, [appliedFilters, appliedSort]);

  // Apply date range from calendar filter
  const applyDateRange = () => {
    setAppliedFilters((prev) => ({
      ...prev,
      start_date: fromDate,
      end_date: toDate,
    }));
  };

  // Clear date range filter and reset inputs to today
  const clearDateRange = () => {
    setAppliedFilters((prev) => {
      const copy = { ...prev };
      delete copy.start_date;
      delete copy.end_date;
      return copy;
    });

    const today = new Date().toISOString().slice(0, 10);
    // setFromDate(today);
    // setToDate(today);
    setFromDate("");
    setToDate("");
  };

  useEffect(() => {
    const t = setTimeout(() => {
      setAppliedFilters((prev) => {
        const trimmed = String(search || "").trim();
        const copy = { ...prev };

        if (trimmed.length === 0) {
          delete copy.search;
          return copy;
        }

        if (trimmed.length >= 3) {
          // apply search
          copy.search = trimmed;
          return copy;
        }

        if (prev && prev.search) {
          delete copy.search;
          return copy;
        }

        return prev;
      });
    }, 500);

    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const from = watch("from");
    const to = watch("to");

    if (!from || !to) {
      setValue("days", "");
      return;
    }

    const start = new Date(from);
    const end = new Date(to);

    if (isNaN(start) || isNaN(end) || end < start) {
      setValue("days", "");
      return;
    }

    // Inclusive difference (e.g., 1st to 1st = 1 day)
    const diffInMs = end - start;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24)) + 1;

    setValue("days", diffInDays, { shouldValidate: true });
  }, [watch("from"), watch("to"), setValue]);

  // Handle edit helper
  const handleEditClick = async (row) => {
    try {
      const res = await api.get(`/settings/get_holiday_by_id/${row.id}`);
      if (res?.data?.data) {
        setSelectedHoliday(res.data.data);
        onEditOpen();
      }
    } catch (err) {
      console.error("Failed to fetch holiday", err);
    }
  };

  // Handle delete helper
  const handleDeleteClick = (row) => {
    setHolidayToDelete(row);
    onDeleteOpen();
  };

  // Handle confirm delete

  const handleConfirmDelete = async () => {
    if (!holidayToDelete?.id) return;

    try {
      setDeleting(true);
      // await api.delete(`/settings/delete_holiday/${holidayToDelete.id}`);
      const res = await api.delete(
        `/settings/delete_holiday/${holidayToDelete.id}`,
      );

      toast({
        title: res?.data?.msg || "Holiday deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
      await fetchHolidays();
      onDeleteClose();
      setHolidayToDelete(null);
    } catch (err) {
      console.error("Failed to delete holiday", err);
    } finally {
      setDeleting(false);
    }
  };

  //set filtered rows
  const filtered = rows;

  // const onSubmit = async (data) => {
  //   try {
  //     const orgId = getOrgCode();
  //     if (!orgId) return;

  //     const holidayTypeMap = {
  //       "Public Holiday": "PUBLIC",
  //       "Company Holiday": "COMPANY",
  //     };

  //     const appliesToMap = {
  //       all: "ALL",
  //       location: "LOCATION",
  //       department: "DEPARTMENT",
  //     };

  //     const payload = {
  //       organisation_id: orgId,
  //       name: data.name.trim(),
  //       start_date: data.from,
  //       end_date: data.to,
  //       holiday_type: holidayTypeMap[data.type],
  //       applies_to: appliesToMap[data.applicable],
  //       location_ids:
  //         data.applicable === "location" ? data.locations || [] : [],
  //       department_ids:
  //         data.applicable === "department" ? data.departments || [] : [],
  //       description: data.notes?.trim() || "",
  //     };

  //     await api.post("/settings/add_holiday", payload);
  //     toast({
  //       title: "Holiday Added",
  //       description: "Holiday has been added successfully ✅",
  //       status: "success",
  //       duration: 3000,
  //       isClosable: true,
  //       position: "bottom",
  //     });

  //     await fetchHolidays();
  //     onClose();
  //     reset();
  //   } catch (err) {
  //     console.error("Failed to add holiday", err);
  //     toast({
  //       title: "Error",
  //       description: err?.response?.data?.msg || "Failed to add holiday ❌",
  //       status: "error",
  //       duration: 3000,
  //       isClosable: true,
  //       position: "bottom",
  //     });
  //   }
  // };

  const onSubmit = async (data) => {
    try {
      const orgId = getOrgCode();
      if (!orgId) return;

      const selected = Array.isArray(data.applicable) ? data.applicable : [];

      const hasLocation = selected.includes("location");
      const hasDepartment = selected.includes("department");

      // Validate locations
      if (hasLocation && !data.locations?.length) {
        toast({
          title: "Please select at least one location",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Validate departments
      if (hasDepartment && !data.departments?.length) {
        toast({
          title: "Please select at least one department",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const holidayTypeMap = {
        "Public Holiday": "PUBLIC",
        "Company Holiday": "COMPANY",
      };

      const appliesTo =
        hasLocation && hasDepartment
          ? "LOCATION_DEPARTMENT"
          : hasLocation
            ? "LOCATION"
            : hasDepartment
              ? "DEPARTMENT"
              : "ALL";

      const payload = {
        organisation_id: orgId,
        name: data.name.trim(),
        start_date: data.from,
        end_date: data.to,
        holiday_type: holidayTypeMap[data.type],
        applies_to: appliesTo,
        location_ids: hasLocation ? data.locations || [] : [],
        department_ids: hasDepartment ? data.departments || [] : [],
        description: data.notes?.trim() || "",
      };

      await api.post("/settings/add_holiday", payload);

      toast({
        title: "Holiday Added",
        description: "Holiday has been added successfully ✅",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });

      await fetchHolidays(appliedFilters, appliedSort);

      onClose();
      reset();
    } catch (err) {
      console.error("Failed to add holiday", err);

      toast({
        title: "Error",
        description: err?.response?.data?.msg || "Failed to add holiday ❌",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  return (
    <Box
      bg="white"
      borderRadius={"14px"}
      shadow="sm"
      fontFamily={"Poppins"}
      border={"1px solid #c4c4c4"}
    >
      {/* ------------------------- HEADER SECTION --------------------------- */}
      <Box py={3} pb={2}>
        {/* Title + Add Holiday */}
        <Flex justify="space-between" align="center" m={3} mb={1} mt={1}>
          <Flex align="center" gap={3}>
            <Text fontSize="22px" fontWeight={600} letterSpacing={"-0.03em"}>
              Holiday List
            </Text>
          </Flex>

          {isAdmin ? (
            <Button
              size="sm"
              bg="#274167"
              color="white"
              _hover={{ bg: "#1f3143" }}
              onClick={onOpen}
              fontWeight={400}
              height={"47px"}
              borderRadius={"10px"}
              w={"110px"}
            >
              Add Holiday
            </Button>
          ) : (
            <Flex justify={"flex-end"} m={3} mt={0} gap={3} mb={0}>
              <Flex align="center" gap={3}>
                <Menu>
                  <MenuButton
                    as={Button}
                    size="sm"
                    bg="white"
                    borderRadius="5px"
                    border="1px solid #cccccc"
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
                            <IoMdCalendar />
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
                            <IoMdCalendar />
                          </InputLeftElement>
                          <Input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                          />
                        </InputGroup>
                      </Box>

                      <Flex justify="space-between" gap={2}>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={clearDateRange}
                          color={"#757575"}
                        >
                          Clear
                        </Button>
                        <Button
                          size="sm"
                          bg="#1A365D"
                          _hover={{
                            bg: "blue.700",
                          }}
                          color="white"
                          onClick={applyDateRange}
                        >
                          Apply
                        </Button>
                      </Flex>
                    </Stack>
                  </MenuList>
                </Menu>

                <InputGroup size="sm" w="180px">
                  <InputLeftElement pointerEvents="none">
                    <SearchIcon color="gray.400" />
                  </InputLeftElement>

                  <Input
                    placeholder="Search by name"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    {...searchInputStyle}
                  />
                </InputGroup>

                <FilterDropdownLeave
                  onApply={(filters) => setAppliedFilters(filters)}
                  onClear={() => setAppliedFilters({})}
                />

                <SortDropdownLeave
                  sortByKey="start_date"
                  defaultSort={appliedSort}
                  onApply={(sort) => setAppliedSort(sort)}
                  onClear={() => setAppliedSort({})}
                />
              </Flex>

              <ChakraBox border="1px solid #cccccc" borderRadius={"8px"}>
                <Menu>
                  <MenuButton
                    as={Button}
                    size="sm"
                    bg="white"
                    px={3}
                    borderRadius="8px"
                    height={"37px"}
                  >
                    <Icon as={BsThreeDots} />
                  </MenuButton>

                  <MenuList minW="220px">
                    <MenuItem icon={<FaFileExport />}>Export as .csv</MenuItem>
                    <MenuDivider />
                    <MenuItem icon={<FaFileExport />}>Export as .xls</MenuItem>
                    <MenuDivider />
                    <MenuItem icon={<FiUpload />}>Import</MenuItem>
                  </MenuList>
                </Menu>
              </ChakraBox>
            </Flex>
          )}
        </Flex>

        {/* Divider */}
        {/* <Box
          h="1px"
          w="100%"
          bgImage={`repeating-linear-gradient(
          to right,
          #C7C7C7 0,
          #C7C7C7 4px,
          transparent 3px,
          transparent 8px
        )`}
          mb={4}
          mt={4}
        /> */}

        <Box
          my={5}
          h="1.5px"
          bgImage="repeating-linear-gradient(
    to right,
    #C7C7C7 0 6px,
    transparent 6px 14px
  )"
        />

        {/* Calendar + Search + Filter + Sort + More */}
        {isAdmin && (
          <Flex justify={"flex-end"} m={3} mt={0} gap={3}>
            <Flex align="center" gap={3}>
              <Menu>
                <MenuButton
                  as={Button}
                  size="sm"
                  bg="white"
                  borderRadius="8px"
                  border="1px solid #cccccc"
                  height={"37px"}
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
                          <IoMdCalendar />
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
                          <IoMdCalendar />
                        </InputLeftElement>
                        <Input
                          type="date"
                          value={toDate}
                          min={fromDate || undefined}
                          onChange={(e) => setToDate(e.target.value)}
                        />
                      </InputGroup>
                    </Box>

                    <Flex justify="space-between" gap={2}>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={clearDateRange}
                        color={"#757575"}
                      >
                        Clear
                      </Button>
                      <Button
                        size="sm"
                        bg="#1A365D"
                        _hover={{
                          bg: "blue.700",
                        }}
                        color="white"
                        onClick={applyDateRange}
                      >
                        Apply
                      </Button>
                    </Flex>
                  </Stack>
                </MenuList>
              </Menu>

              <InputGroup size="sm" w="180px">
                <InputLeftElement pointerEvents="none" mt={1}>
                  <SearchIcon color="gray.400" />
                </InputLeftElement>

                <Input
                  placeholder="Search by name"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  {...searchInputStyle}
                />
              </InputGroup>

              <FilterDropdownLeave
                onApply={(filters) => setAppliedFilters(filters)}
                onClear={() => setAppliedFilters({})}
              />

              <SortDropdownLeave
                sortByKey="start_date"
                defaultSort={appliedSort}
                onApply={(sort) => setAppliedSort(sort)}
                onClear={() => setAppliedSort({})}
              />
            </Flex>

            <ChakraBox border="1px solid #cccccc" borderRadius={"8px"}>
              <Menu>
                <MenuButton
                  as={Button}
                  size="sm"
                  bg="white"
                  // px={3}
                  borderRadius="8px"
                  height={"37px"}
                  paddingTop={"4px"}
                  fontSize={"17px"}
                >
                  <Icon as={BsThreeDots} />
                </MenuButton>

                {/* <MenuList minW="220px">
                  <MenuItem icon={<FaFileExport />}>Export as .csv</MenuItem>
                  <MenuDivider />
                  <MenuItem icon={<FaFileExport />}>Export as .xls</MenuItem>
                  <MenuDivider />
                  <MenuItem icon={<FiUpload />}>Import</MenuItem>
                </MenuList> */}
                <MenuList minW="220px" borderRadius="8px" boxShadow="lg" py={0}>
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
                        <Icon as={AiOutlineFile} boxSize={5} color="gray.700" />
                      </Box>
                      <Box>
                        <Text fontSize="sm" fontWeight={600}>
                          Export as .csv
                        </Text>
                      </Box>
                    </HStack>
                  </MenuItem>

                  <Divider /*m={4} p={4} */ m={4} mt={0} p={4} pt={0} pb={0} />

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
                        <Icon as={FaFileExcel} boxSize={5} color="green.600" />
                      </Box>

                      <Box flex="1">
                        <Text fontSize="sm" fontWeight={600} color="gray.800">
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
        )}
      </Box>
      {isAdmin && (
        // <Box
        //   h="1px"
        //   w="100%"
        //   bgImage={`repeating-linear-gradient(
        //   to right,
        //   #C7C7C7 0,
        //   #C7C7C7 4px,
        //   transparent 3px,
        //   transparent 8px
        // )`}
        //   mb={4}
        // />
        <Box
          h="1.5px"
          bgImage="repeating-linear-gradient(
    to right,
    #C7C7C7 0 6px,
    transparent 6px 14px
  )"
          mb={4}
        />
      )}

      {/* ------------------------- TABLE SECTION --------------------------- */}
      <Box
        pt={3}
        pb={3}
        maxH="50vh"
        overflowY="auto"
        sx={{
          "&::-webkit-scrollbar": {
            width: "0px",
          },
        }}
      >
        <Table
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
                fontFamily: "Poppins",
                color: "#000",
              },
            }}
          >
            <Tr>
              <Th textAlign="center">Date</Th>
              <Th textAlign="center">Holiday Name</Th>
              <Th textAlign="center">Holiday Type</Th>
              <Th textAlign="center">Location</Th>
              <Th textAlign="center">Department</Th>
              <Th textAlign="center">No.of Days</Th>
              <Th textAlign="center">Notes</Th>
              {/* <Th textAlign="center">Action</Th> */}
              {isAdmin && <Th textAlign="center">Action</Th>}
            </Tr>
          </Thead>

          <Tbody>
            {filtered.map((r) => (
              <Tr key={r.id}>
                <Td textAlign="center">{r.date}</Td>
                <Td textAlign="center">{r.name}</Td>
                <Td textAlign="center">{r.type}</Td>

                {/* Location column with tooltip for multiple */}
                <Td textAlign="center">
                  {r.locationNames && r.locationNames.length > 1 ? (
                    <Tooltip label={r.locationNames.join(", ")} hasArrow>
                      <Text cursor="pointer">{r.location}</Text>
                    </Tooltip>
                  ) : (
                    <Text>{r.location}</Text>
                  )}
                </Td>

                {/* Department column with tooltip for multiple */}
                <Td textAlign="center">
                  {r.departmentNames && r.departmentNames.length > 1 ? (
                    <Tooltip label={r.departmentNames.join(", ")} hasArrow>
                      <Text cursor="pointer">{r.department}</Text>
                    </Tooltip>
                  ) : (
                    <Text>{r.department}</Text>
                  )}
                </Td>

                <Td textAlign="center">{r.days}</Td>
                <Td textAlign="center">{r.notes}</Td>
                {isAdmin && (
                  <Td textAlign="center">
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        size="sm"
                        variant="ghost"
                        icon={<BsThreeDots />}
                      />
                      <MenuList>
                        <MenuItem onClick={() => handleEditClick(r)}>
                          Edit
                        </MenuItem>
                        <MenuItem onClick={() => handleDeleteClick(r)}>
                          Delete
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </Td>
                )}
              </Tr>
            ))}
          </Tbody>
        </Table>

        {loadingHolidays && (
          <VStack py={8}>
            <Text>Loading holidays...</Text>
          </VStack>
        )}

        {!loadingHolidays && filtered.length === 0 && (
          <VStack py={8}>
            <Text>No holidays found</Text>
          </VStack>
        )}
      </Box>

      {/* ------------------------- ADD HOLIDAY MODAL --------------------------- */}
      <Modal
        isOpen={isOpen}
        onClose={() => {
          onClose();
          reset();
        }}
        size="lg"
      >
        <ModalOverlay />
        <ModalContent borderRadius="16px">
          <ModalHeader>
            <Text fontSize="lg" fontWeight="700">
              Add Holiday
            </Text>
          </ModalHeader>
          <ModalCloseButton />

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <ModalBody>
              <Stack spacing={4}>
                {/* Holiday name */}
                <FormControl isInvalid={!!errors.name} isRequired>
                  <FormLabel fontFamily={"poppins"}>Holiday name</FormLabel>

                  <Input
                    placeholder="Add Holiday Name"
                    {...register("name", {
                      required: "Holiday name is required",
                      validate: (v) =>
                        v.trim().length > 0 || "Holiday name is required",
                    })}
                    {...inputStyle}
                    borderColor={errors.name ? "#E53E3E" : "#D0D5DD"}
                    _focus={{
                      borderColor: errors.name ? "#E53E3E" : "#243b66",
                      boxShadow: "0 0 0 1px #E53E3E",
                    }}
                  />

                  <FormErrorMessage fontFamily={"poppins"}>
                    {errors.name?.message}
                  </FormErrorMessage>
                </FormControl>

                {/* From & To */}
                <Flex gap={4}>
                  <Box flex={1}>
                    <FormControl isRequired isInvalid={!!errors.from}>
                      <FormLabel fontFamily={"poppins"}>From</FormLabel>
                      <Input
                        type="date"
                        placeholder="dd-mm-yyyy"
                        {...register("from", {
                          required: "From date is required",
                        })}
                        max={watch("to") || undefined}
                        {...inputStyle}
                      />
                      <FormErrorMessage fontFamily={"poppins"}>
                        {errors.from?.message}
                      </FormErrorMessage>
                    </FormControl>
                  </Box>

                  <Box flex={1}>
                    <FormControl isRequired isInvalid={!!errors.to}>
                      <FormLabel fontFamily={"poppins"}>To</FormLabel>
                      <Input
                        type="date"
                        {...register("to", {
                          required: "To date is required",
                          validate: (v) =>
                            !watch("from") ||
                            v >= watch("from") ||
                            "To date cannot be before From date",
                        })}
                        min={watch("from") || undefined}
                        {...inputStyle}
                      />
                      <FormErrorMessage fontFamily={"poppins"}>
                        {errors.to?.message}
                      </FormErrorMessage>
                    </FormControl>
                  </Box>
                </Flex>

                {/* Number of days */}
                <FormControl isRequired isInvalid={!!errors.days}>
                  <FormLabel fontFamily={"poppins"}>Number of days</FormLabel>

                  <Input
                    placeholder="Put the From and To dates"
                    type="number"
                    min={1}
                    {...register("days", {
                      required: "Number of days is required",
                      valueAsNumber: true,
                      min: { value: 1, message: "Minimum 1 day" },
                    })}
                    {...inputStyle}
                    sx={{
                      border: "1.5px solid #D0D5DD",
                    }}
                    border={
                      errors.days ? "1.8px solid #E53E3E !important" : "#D0D5DD"
                    }
                    _focus={{
                      borderColor: errors.days ? "#E53E3E" : "#243b66",
                      boxShadow: "0 0 0 1px #E53E3E",
                    }}
                    isReadOnly
                  />

                  <FormErrorMessage fontFamily={"poppins"}>
                    {errors.days?.message}
                  </FormErrorMessage>
                </FormControl>

                {/* Holiday type */}
                <FormControl isInvalid={!!errors.type} isRequired>
                  <FormLabel fontFamily={"poppins"}>Holiday type</FormLabel>

                  <Select
                    placeholder="Select holiday type"
                    {...register("type", {
                      required: "Holiday type is required",
                    })}
                    {...inputStyle}
                    fontFamily={"poppins"}
                  >
                    <option>Public Holiday</option>
                    <option>Company Holiday</option>
                  </Select>

                  <FormErrorMessage fontFamily={"poppins"}>
                    {errors.type?.message}
                  </FormErrorMessage>
                </FormControl>

                {/* Applicable to radio group */}
                {/* <Box>
                  <FormControl isInvalid={!!errors.applicable} isRequired>
                    <FormLabel fontFamily={"poppins"}>Applicable to</FormLabel>

                    <Controller
                      control={control}
                      name="applicable"
                      rules={{
                        required: "Please select who this holiday applies to",
                      }}
                      render={({ field }) => (
                        <>
                          <RadioGroup {...field}>
                            <HStack spacing={6}>
                              <Radio
                                value="all"
                                sx={{
                                  "&[data-checked]": {
                                    borderColor: "#243b66",
                                    bg: "#243b66",
                                  },
                                  "&[data-checked]::before": {
                                    bg: "white",
                                  },
                                }}
                              >
                                <Text fontFamily="poppins">All employees</Text>
                              </Radio>
                              <Radio
                                value="location"
                                isDisabled={type === "Public Holiday"}
                                sx={{
                                  "&[data-checked]": {
                                    borderColor: "#243b66",
                                    bg: "#243b66",
                                  },
                                  "&[data-checked]::before": {
                                    bg: "white",
                                  },
                                }}
                              >
                                <Text fontFamily="poppins">By location</Text>
                              </Radio>
                              <Radio
                                value="department"
                                isDisabled={type === "Public Holiday"}
                                sx={{
                                  "&[data-checked]": {
                                    borderColor: "#243b66",
                                    bg: "#243b66",
                                  },
                                  "&[data-checked]::before": {
                                    bg: "white",
                                  },
                                }}
                              >
                                <Text fontFamily="poppins">By department</Text>
                              </Radio>
                            </HStack>
                          </RadioGroup>

                          {type === "Public Holiday" && (
                            <Text
                              fontSize="xs"
                              color="gray.500"
                              mt={2}
                              fontFamily={"poppins"}
                            >
                              Public holidays apply to all employees only.
                            </Text>
                          )}
                        </>
                      )}
                    />

                    <FormErrorMessage fontFamily={"poppins"}>
                      {errors.applicable?.message}
                    </FormErrorMessage>
                  </FormControl>
                </Box> */}

                {/* Applicable to */}
                {/* Applicable to */}
                <Box>
                  <FormControl isInvalid={!!errors.applicable} isRequired>
                    <FormLabel fontFamily="poppins">Applicable to</FormLabel>

                    <Controller
                      control={control}
                      name="applicable"
                      rules={{
                        validate: (value) =>
                          (Array.isArray(value) && value.length > 0) ||
                          "Please select who this holiday applies to",
                      }}
                      render={({ field: { value = [], onChange } }) => {
                        const selected = Array.isArray(value) ? value : [];

                        // const handleAll = () => {
                        //   onChange(selected.includes("all") ? [] : ["all"]);
                        //   setValue("locations", []);
                        //   setValue("departments", []);
                        // };

                        const handleAll = () => {
                          if (type === "Public Holiday") return;

                          onChange(selected.includes("all") ? [] : ["all"]);
                          setValue("locations", []);
                          setValue("departments", []);
                        };

                        const handleCheckbox = (option) => {
                          const current = selected.filter(
                            (item) => item !== "all",
                          );

                          const updated = current.includes(option)
                            ? current.filter((item) => item !== option)
                            : [...current, option];

                          if (
                            option === "location" &&
                            current.includes(option)
                          ) {
                            setValue("locations", []);
                          }

                          if (
                            option === "department" &&
                            current.includes(option)
                          ) {
                            setValue("departments", []);
                          }

                          // onChange(updated.length ? updated : ["all"]);
                          onChange(updated);
                        };

                        return (
                          <>
                            <HStack spacing={6} flexWrap="wrap">
                              {/* <Radio
                                isChecked={selected.includes("all")}
                                onChange={handleAll}
                                colorScheme="blue"
                              >
                                <Text fontFamily="poppins">All employees</Text>
                              </Radio> */}
                              <Checkbox
                                isChecked={selected.includes("all")}
                                onChange={handleAll}
                                // isDisabled={type === "Public Holiday"}
                                colorScheme="blue"
                              >
                                All employees
                              </Checkbox>

                              <Checkbox
                                isChecked={selected.includes("location")}
                                // isDisabled={type === "Public Holiday"}
                                isDisabled={
                                  type === "Public Holiday" ||
                                  selected.includes("all")
                                }
                                onChange={() => handleCheckbox("location")}
                                colorScheme="blue"
                              >
                                <Text fontFamily="poppins">By location</Text>
                              </Checkbox>

                              <Checkbox
                                isChecked={selected.includes("department")}
                                isDisabled={
                                  type === "Public Holiday" ||
                                  selected.includes("all")
                                }
                                // isDisabled={type === "Public Holiday"}
                                onChange={() => handleCheckbox("department")}
                                colorScheme="blue"
                              >
                                <Text fontFamily="poppins">By department</Text>
                              </Checkbox>
                            </HStack>

                            {type === "Public Holiday" && (
                              <Text
                                fontSize="xs"
                                color="gray.500"
                                mt={2}
                                fontFamily="poppins"
                              >
                                Public holidays apply to all employees only.
                              </Text>
                            )}
                          </>
                        );
                      }}
                    />

                    <FormErrorMessage fontFamily="poppins">
                      {errors.applicable?.message}
                    </FormErrorMessage>
                  </FormControl>
                </Box>

                {/* {applicable === "location" &&  */}

                {applicable?.includes("location") && (
                  <Box
                    mt={3}
                    p={3}
                    border="1px solid #e6e6e6"
                    borderRadius="md"
                    maxW="260px"
                  >
                    <Controller
                      control={control}
                      name="locations"
                      render={({ field: { value, onChange } }) => {
                        const toggle = (loc) => {
                          const exists =
                            Array.isArray(value) && value.includes(loc);
                          if (exists) onChange(value.filter((v) => v !== loc));
                          else onChange([...(value || []), loc]);
                        };
                        return (
                          <VStack align="start">
                            {/* {applicable === "location" &&  */}
                            {applicable?.includes("location") && (
                              <Box>
                                <Text
                                  fontSize="sm"
                                  fontWeight="600"
                                  mb={2}
                                  fontFamily={"poppins"}
                                >
                                  Locations
                                </Text>

                                {loadingLocations ? (
                                  <Text
                                    fontSize="sm"
                                    color="gray.500"
                                    fontFamily={"poppins"}
                                  >
                                    Loading locations...
                                  </Text>
                                ) : (
                                  <Controller
                                    control={control}
                                    name="locations"
                                    render={({
                                      field: { value, onChange },
                                    }) => {
                                      const toggle = (loc) => {
                                        const exists =
                                          Array.isArray(value) &&
                                          value.includes(loc);
                                        if (exists)
                                          onChange(
                                            value.filter((v) => v !== loc),
                                          );
                                        else onChange([...(value || []), loc]);
                                      };

                                      return (
                                        <VStack align="start">
                                          {locations.map((loc) => (
                                            <Checkbox
                                              key={loc._id}
                                              isChecked={
                                                Array.isArray(value) &&
                                                value.includes(loc._id)
                                              }
                                              onChange={() => toggle(loc._id)}
                                              fontFamily={"poppins"}
                                            >
                                              {loc.location_name}
                                            </Checkbox>
                                          ))}
                                        </VStack>
                                      );
                                    }}
                                  />
                                )}
                              </Box>
                            )}
                          </VStack>
                        );
                      }}
                    />
                  </Box>
                )}

                {/* Departments checkbox list */}
                {/* {applicable === "department" &&  */}
                {applicable?.includes("department") && (
                  <Box
                    mt={3}
                    p={3}
                    border="1px solid #e6e6e6"
                    borderRadius="md"
                    maxW="260px"
                  >
                    <Text
                      fontSize="sm"
                      fontWeight="600"
                      mb={2}
                      fontFamily={"poppins"}
                    >
                      Departments
                    </Text>

                    {loadingDepartments ? (
                      <Text
                        fontSize="sm"
                        color="gray.500"
                        fontFamily={"poppins"}
                      >
                        Loading departments...
                      </Text>
                    ) : (
                      <Controller
                        control={control}
                        name="departments"
                        render={({ field: { value, onChange } }) => {
                          const toggle = (dept) => {
                            const exists =
                              Array.isArray(value) && value.includes(dept);
                            if (exists)
                              onChange(value.filter((v) => v !== dept));
                            else onChange([...(value || []), dept]);
                          };

                          return (
                            <VStack align="start">
                              {departments.map((dept) => (
                                <Checkbox
                                  key={dept._id}
                                  isChecked={
                                    Array.isArray(value) &&
                                    value.includes(dept._id)
                                  }
                                  onChange={() => toggle(dept._id)}
                                  fontFamily={"poppins"}
                                >
                                  {dept.department_name}
                                </Checkbox>
                              ))}
                            </VStack>
                          );
                        }}
                      />
                    )}
                  </Box>
                )}

                {/* Notes */}
                <FormControl>
                  <FormLabel fontFamily={"poppins"}>
                    Notes/Description
                  </FormLabel>
                  <Textarea
                    placeholder="Notes"
                    {...register("notes")}
                    {...inputStyle}
                  />
                </FormControl>
              </Stack>
            </ModalBody>

            <ModalFooter>
              <Button
                variant="ghost"
                mr={3}
                onClick={() => {
                  onClose();
                  reset();
                }}
                fontFamily={"poppins"}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                isLoading={isSubmitting}
                bg="#274167"
                color="white"
                borderRadius="md"
                _hover={{ bg: "#1f3143" }}
                fontFamily={"poppins"}
                fontWeight={"500"}
              >
                Proceed
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* ================= EDIT HOLIDAY MODAL ================= */}
      <EditHolidayModal
        isOpen={isEditOpen}
        onClose={() => {
          onEditClose();
          setSelectedHoliday(null);
        }}
        holiday={selectedHoliday}
        onUpdated={fetchHolidays}
      />

      {/* ================= DELETE CONFIRMATION ================= */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontWeight="600" fontFamily={"poppins"}>
              Delete Holiday
            </AlertDialogHeader>

            <AlertDialogBody fontFamily={"poppins"}>
              Are you sure you want to delete this holiday?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={onDeleteClose}
                fontFamily={"poppins"}
              >
                Cancel
              </Button>
              <Button
                colorScheme="red"
                ml={3}
                onClick={handleConfirmDelete}
                isLoading={deleting}
                fontFamily={"poppins"}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
