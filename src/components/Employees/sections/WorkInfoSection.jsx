import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Collapse,
  Divider,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  IconButton,
  Input,
  Select,
  SimpleGrid,
  Spinner,
  Switch,
  Text,
  useToast,
} from "@chakra-ui/react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  EditIcon,
  CloseIcon,
  SearchIcon,
} from "@chakra-ui/icons";
import { useFormContext, Controller } from "react-hook-form";
import {
  updateEmployee,
  updateWorkInformation,
  updateWorkInformationPut,
} from "../../../api/employee";
import api from "../../../api/axios";
import { getOrgCode, getOrgIdFromReduxOrStorage } from "../../../utils/token";
import { DatePicker } from "../../../layouts/DatePicker";
import { useSelector } from "react-redux";

function EmployeeSearchField({
  label,
  value,
  onChange,
  multiple = false,
  isDisabled = false,
  inputStyle,
}) {
  const [search, setSearch] = useState("");
  const [employees, setEmployees] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const requestId = useRef(0);

  useEffect(() => {
    const query = search.trim();
    const currentRequest = ++requestId.current;

    if (query.length < 3 || isDisabled) {
      setEmployees([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);

      try {
        const res = await api.get("/employee/get_employees_list", {
          params: {
            org_id: getOrgCode(),
            search: query,
            offset: 0,
            limit: 20,
          },
        });

        if (currentRequest !== requestId.current) return;

        const list = res?.data?.data || [];

        setEmployees(Array.isArray(list) ? list : []);
        setShowDropdown(true);
      } catch (error) {
        if (currentRequest === requestId.current) {
          console.error("Employee search failed", error);
          setEmployees([]);
        }
      } finally {
        if (currentRequest === requestId.current) {
          setLoading(false);
        }
      }
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [search, isDisabled]);

  const selected = multiple ? value || [] : value;

  const getEmployeeId = (emp) =>
    emp.employee_id || emp.emp_code || emp.employee_code || "";

  const getEmployeeName = (emp) =>
    emp.full_name ||
    emp.employee_name ||
    emp.name ||
    [emp.first_name, emp.middle_name, emp.last_name]
      .filter(Boolean)
      .join(" ") ||
    getEmployeeId(emp);

  const handleSelect = (emp) => {
    const employee_id = getEmployeeId(emp);

    if (!employee_id) return;

    const selectedEmployee = {
      employee_id,
      name: getEmployeeName(emp),
    };

    if (multiple) {
      if (selected.some((item) => item.employee_id === employee_id)) {
        return;
      }

      onChange([...selected, selectedEmployee]);
    } else {
      onChange(selectedEmployee);
    }

    setSearch("");
    setEmployees([]);
    setShowDropdown(false);
  };

  const removeEmployee = (employeeId) => {
    onChange(selected.filter((item) => item.employee_id !== employeeId));
  };

  // return (
  //   <FormControl>
  //     <FormLabel fontFamily="Poppins" fontSize="14px" fontWeight="500">
  //       {label}
  //     </FormLabel>

  //     <Box position="relative">
  //       {!multiple && selected ? (
  //         <Flex
  //           align="center"
  //           justify="space-between"
  //           border="1.5px solid #D0D5DD"
  //           borderRadius="8px"
  //           h="55px"
  //           px={3}
  //         >
  //           <Text fontSize="14px">
  //             {selected.name} ({selected.employee_id})
  //           </Text>

  //           {!isDisabled && (
  //             <IconButton
  //               aria-label="Remove employee"
  //               icon={<CloseIcon />}
  //               size="xs"
  //               variant="ghost"
  //               onClick={() => onChange(null)}
  //             />
  //           )}
  //         </Flex>
  //       ) : (
  //         <Input
  //           value={search}
  //           onChange={(e) => {
  //             setSearch(e.target.value);
  //             setShowDropdown(true);
  //           }}
  //           onFocus={() => {
  //             if (employees.length) {
  //               setShowDropdown(true);
  //             }
  //           }}
  //           onBlur={() => {
  //             setTimeout(() => {
  //               setShowDropdown(false);
  //             }, 150);
  //           }}
  //           placeholder={`Search ${label}`}
  //           isDisabled={isDisabled}
  //           {...inputStyle}
  //         />
  //       )}

  //       {multiple && selected.length > 0 && (
  //         <Flex wrap="wrap" gap={2} mt={2}>
  //           {selected.map((emp) => (
  //             <Flex
  //               key={emp.employee_id}
  //               align="center"
  //               gap={2}
  //               px={3}
  //               py={1}
  //               bg="gray.100"
  //               borderRadius="full"
  //             >
  //               <Text fontSize="12px">
  //                 {emp.name} ({emp.employee_id})
  //               </Text>

  //               {!isDisabled && (
  //                 <CloseIcon
  //                   boxSize={2}
  //                   cursor="pointer"
  //                   onClick={() => removeEmployee(emp.employee_id)}
  //                 />
  //               )}
  //             </Flex>
  //           ))}
  //         </Flex>
  //       )}

  //       {showDropdown && search.trim().length >= 3 && !isDisabled && (
  //         <Box
  //           position="absolute"
  //           top="100%"
  //           left={0}
  //           right={0}
  //           mt={1}
  //           bg="white"
  //           border="1px solid #D0D5DD"
  //           borderRadius="8px"
  //           boxShadow="md"
  //           maxH="200px"
  //           overflowY="auto"
  //           zIndex={20}
  //         >
  //           {loading ? (
  //             <Text p={3} fontSize="sm">
  //               Searching...
  //             </Text>
  //           ) : employees.length === 0 ? (
  //             <Text p={3} fontSize="sm">
  //               No employee found
  //             </Text>
  //           ) : (
  //             employees.map((emp) => {
  //               const id = getEmployeeId(emp);

  //               return (
  //                 <Box
  //                   key={id}
  //                   px={3}
  //                   py={2}
  //                   cursor="pointer"
  //                   _hover={{ bg: "gray.100" }}
  //                   onMouseDown={(e) => {
  //                     e.preventDefault();
  //                     handleSelect(emp);
  //                   }}
  //                 >
  //                   <Text fontSize="14px">{getEmployeeName(emp)}</Text>

  //                   <Text fontSize="12px" color="gray.500">
  //                     {id}
  //                   </Text>
  //                 </Box>
  //               );
  //             })
  //           )}
  //         </Box>
  //       )}
  //     </Box>
  //   </FormControl>
  // );

  return (
  <FormControl>
    <FormLabel
      fontFamily="Poppins"
      fontSize="14px"
      fontWeight="500"
    >
      {label}
    </FormLabel>

    <Box position="relative">
      {!multiple && selected ? (
        <Flex
          align="center"
          justify="space-between"
          border="1.5px solid #D0D5DD"
          borderRadius="8px"
          h="55px"
          px={3}
        >
          <Text fontSize="14px">
            {selected.name} 
            {/* ({selected.employee_id}) */}
          </Text>

          {!isDisabled && (
            <IconButton
              aria-label="Remove employee"
              icon={<CloseIcon />}
              size="xs"
              variant="ghost"
              onClick={() => onChange(null)}
            />
          )}
        </Flex>
      ) : (
        <Flex
          align="center"
          flexWrap="wrap"
          gap={2}
          minH="55px"
          px={3}
          py={2}
          border="1.5px solid #D0D5DD"
          borderRadius="8px"
          bg={isDisabled ? "gray.50" : "white"}
          _focusWithin={{
            borderColor: "#3182CE",
          }}
        >
          {multiple &&
            selected.map((emp) => (
              <Flex
                key={emp.employee_id}
                align="center"
                gap={2}
                px={3}
                py={1}
                bg="gray.100"
                borderRadius="full"
                maxW="100%"
              >
                <Text
                  fontSize="12px"
                  overflow="hidden"
                  textOverflow="ellipsis"
                  whiteSpace="nowrap"
                >
                  {emp.name} 
                  {/* ({emp.employee_id}) */}
                </Text>

                {!isDisabled && (
                  <CloseIcon
                    boxSize={2}
                    flexShrink={0}
                    cursor="pointer"
                    onClick={() =>
                      removeEmployee(emp.employee_id)
                    }
                  />
                )}
              </Flex>
            ))}

          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => {
              if (employees.length) {
                setShowDropdown(true);
              }
            }}
            onBlur={() => {
              setTimeout(() => {
                setShowDropdown(false);
              }, 150);
            }}
            placeholder={
              multiple && selected.length > 0
                ? "Search more..."
                : `Search ${label}`
            }
            isDisabled={isDisabled}
            flex="1"
            minW="140px"
            h="35px"
            border="none"
            boxShadow="none"
            _focus={{
              boxShadow: "none",
              border: "none",
            }}
            _focusVisible={{
              boxShadow: "none",
              border: "none",
            }}
            fontFamily={inputStyle?.fontFamily}
            fontSize={inputStyle?.fontSize}
            _placeholder={inputStyle?._placeholder}
          />
        </Flex>
      )}

      {showDropdown &&
        search.trim().length >= 3 &&
        !isDisabled && (
          <Box
            position="absolute"
            top="100%"
            left={0}
            right={0}
            mt={1}
            bg="white"
            border="1px solid #D0D5DD"
            borderRadius="8px"
            boxShadow="md"
            maxH="200px"
            overflowY="auto"
            zIndex={20}
          >
            {loading ? (
              <Text p={3} fontSize="sm">
                Searching...
              </Text>
            ) : employees.length === 0 ? (
              <Text p={3} fontSize="sm">
                No employee found
              </Text>
            ) : (
              employees.map((emp) => {
                const id = getEmployeeId(emp);

                return (
                  <Box
                    key={id}
                    px={3}
                    py={2}
                    cursor="pointer"
                    _hover={{ bg: "gray.100" }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(emp);
                    }}
                  >
                    <Text fontSize="14px">
                      {getEmployeeName(emp)}
                    </Text>

                    <Text
                      fontSize="12px"
                      color="gray.500"
                    >
                      {/* {id} */}
                       Employee ID: {emp.employee_code || ""}
                    </Text>
                  </Box>
                );
              })
            )}
          </Box>
        )}
    </Box>
  </FormControl>
);

}

export default function WorkInfoSection({
  isViewMode = false,
  isEditing = true,
  setIsEditing = () => {},
}) {
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useFormContext();
  const [open, setOpen] = useState("workDetails");
  // const [noReport, setNoReport] = useState(false);
  const [reportingData, setReportingData] = useState({
    reporting_manager: null,
    hr: null,
    additional_reporting_manager: [],
    additonal_hr: [],
  });

  const [reportingExists, setReportingExists] = useState(false);
  const [reportingLoading, setReportingLoading] = useState(false);
  const [reportingSaving, setReportingSaving] = useState(false);
  const toast = useToast();
  const methods2 = useFormContext();
  const { getValues, setValue, control } = methods2;

  // determine whether inputs should be disabled
  const viewDisabled = isViewMode && !isEditing;

  const reportingEmployeeId =
    getValues("employee_emp_code") ||
    (typeof window !== "undefined"
      ? localStorage.getItem("employee_emp_code")
      : "") ||
    "";

  const probationStart = watch("probation_start_date");
  const probationEnd = watch("probation_end_date");
  const dateOfBirth = watch("dob");

  const minimumProbationStartDate = dateOfBirth
    ? new Date(
        new Date(dateOfBirth).setFullYear(
          new Date(dateOfBirth).getFullYear() + 18,
        ),
      )
    : null;

  const probationStartDateObj = probationStart
    ? new Date(probationStart)
    : null;
  const probationEndDateObj = probationEnd ? new Date(probationEnd) : null;

  const dateOfBirthObj = dateOfBirth ? new Date(dateOfBirth) : null;

  // org lists for dropdowns
  const [departmentsOptions, setDepartmentsOptions] = useState([]);
  const [bandsOptions, setBandsOptions] = useState([]);
  const [divisionsOptions, setDivisionsOptions] = useState([]);
  const [designationsOptions, setDesignationsOptions] = useState([]);
  const [locationsOptions, setLocationsOptions] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [bandsLoading, setBandsLoading] = useState(false);
  const [divisionsLoading, setDivisionsLoading] = useState(false);
  const [designationsLoading, setDesignationsLoading] = useState(false);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const { user, token, loading } = useSelector((state) => state.auth);
  const [shifts, setShifts] = useState([]);
  const [selectedShift, setSelectedShift] = useState("");
  // const [shiftAlreadyAdded, setShiftAlreadyAdded] = useState(false);
  const shiftAlreadyAdded = watch("has_existing_default_shift") === true;
  const shiftChangedByUser = useRef(false);

  // const currentShiftId = watch("shift_id");

  // useEffect(() => {
  //   if (!shiftChangedByUser.current && currentShiftId) {
  //     setShiftAlreadyAdded(true);
  //   }
  // }, [currentShiftId]);

  const [isSaving, setIsSaving] = useState(false);

  // shared styling for inputs/selects to match other employee forms
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

  // normalize various possible API response shapes into an array
  const normalizeArrayResponse = (res) => {
    const d = res?.data;
    if (!d) return [];
    if (Array.isArray(d)) return d;
    if (Array.isArray(d.departments)) return d.departments;
    if (Array.isArray(d.divisions)) return d.divisions;
    if (Array.isArray(d.bands)) return d.bands;
    if (Array.isArray(d.positions)) return d.positions;
    if (Array.isArray(d.job_titles)) return d.job_titles;
    if (Array.isArray(d.designations)) return d.designations;
    if (Array.isArray(d.locations)) return d.locations;
    if (Array.isArray(d.data)) return d.data;
    return [];
  };

  const handleToggle = (section) => {
    setOpen((prev) => (prev === section ? null : section));
  };

  // helper to choose id and opts
  const resolveEmployeeIdentifier = () => {
    const dbId =
      typeof window !== "undefined"
        ? localStorage.getItem("employee_db_id")
        : null;
    const empCode =
      getValues("employee_emp_code") ||
      (typeof window !== "undefined"
        ? localStorage.getItem("employee_emp_code")
        : null);

    const idToUse = dbId || empCode;
    const opts = dbId ? { by: "id" } : { by: "emp_code" };
    return { idToUse, opts, dbId, empCode };
  };

  const handleSaveWorkDetails = async () => {
    const fields = [
      "employment_type",
      "division_id",
      "department_id",
      "band_id",
      "position_id",
      "location_id",
      "probation_start_date",
      "probation_end_date",
      "employment_status",
      "shift_id",
    ];
    const values = {};
    fields.forEach((f) => {
      values[f] = getValues(f) || "";
    });
    // convert employment_type to number
    if (values.employment_type !== "" && values.employment_type != null) {
      const num = Number(values.employment_type);
      values.employment_type = Number.isNaN(num) ? values.employment_type : num;
    }

    // derive is_active from employment_status if provided
    if (values.employment_status !== "" && values.employment_status != null) {
      values.is_active =
        String(values.employment_status).toLowerCase() === "active";
      // remove employment_status from the object to avoid confusion
      delete values.employment_status;
    }

    const { idToUse, opts, dbId, empCode } = resolveEmployeeIdentifier();
    if (!idToUse) {
      toast({
        title: "Save basic info first",
        description:
          "Please save basic information before saving work details.",
        status: "warning",
        duration: 2500,
      });
      return;
    }

    // include org id in payload when available
    const orgId =
      getOrgCode?.() ||
      (typeof window !== "undefined" && localStorage.getItem("org_code"));

    // common payload
    const shouldCallPut = isViewMode === true && isEditing === true;
    // const payload = {
    //   ...(dbId ? { id: dbId } : {}),
    //   ...(empCode ? { emp_code: empCode } : {}),
    //   ...(orgId ? { org_id: orgId } : {}),
    //   ...values,
    // };
    const payload = {
      ...(dbId ? { id: dbId } : {}),
      ...(empCode ? { emp_code: empCode } : {}),
      ...(orgId ? { org_id: orgId } : {}),
      ...values,
    };

    // if (shouldCallPut) {
    //   delete payload.shift_id;
    // }

    // if (shouldCallPut && shiftAlreadyAdded) {
    //   delete payload.shift_id;
    // }

    if (shiftAlreadyAdded || !payload.shift_id) {
      delete payload.shift_id;
    }

    // If we are viewing an existing employee (view mode) AND currently editing,
    // call the PUT update API. Otherwise fallback to the existing POST add API.
    // const shouldCallPut = isViewMode === true && isEditing === true;

    try {
      if (shouldCallPut) {
        // PUT - update existing record
        await updateWorkInformationPut(payload);
        if (!shiftAlreadyAdded && payload.shift_id) {
          setValue("has_existing_default_shift", true);
        }
        toast({
          title: "Work details updated",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
        // close edit mode like BasicInfoSection
        setIsEditing(false);
      } else {
        // POST - existing behaviour (create/add)
        await updateWorkInformation(payload);
        // if (values.shift_id) {
        //   setShiftAlreadyAdded(true);
        // }
        if (values.shift_id) {
          setValue("has_existing_default_shift", true);
        }

        toast({
          title: "Work details saved",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      }
      // optionally update localStorage copy (if your app uses it elsewhere)
      try {
        const existing =
          typeof window !== "undefined"
            ? localStorage.getItem("employee_work_information")
            : null;
        if (existing) {
          const parsed = JSON.parse(existing);
          // Merge and store; note we store is_active (boolean) here
          const merged = { ...parsed, ...values };
          localStorage.setItem(
            "employee_work_information",
            JSON.stringify(merged),
          );
        }
      } catch (e) {
        // ignore
      }

      return true;
    } catch (err) {
      console.error("Save work details failed", err);
      toast({
        title: "Save failed",
        description:
          err?.response?.data?.message ||
          err?.message ||
          "Unable to save work details",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }
  };

  // Fetch departments, bands and locations from org endpoints on mount
  useEffect(() => {
    let mounted = true;
    const fetchLists = async () => {
      const orgId =
        getOrgCode?.() ||
        (typeof window !== "undefined" && localStorage.getItem("org_code"));
      if (!orgId) return;
      setDepartmentsLoading(true);
      setBandsLoading(true);
      setLocationsLoading(true);
      try {
        const [rDeps, rBands, rLocs, rDesigns, rDivs] = await Promise.all([
          api.get(`/organization/get_departments/${orgId}`),
          api.get(`/organization/get_bands/${orgId}`),
          api.get(`/organization/get_locations/${orgId}`),
          api.get(`/organization/get_org_job_titles/${orgId}`),
          api.get(`/organization/get_org_divisions/${orgId}`),
        ]);

        if (!mounted) return;

        const deps = normalizeArrayResponse(rDeps);
        const bands = normalizeArrayResponse(rBands);
        const locs = normalizeArrayResponse(rLocs);
        const designs = normalizeArrayResponse(rDesigns);
        const divs = normalizeArrayResponse(rDivs);

        setDepartmentsOptions(deps);
        setBandsOptions(bands);
        setLocationsOptions(locs);
        setDesignationsOptions(designs);
        setDivisionsOptions(divs);
      } catch (err) {
        console.error("Failed to load workinfo lists", err);
        try {
          toast({
            title: "Could not load work lists",
            status: "warning",
            duration: 2500,
            isClosable: true,
          });
        } catch (e) {}
      } finally {
        setDepartmentsLoading(false);
        setBandsLoading(false);
        setDesignationsLoading(false);
        setLocationsLoading(false);
        setDivisionsLoading(false);
      }
    };

    fetchLists();
    return () => {
      mounted = false;
    };
  }, []);

  // When option lists load, map any preloaded name values into their corresponding *_id fields
  useEffect(() => {
    try {
      // Department
      const currentDeptId = getValues("department_id");
      const currentDeptName = getValues("department_name");
      if (
        (!currentDeptId || currentDeptId === "") &&
        currentDeptName &&
        departmentsOptions.length
      ) {
        const found = departmentsOptions.find((d) => {
          const raw =
            d.department_name || d.name || d.department || d.description || d;
          const label =
            typeof raw === "object" ? JSON.stringify(raw) : String(raw || "");
          return (
            String(label).toLowerCase() ===
              String(currentDeptName).toLowerCase() ||
            (d._id && d._id === currentDeptName) ||
            (d.id && d.id === currentDeptName)
          );
        });
        if (found)
          setValue("department_id", found._id || found.id || String(found));
      }

      // Band
      const currentBandId = getValues("band_id");
      const currentBandName = getValues("band_name");
      if (
        (!currentBandId || currentBandId === "") &&
        currentBandName &&
        bandsOptions.length
      ) {
        const found = bandsOptions.find((b) => {
          const raw = b.band_name || b.name || b.title || b.description || b;
          const label =
            typeof raw === "object" ? JSON.stringify(raw) : String(raw || "");
          return (
            String(label).toLowerCase() ===
              String(currentBandName).toLowerCase() ||
            (b._1d && b._id === currentBandName) ||
            (b.id && b.id === currentBandName)
          );
        });
        if (found) setValue("band_id", found._id || found.id || String(found));
      }

      // Designation / Position
      const currentPosId = getValues("position_id");
      const currentPosName = getValues("position_name");
      if (
        (!currentPosId || currentPosId === "") &&
        currentPosName &&
        designationsOptions.length
      ) {
        const found = designationsOptions.find((d) => {
          const raw = d.position_name || d.name || d.job_title || d.title || d;
          const label =
            typeof raw === "object" ? JSON.stringify(raw) : String(raw || "");
          return (
            String(label).toLowerCase() ===
              String(currentPosName).toLowerCase() ||
            (d._id && d._id === currentPosName) ||
            (d.id && d.id === currentPosName)
          );
        });
        if (found)
          setValue("position_id", found._id || found.id || String(found));
      }

      // Division
      const currentDivId = getValues("division_id");
      const currentDivName = getValues("division_name");

      if (
        (!currentDivId || currentDivId === "") &&
        currentDivName &&
        divisionsOptions.length
      ) {
        const found = divisionsOptions.find((d) => {
          const raw = d.division_name || d.name || d.description || d;
          return (
            String(raw).toLowerCase().trim() ===
            String(currentDivName).toLowerCase().trim()
          );
        });

        if (found) {
          setValue("division_id", found._id || found.id);
        }
      }

      // Location
      const currentLocId = getValues("location_id");
      const currentLocName = getValues("location_name");
      if (
        (!currentLocId || currentLocId === "") &&
        currentLocName &&
        locationsOptions.length
      ) {
        const found = locationsOptions.find((l) => {
          const raw =
            l.location_name ||
            l.branch_name ||
            l.name ||
            (l.city ? `${l.city}${l.state ? ", " + l.state : ""}` : "") ||
            l.postal_code ||
            l;
          const label =
            typeof raw === "object" ? JSON.stringify(raw) : String(raw || "");
          return (
            String(label).toLowerCase() ===
              String(currentLocName).toLowerCase() ||
            (l._id && l._id === currentLocName) ||
            (l.id && l.id === currentLocName)
          );
        });
        if (found)
          setValue("location_id", found._id || found.id || String(found));
      }

      // Employment status: if form has employment_status undefined but we have is_active in stored values,
      // map it so UI shows correct value
      const currentEmploymentStatus = getValues("employment_status");
      const currentIsActive = getValues("is_active");
      if (
        (currentEmploymentStatus === undefined ||
          currentEmploymentStatus === "") &&
        currentIsActive !== undefined &&
        currentIsActive !== ""
      ) {
        // map boolean is_active -> employment_status select
        try {
          setValue(
            "employment_status",
            currentIsActive ? "active" : "inactive",
          );
        } catch (e) {}
      }
    } catch (e) {
      // non-fatal
      // eslint-disable-next-line no-console
      console.warn("Failed to map work option names to ids", e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    departmentsOptions,
    bandsOptions,
    designationsOptions,
    locationsOptions,
    divisionsOptions,
  ]);

  useEffect(() => {
    fetchShiftList();
  }, []);

  const fetchShiftList = async () => {
    try {
      const orgId = getOrgIdFromReduxOrStorage(user);
      const url = `/settings/get_company_shift_list?org_id=${orgId}`;
      const res = await api.get(url);
      // ✅ FIXED HERE
      setShifts(res.data?.list || []);
    } catch (error) {
      console.error("Error fetching shifts", error);
      toast({
        title: "Failed to fetch shifts",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // After shifts load, map any stored work.shift (name) to the shift_id option
  useEffect(() => {
    try {
      if (!shifts || !shifts.length) return;
      const stored =
        typeof window !== "undefined"
          ? localStorage.getItem("employee_work")
          : null;
      const work = stored ? JSON.parse(stored) : null;
      if (!work) return;

      // map is_active -> employment_status if present
      if (work.is_active !== undefined && work.is_active !== null) {
        setValue("employment_status", work.is_active ? "active" : "inactive");
      }

      // map shift name -> shift_id (match case-insensitive on shift_name)
      if (work.shift) {
        const found = shifts.find(
          (s) =>
            String(s.shift_name || "").toLowerCase() ===
            String(work.shift).toLowerCase(),
        );

        // if (found) {
        //   const savedShiftId = found._id || found.id || found.shift_name;

        //   setValue("shift_id", savedShiftId);
        //   setSelectedShift(savedShiftId);

        //   if (isViewMode) {
        //     setShiftAlreadyAdded(true);
        //   }
        // }
        if (found) {
          const savedShiftId = found._id || found.id || found.shift_name;

          setValue("shift_id", savedShiftId);
          setSelectedShift(savedShiftId);
        }
      }
    } catch (e) {
      console.warn("Failed to map stored work shift/status", e);
    }
  }, [shifts, setValue]);

  // Save Reporting To

  useEffect(() => {
    if (!reportingEmployeeId) return;

    let cancelled = false;

    const fetchReporting = async () => {
      setReportingLoading(true);

      try {
        const res = await api.get("/employee/get_reporting_to", {
          params: {
            employee_id: reportingEmployeeId,
          },
        });

        if (cancelled) return;

        const data = res?.data?.result;

        setReportingData({
          reporting_manager: data?.reporting_manager || null,
          hr: data?.hr || null,
          additional_reporting_manager:
            data?.additional_reporting_manager || [],
          additonal_hr: data?.additonal_hr || [],
        });

        setReportingExists(true);
      } catch (error) {
        if (cancelled) return;

        if (error?.response?.status === 404) {
          setReportingExists(false);

          setReportingData({
            reporting_manager: null,
            hr: null,
            additional_reporting_manager: [],
            additonal_hr: [],
          });
        } else {
          console.error("Failed to fetch reporting assignments", error);

          toast({
            title: "Failed to load reporting information",
            description:
              error?.response?.data?.msg ||
              error?.response?.data?.message ||
              "Something went wrong",
            status: "error",
            duration: 3000,
          });
        }
      } finally {
        if (!cancelled) {
          setReportingLoading(false);
        }
      }
    };

    fetchReporting();

    return () => {
      cancelled = true;
    };
  }, [reportingEmployeeId, toast]);

  const handleSaveReportingTo = async () => {
    if (!reportingEmployeeId) {
      toast({
        title: "Save basic info first",
        description:
          "Employee code is required before saving reporting information.",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    const payload = {
      reporting_manager: reportingData.reporting_manager
        ? {
            employee_id: reportingData.reporting_manager.employee_id,
          }
        : null,

      hr: reportingData.hr
        ? {
            employee_id: reportingData.hr.employee_id,
          }
        : null,

      additional_reporting_manager:
        reportingData.additional_reporting_manager.map((emp) => ({
          employee_id: emp.employee_id,
        })),

      additonal_hr: reportingData.additonal_hr.map((emp) => ({
        employee_id: emp.employee_id,
      })),
    };

    const hasContact =
      payload.reporting_manager ||
      payload.hr ||
      payload.additional_reporting_manager.length > 0 ||
      payload.additonal_hr.length > 0;

    if (!hasContact) {
      toast({
        title: "Select at least one contact",
        description: "Add a reporting manager or HR contact before saving.",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    const selectedIds = [
      payload.reporting_manager?.employee_id,
      payload.hr?.employee_id,
      ...payload.additional_reporting_manager.map((emp) => emp.employee_id),
      ...payload.additonal_hr.map((emp) => emp.employee_id),
    ].filter(Boolean);

    if (selectedIds.includes(reportingEmployeeId)) {
      toast({
        title: "Invalid reporting assignment",
        description: "An employee cannot report to themselves.",
        status: "error",
        duration: 3000,
      });
      return;
    }

    setReportingSaving(true);

    try {
      if (reportingExists) {
        await api.put(
          `/employee/update_reporting_to/${encodeURIComponent(
            reportingEmployeeId,
          )}`,
          payload,
        );
      } else {
        await api.post("/employee/add_reporting_to", {
          employee_id: reportingEmployeeId,
          ...payload,
        });
      }

      setReportingExists(true);

      toast({
        title: "Reporting information saved successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Failed to save reporting information", error);

      toast({
        title: "Failed to save reporting information",
        description:
          error?.response?.data?.msg ||
          error?.response?.data?.message ||
          error?.message ||
          "Something went wrong",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setReportingSaving(false);
    }
  };

  // const handleSaveReportingTo = () => {
  //   const values = {
  //     reportingManager: getValues("reportingManager") || "",
  //     additionalReportingManagers:
  //       getValues("additionalReportingManagers") || "",
  //     hr: getValues("hr") || "",
  //     additionalHr: getValues("additionalHr") || "",
  //     noReport: !!noReport,
  //   };

  //   const { idToUse, opts } = resolveEmployeeIdentifier();
  //   if (!idToUse) {
  //     toast({
  //       title: "Save basic info first",
  //       description:
  //         "Please save basic information before saving reporting info.",
  //       status: "warning",
  //       duration: 2500,
  //     });
  //     return;
  //   }

  //   updateEmployee(idToUse, { reporting_information: values }, opts)
  //     .then(() => {
  //       toast({
  //         title: "Reporting information saved",
  //         status: "success",
  //         duration: 2000,
  //         isClosable: true,
  //       });
  //     })
  //     .catch((err) => {
  //       console.error("Save reporting info failed", err);
  //       toast({
  //         title: "Save failed",
  //         description: err?.message || "Unable to save reporting information",
  //         status: "error",
  //         duration: 3000,
  //         isClosable: true,
  //       });
  //     });
  // };

  // Save Probation details
  // const handleSaveProbation = () => {
  //   const values = {
  //     probationStartDate: getValues("probationStartDate") || "",
  //     probationEndDate: getValues("probationEndDate") || "",
  //   };

  //   const { idToUse, opts } = resolveEmployeeIdentifier();
  //   if (!idToUse) {
  //     toast({
  //       title: "Save basic info first",
  //       description:
  //         "Please save basic information before saving probation details.",
  //       status: "warning",
  //       duration: 2500,
  //     });
  //     return;
  //   }

  //   updateEmployee(idToUse, { probation_information: values }, opts)
  //     .then(() => {
  //       toast({
  //         title: "Probation details saved",
  //         status: "success",
  //         duration: 2000,
  //         isClosable: true,
  //       });
  //     })
  //     .catch((err) => {
  //       console.error("Save probation failed", err);
  //       toast({
  //         title: "Save failed",
  //         description: err?.message || "Unable to save probation details",
  //         status: "error",
  //         duration: 3000,
  //         isClosable: true,
  //       });
  //     });
  // };

  const onSubmitWorkDetails = async () => {
    setIsSaving(true);
    const ok = await handleSaveWorkDetails();
    setIsSaving(false);

    if (ok && isViewMode) {
      setIsEditing(false);
    }
  };

  const isOpen = open === "workDetails";
  return (
    <Box
      //  height="70vh"
      height={{ base: "50vh", sm: "62vh", md: "60vh", lg: "68Vh" }}
      overflowY="auto"
      // py={2}
      sx={{
        "&::-webkit-scrollbar": {
          width: "0px",
        },
      }}
    >
      {/* Work Details */}
      <Box
        mb={4}
        pl={2}
        pr={2}
        bg="white"
        borderRadius={"14px"}
        borderWidth="1.5px"
        borderColor="#e1e8f0"
        overflow="hidden"
        fontFamily="Poppins, sans-serif"
        p={2}
      >
        <Flex
          align="center"
          justify="space-between"
          py={3}
          px={2}
          borderTopRadius={"10px"}
          bg="#ffffff"
          cursor="pointer"
          onClick={() => handleToggle("workDetails")}
          // conditional dashed border: only show when expanded
          borderBottom={isOpen ? "1px solid transparent" : "none"}
          // sx={
          //   isOpen
          //     ? {
          //       borderImage:
          //         "repeating-linear-gradient(to right, #C7C7C7 0 4px, transparent 3px 9px) 1",
          //     }
          //     : {}
          // }
          sx={
            isOpen
              ? {
                  borderImage:
                    "repeating-linear-gradient(to right, #C7C7C7 0 11px, transparent 11px 20px) 1",
                }
              : {}
          }
        >
          <Flex align="center" gap={3}>
            <Heading
              fontSize="23px"
              fontFamily="Poppins, sans-serif"
              pl={{ base: 0, md: 4 }}
              fontWeight={"600"}
              color={"#000"}
            >
              Work Details
            </Heading>

            {isViewMode && (
              <IconButton
                aria-label="Edit Work Details"
                icon={<EditIcon />}
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
              />
            )}
          </Flex>

          <IconButton
            icon={isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
            size="lg"
            variant="ghost"
            aria-label="Toggle section"
          />
        </Flex>
        <Collapse in={open === "workDetails"} animateOpacity>
          <Box p={{ base: 2, md: 4 }}>
            <SimpleGrid columns={2} spacing={4} mb={4}>
              <FormControl isRequired isInvalid={!!errors.employment_type}>
                <FormLabel
                  fontFamily="Poppins"
                  fontSize="14px"
                  fontWeight="500"
                >
                  Employment type
                </FormLabel>

                <Select
                  {...register("employment_type", {
                    required: "Employment type is required",
                  })}
                  placeholder="Select Employment Type"
                  {...inputStyle}
                  isDisabled={viewDisabled}
                >
                  <option value="1">Full Time</option>
                  <option value="2">Part Time</option>
                  <option value="3">Contractual</option>
                  <option value="4">Intern</option>
                </Select>

                <FormErrorMessage>
                  {errors.employment_type?.message}
                </FormErrorMessage>
              </FormControl>

              {/* Department - select only (sends department_id) */}
              {/* Division - select only (sends division_id) */}
              <FormControl>
                <FormLabel
                  fontFamily="Poppins"
                  fontSize="14px"
                  fontWeight="500"
                >
                  Division
                </FormLabel>

                {/* hidden kept for compatibility if some other code reads division_id via register */}
                <input type="hidden" {...register("division_name")} />

                <Controller
                  name="division_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      placeholder={
                        divisionsLoading ? "Loading..." : "Select Division"
                      }
                      {...inputStyle}
                      isDisabled={divisionsLoading || viewDisabled}
                    >
                      {divisionsOptions.map((d) => {
                        const rawLabel =
                          d.division_name ||
                          d.name ||
                          d.description ||
                          "Unnamed Division";
                        const label = String(rawLabel);
                        const value = d._id || d.id || label;

                        return (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        );
                      })}
                    </Select>
                  )}
                />
              </FormControl>
              <FormControl>
                <FormLabel
                  fontFamily="Poppins"
                  fontSize="14px"
                  fontWeight="500"
                >
                  Department
                </FormLabel>

                {/* hidden kept for compatibility if some other code reads department_id via register */}
                <input type="hidden" {...register("department_id")} />

                <Controller
                  name="department_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      placeholder={
                        departmentsLoading ? "Loading..." : "Select Department"
                      }
                      {...inputStyle}
                      isDisabled={departmentsLoading || viewDisabled}
                    >
                      {departmentsOptions.map((d) => {
                        const rawLabel =
                          d.department_name ||
                          d.name ||
                          d.department ||
                          d.description ||
                          "Unnamed Department";

                        const label = String(rawLabel);
                        const value = d._id || d.id || label;

                        return (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        );
                      })}
                    </Select>
                  )}
                />
              </FormControl>

              {/* Band name - select only (sends band_id) - mandatory */}
              <FormControl isRequired isInvalid={!!errors.band_id}>
                <FormLabel
                  fontFamily="Poppins"
                  fontSize="14px"
                  fontWeight="500"
                >
                  Band name
                </FormLabel>

                <Controller
                  name="band_id"
                  control={control}
                  rules={{ required: "Band is required" }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      placeholder="Select Band"
                      {...inputStyle}
                      isDisabled={viewDisabled}
                    >
                      {bandsOptions.map((b) => (
                        <option key={b._id} value={b._id}>
                          {b.band_name}
                        </option>
                      ))}
                    </Select>
                  )}
                />

                <FormErrorMessage>{errors.band_id?.message}</FormErrorMessage>
              </FormControl>

              {/* Designation - select only (sends position_id as the mongo _id) */}
              <FormControl>
                <FormLabel
                  fontFamily="Poppins"
                  fontSize="14px"
                  fontWeight="500"
                >
                  Designation
                </FormLabel>

                {/* hidden kept for compatibility if some other code reads position_id via register */}
                <input type="hidden" {...register("position_id")} />

                <Controller
                  name="position_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      placeholder={
                        designationsLoading
                          ? "Loading..."
                          : "Select Designation"
                      }
                      {...inputStyle}
                      isDisabled={designationsLoading || viewDisabled}
                    >
                      {designationsOptions.map((d) => {
                        const rawLabel =
                          d.position_name ||
                          d.name ||
                          d.job_title ||
                          d.title ||
                          d;
                        const label = String(rawLabel);
                        const value = d._id || d.id || label;
                        return (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        );
                      })}
                    </Select>
                  )}
                />
              </FormControl>

              {/* Work Location - select only (sends location_id) */}
              <FormControl isRequired isInvalid={!!errors?.location_id}>
                <FormLabel
                  fontFamily="Poppins"
                  fontSize="14px"
                  fontWeight="500"
                >
                  Work Location
                </FormLabel>

                {/* hidden kept for compatibility if some other code reads location_id via register */}
                {/* <input type="hidden" {...register("location_id")} /> */}

                <Controller
                  name="location_id"
                  control={control}
                  rules={{ required: "Work Location is required" }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      placeholder={
                        locationsLoading ? "Loading..." : "Select Location"
                      }
                      {...inputStyle}
                      isDisabled={locationsLoading || viewDisabled}
                    >
                      {locationsOptions.map((l) => {
                        const label =
                          l.location_name ||
                          l.branch_name ||
                          l.name ||
                          (l.city
                            ? `${l.city}${l.state ? ", " + l.state : ""}`
                            : "") ||
                          (l.postal_code ? l.postal_code : "") ||
                          String(l._id || l.id || "");

                        const value = l._id || l.id || label;

                        return (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        );
                      })}
                    </Select>
                  )}
                />
                <FormErrorMessage>
                  {errors?.location_id?.message}
                </FormErrorMessage>
              </FormControl>

              {/* Probation start date */}
              <FormControl isInvalid={!!errors?.probation_start_date} mb={3}>
                <Controller
                  name="probation_start_date"
                  control={control}
                  // rules={{
                  //   validate: {
                  //     notAfterEnd: (value) => {
                  //       if (!value || !probationEnd) return true;
                  //       const start = new Date(value);
                  //       const end = new Date(probationEnd);
                  //       start.setHours(0, 0, 0, 0);
                  //       end.setHours(0, 0, 0, 0);
                  //       return (
                  //         start <= end || "Start date cannot be after end date"
                  //       );
                  //     },
                  //   },
                  // }}
                  rules={{
                    validate: {
                      notBeforeDob: (value) => {
                        if (!value || !dateOfBirth) return true;

                        const start = new Date(value);
                        const dob = new Date(dateOfBirth);

                        start.setHours(0, 0, 0, 0);
                        dob.setHours(0, 0, 0, 0);

                        return (
                          start >= dob ||
                          "Probation start date cannot be before date of birth"
                        );
                      },

                      notAfterEnd: (value) => {
                        if (!value || !probationEnd) return true;

                        const start = new Date(value);
                        const end = new Date(probationEnd);

                        start.setHours(0, 0, 0, 0);
                        end.setHours(0, 0, 0, 0);

                        return (
                          start <= end || "Start date cannot be after end date"
                        );
                      },
                    },
                  }}
                  render={({ field }) => (
                    // <DatePicker
                    //   label="Probation period start date"
                    //   placeholder="dd/mm/yyyy"
                    //   value={field.value}
                    //   onChange={field.onChange}
                    //   maxDate={probationEndDateObj || undefined}
                    //   isDisabled={viewDisabled}
                    //   inputProps={inputStyle}
                    // />
                    <DatePicker
                      label="Probation Start Date / Joining Date"
                      placeholder="dd/mm/yyyy"
                      value={field.value}
                      onChange={field.onChange}
                      minDate={minimumProbationStartDate || undefined}
                      // minDate={dateOfBirthObj || undefined}
                      maxDate={probationEndDateObj || undefined}
                      isDisabled={viewDisabled}
                      inputProps={inputStyle}
                    />
                  )}
                />
                <FormErrorMessage>
                  {errors?.probation_start_date?.message}
                </FormErrorMessage>
              </FormControl>

              {/* Probation end date */}
              <FormControl isInvalid={!!errors?.probation_end_date} mb={3}>
                <Controller
                  name="probation_end_date"
                  control={control}
                  rules={{
                    validate: {
                      notBeforeStart: (value) => {
                        if (!value || !probationStart) return true;
                        const start = new Date(probationStart);
                        const end = new Date(value);
                        start.setHours(0, 0, 0, 0);
                        end.setHours(0, 0, 0, 0);
                        return (
                          end >= start || "End date cannot be before start date"
                        );
                      },
                    },
                  }}
                  render={({ field }) => (
                    <DatePicker
                      label="Probation period end date"
                      placeholder="dd/mm/yyyy"
                      value={field.value}
                      onChange={field.onChange}
                      minDate={probationStartDateObj || undefined}
                      isDisabled={viewDisabled}
                      inputProps={inputStyle}
                    />
                  )}
                />
                <FormErrorMessage>
                  {errors?.probation_end_date?.message}
                </FormErrorMessage>
              </FormControl>

              {/* NEW: Employment Status -> maps to is_active boolean in payload */}
              <FormControl isRequired isInvalid={!!errors.employment_status}>
                <FormLabel
                  fontFamily="Poppins"
                  fontSize="14px"
                  fontWeight="500"
                >
                  Employment Status
                </FormLabel>

                {/* use Controller so we can control disabled properly */}
                <Controller
                  name="employment_status"
                  control={control}
                  rules={{ required: "Employment Status is required" }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      placeholder="Select status"
                      {...inputStyle}
                      isDisabled={viewDisabled}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </Select>
                  )}
                />
                <FormErrorMessage>
                  {errors.employment_status?.message}
                </FormErrorMessage>
              </FormControl>
              {/* <FormControl>
                <FormLabel
                  fontFamily="Poppins"
                  fontSize="14px"
                  fontWeight="500"
                >
                  Shift
                </FormLabel>
                <Controller
                  name="employment_status"
                  control={control}
                  render={({ field }) => (
                    <Select
                        placeholder="Select Shift"
                          {...inputStyle}
                  value={selectedShift}
                  onChange={(e) => setSelectedShift(e.target.value)}
                    >
                     {shifts?.map((shift) => (
                    <option key={shift._id} value={shift._id}>
                      {shift.shift_name}
                    </option>
                  ))}
                    </Select>
                  )}
                />
              </FormControl> */}
              {/* <FormControl>
                <FormLabel
                  fontFamily="Poppins"
                  fontSize="14px"
                  fontWeight="500"
                >
                 Default Shift
                </FormLabel>

                <Controller
                  name="shift_id"
                  control={control}
                  rules={{ required: "Shift is required" }}
                  render={({ field }) => (
                    <Select
                      placeholder="Select Shift"
                      {...inputStyle}
                      value={field.value || ""}
                      onChange={(e) => {
                        shiftChangedByUser.current = true;
                        field.onChange(e.target.value);
                        setSelectedShift(e.target.value);
                      }}
                      isDisabled={viewDisabled || shiftAlreadyAdded}
                    >
                      {shifts?.map((shift) => (
                        <option key={shift._id} value={shift._id}>
                          {shift.shift_name}
                        </option>
                      ))}
                    </Select>
                  )}
                />
              </FormControl> */}
              <FormControl isInvalid={!!errors.shift_id}>
                <FormLabel
                  fontFamily="Poppins"
                  fontSize="14px"
                  fontWeight="500"
                >
                  Default Shift
                </FormLabel>

                <Controller
                  name="shift_id"
                  control={control}
                  // rules={{
                  //   validate: (value) =>
                  //     Boolean(value) || "Default Shift is required",
                  // }}
                  // rules={{
                  //   validate: (value) =>
                  //     shiftAlreadyAdded ||
                  //     Boolean(value) ||
                  //     "Default Shift is required",
                  // }}
                  render={({ field }) => (
                    <Select
                      placeholder="Select Shift"
                      {...inputStyle}
                      value={field.value || ""}
                      onChange={(e) => {
                        shiftChangedByUser.current = true;
                        field.onChange(e.target.value);
                        setSelectedShift(e.target.value);
                      }}
                      isDisabled={viewDisabled || shiftAlreadyAdded}
                    >
                      {shifts?.map((shift) => (
                        <option key={shift._id} value={shift._id}>
                          {shift.shift_name}
                        </option>
                      ))}
                    </Select>
                  )}
                />

                <FormErrorMessage>{errors.shift_id?.message}</FormErrorMessage>
              </FormControl>
            </SimpleGrid>

            <Flex justifyContent="space-between" p={4}>
              <Button
                variant="outline"
                type="button"
                color="#757575"
                border="white"
                fontWeight="500"
                onClick={() => {
                  try {
                    setValue("department_id", "");
                    setValue("division_id", "");
                    setValue("band_id", "");
                    setValue("position_id", "");
                    setValue("location_id", "");
                    setValue("probation_start_date", "");
                    setValue("probation_end_date", "");
                    setValue("employment_type", "");
                    setValue("employment_status", "");
                  } catch (e) {
                    console.error("Failed to clear work details form", e);
                  }
                }}
                isDisabled={viewDisabled || isSaving}
              >
                Clear form
              </Button>

              <Flex gap={3}>
                {isViewMode ? (
                  isEditing ? (
                    <>
                      <Button
                        color="white"
                        backgroundColor="#1A365D"
                        _hover={{ bg: "#153e75" }}
                        type="button"
                        fontWeight="500"
                        isLoading={isSaving}
                        loadingText="Updating"
                        onClick={handleSubmit(onSubmitWorkDetails)}
                        isDisabled={isSaving}
                      >
                        Update
                      </Button>

                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => {
                          try {
                            const raw =
                              typeof window !== "undefined"
                                ? localStorage.getItem(
                                    "employee_work_information",
                                  )
                                : null;
                            if (raw) {
                              const saved = JSON.parse(raw);
                              if (saved.employment_type !== undefined)
                                setValue(
                                  "employment_type",
                                  saved.employment_type,
                                );
                              if (saved.division_id !== undefined)
                                setValue("division_id", saved.division_id);
                              if (saved.department_id !== undefined)
                                setValue("department_id", saved.department_id);
                              if (saved.band_id !== undefined)
                                setValue("band_id", saved.band_id);
                              if (saved.position_id !== undefined)
                                setValue("position_id", saved.position_id);
                              if (saved.location_id !== undefined)
                                setValue("location_id", saved.location_id);
                              if (saved.probation_start_date !== undefined)
                                setValue(
                                  "probation_start_date",
                                  saved.probation_start_date,
                                );
                              if (saved.probation_end_date !== undefined)
                                setValue(
                                  "probation_end_date",
                                  saved.probation_end_date,
                                );
                              // restore employment_status from stored is_active (if available)
                              if (saved.is_active !== undefined)
                                setValue(
                                  "employment_status",
                                  saved.is_active ? "active" : "inactive",
                                );
                            }
                          } catch (e) {
                            console.error(
                              "Failed to restore work details from storage",
                              e,
                            );
                          } finally {
                            setIsEditing(false);
                          }
                        }}
                        isDisabled={isSaving}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : null
                ) : (
                  <Button
                    color="white"
                    backgroundColor="#1A365D"
                    _hover={{ bg: "#153e75" }}
                    type="button"
                    fontWeight="500"
                    isLoading={isSaving}
                    loadingText="Saving"
                    onClick={handleSubmit(onSubmitWorkDetails)}
                    isDisabled={isSaving}
                    w={121}
                    borderRadius={10}
                  >
                    Save
                  </Button>
                )}
              </Flex>
            </Flex>
          </Box>
        </Collapse>
        {/* <Divider /> */}
      </Box>
      {/* Reporting to */}

      {/* <Box
        mb={4}
        pl={2}
        pr={2}
        bg="white"
        borderRadius={"10px"}
        border={"1px solid #cccccc"}
      >
        <Flex
          align="center"
          justify="space-between"
          py={3}
          px={2}
          borderRadius="md"
          bg="#ffffff"
          cursor="pointer"
          onClick={() => handleToggle("reportingTo")}
        >
          <Heading fontSize="lg">Reporting to</Heading>
          <IconButton
            icon={
              open === "reportingTo" ? <ChevronUpIcon /> : <ChevronDownIcon />
            }
            size="sm"
            variant="ghost"
            aria-label="Toggle section"
          />
        </Flex>
        <Collapse in={open === "reportingTo"} animateOpacity>
          <Box p={4}>
            <Flex align="center" mb={4}>
              <Switch
                id="noReport"
                isChecked={noReport}
                onChange={() => setNoReport((v) => !v)}
                mr={2}
              />
              <Text fontSize="sm">Doesn't report to anyone</Text>
            </Flex>
            {!noReport && (
              <SimpleGrid columns={2} spacing={4} mb={4}>
                <FormControl>
                  <FormLabel
                    fontFamily="Poppins"
                    fontSize="14px"
                    fontWeight="500"
                  >
                    Reporting manager
                  </FormLabel>
                  <Select
                    {...register("reportingManager")}
                    placeholder="Enter reporting manager"
                    {...inputStyle}
                  >
                    <option>Manager 1</option>
                    <option>Manager 2</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel
                    fontFamily="Poppins"
                    fontSize="14px"
                    fontWeight="500"
                  >
                    Additional reporting managers
                  </FormLabel>
                  <Input
                    {...register("additionalReportingManagers")}
                    placeholder="Enter additional reporting managers"
                    {...inputStyle}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel
                    fontFamily="Poppins"
                    fontSize="14px"
                    fontWeight="500"
                  >
                    HR
                  </FormLabel>
                  <Input
                    {...register("hr")}
                    placeholder="Enter HR email"
                    {...inputStyle}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel
                    fontFamily="Poppins"
                    fontSize="14px"
                    fontWeight="500"
                  >
                    Additional HR
                  </FormLabel>
                  <Input
                    {...register("additionalHr")}
                    placeholder="Enter additional HR"
                    {...inputStyle}
                  />
                </FormControl>
              </SimpleGrid>
            )}
            <Flex justifyContent={"space-between"} p={4}>
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  // Clear only this section's fields
                  [
                    "reportingManager",
                    "additionalReportingManagers",
                    "hr",
                    "additionalHr",
                  ].forEach((f) => {
                    try {
                      const el = document.querySelector(`[name="${f}"]`);
                      if (el) el.value = "";
                    } catch (e) {}
                  });
                  setNoReport(false);
                }}
                color={"#757575"}
                border={"white"}
              >
                Clear form
              </Button>
              <Button
                color="white"
                backgroundColor="#1A365D"
                _hover={{ bg: "#153e75" }}
                type="button"
                onClick={handleSaveReportingTo}
              >
                Save
              </Button>
            </Flex>
          </Box>
        </Collapse>
        <Divider />
      </Box> */}
      {/* Reporting to */}
      <Box
        mb={4}
        pl={2}
        pr={2}
        bg="white"
        borderRadius="10px"
        border="1px solid #cccccc"
        fontFamily="Poppins"
      >
        <Flex
          align="center"
          justify="space-between"
          py={3}
          px={2}
          borderRadius="md"
          bg="white"
        >
          <Heading fontSize="lg">Reporting to</Heading>
        </Flex>

        <Box p={4}>
          {reportingLoading ? (
            <Flex justify="center" align="center" py={6}>
              <Spinner />
              <Text ml={3}>Loading reporting information...</Text>
            </Flex>
          ) : (
            <>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
                <EmployeeSearchField
                  label="Reporting manager"
                  value={reportingData.reporting_manager}
                  onChange={(value) =>
                    setReportingData((prev) => ({
                      ...prev,
                      reporting_manager: value,
                    }))
                  }
                  inputStyle={inputStyle}
                  isDisabled={viewDisabled || reportingSaving}
                />

                <EmployeeSearchField
                  label="Additional reporting managers"
                  multiple
                  value={reportingData.additional_reporting_manager}
                  onChange={(value) =>
                    setReportingData((prev) => ({
                      ...prev,
                      additional_reporting_manager: value,
                    }))
                  }
                  inputStyle={inputStyle}
                  isDisabled={viewDisabled || reportingSaving}
                />

                <EmployeeSearchField
                  label="HR"
                  value={reportingData.hr}
                  onChange={(value) =>
                    setReportingData((prev) => ({
                      ...prev,
                      hr: value,
                    }))
                  }
                  inputStyle={inputStyle}
                  isDisabled={viewDisabled || reportingSaving}
                />

                <EmployeeSearchField
                  label="Additional HR"
                  multiple
                  value={reportingData.additonal_hr}
                  onChange={(value) =>
                    setReportingData((prev) => ({
                      ...prev,
                      additonal_hr: value,
                    }))
                  }
                  inputStyle={inputStyle}
                  isDisabled={viewDisabled || reportingSaving}
                />
              </SimpleGrid>

              <Flex justifyContent="space-between" p={4}>
                <Button
                  variant="outline"
                  type="button"
                  color="#757575"
                  border="white"
                  isDisabled={viewDisabled || reportingSaving}
                  onClick={() => {
                    setReportingData({
                      reporting_manager: null,
                      hr: null,
                      additional_reporting_manager: [],
                      additonal_hr: [],
                    });
                  }}
                >
                  Clear form
                </Button>

                <Button
                  color="white"
                  backgroundColor="#1A365D"
                  _hover={{ bg: "#153e75" }}
                  type="button"
                  onClick={handleSaveReportingTo}
                  isLoading={reportingSaving}
                  loadingText="Saving"
                  isDisabled={viewDisabled || reportingLoading}
                >
                  {reportingExists ? "Update" : "Save"}
                </Button>
              </Flex>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
