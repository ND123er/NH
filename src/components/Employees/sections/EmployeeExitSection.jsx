// EmployeeExitSection.jsx
import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  SimpleGrid,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  Flex,
  InputGroup,
  IconButton,
  useToast,
  Text,
  Collapse,
  Heading,
  Divider,
  FormErrorMessage,
  InputRightElement,
  Portal,
} from "@chakra-ui/react";
import { EditIcon, ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { useFormContext, Controller } from "react-hook-form";
import api from "../../../api/axios";
import { getOrgCode } from "../../../utils/token";
import { getOrgIdFromReduxOrStorage } from "../../../utils/token";
import { updateEmployee } from "../../../api/employee";
import { DatePicker } from "../../../layouts/DatePicker";

export default function EmployeeExitSection({
  isViewMode = false,
  isEditing = true,
  setIsEditing = () => {},
}) {
  const methods = useFormContext();
  const {
    register,
    getValues,
    resetField,
    setValue,
    control,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = methods;
  const toast = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  // whether inputs should be disabled (view mode and not editing)
  const viewDisabled = isViewMode && !isEditing;

  // New authorised employee autocomplete state
  const [employeesList, setEmployeesList] = useState([]);
  const [queryEmp, setQueryEmp] = useState("");
  const [showEmpDropdown, setShowEmpDropdown] = useState(false);
  const [loadingEmp, setLoadingEmp] = useState(false);
  const wrapperRefEmp = useRef(null);

  // Reasons for exit autocomplete state
  const [reasonsList, setReasonsList] = useState([]);
  const [queryReason, setQueryReason] = useState("");
  const [showReasonDropdown, setShowReasonDropdown] = useState(false);
  const [loadingReason, setLoadingReason] = useState(false);
  const debounceRefReason = useRef(null);
  const wrapperRefReason = useRef(null);
  const { user } = useSelector((state) => state.auth);

  const noticeStart = watch("noticeStartDate");
  const noticeEnd = watch("noticeEndDate");
  const lastWorking = watch("lastWorkingDate");
  const finalSettlement = watch("finalSettlementDate");
  const portalAccessDisable = watch("portalAccessDisableDate");
  // Fetch existing employee exit details
  useEffect(() => {
    const fetchExitDetails = async () => {
      try {
        // const employeeId =
        //   getValues("employee_emp_code") ||
        //   getValues("employee_db_id") ||
        //   (typeof window !== "undefined"
        //     ? localStorage.getItem("employee_emp_code") ||
        //       localStorage.getItem("employee_db_id")
        //     : null);
        const employeeId =
          getValues("employee_emp_code") ||
          localStorage.getItem("employee_emp_code") ||
          "";

        if (!employeeId) return;

        const res = await api.get(
          `/employee/get_employee_exit_details?employee_id=${encodeURIComponent(
            employeeId,
          )}`,
        );

        const exitDetails =
          res?.data?.data ||
          res?.data?.employee_exit ||
          res?.data?.exit_details ||
          res?.data;

        if (!exitDetails) return;

        if (exitDetails.kt_employee_id) {
          setValue("newAuthorisedEmployee_id", exitDetails.kt_employee_id);
          setValue("newAuthorisedEmployee", exitDetails.kt_employee_id);
        }

        setValue("noticeStartDate", exitDetails.notice_period_start || "");
        setValue("noticeEndDate", exitDetails.notice_period_end || "");
        setValue("lastWorkingDate", exitDetails.last_working || "");
        setValue(
          "finalSettlementDate",
          exitDetails.final_settlement_date || "",
        );
        setValue(
          "portalAccessDisableDate",
          exitDetails.portal_access_date || "",
        );

        // if (exitDetails.reason_of_exit) {
        //   setValue("reasonForExit_id", exitDetails.reason_of_exit);
        // }
        if (exitDetails.reason_of_exit) {
          const reasonRes = await api.get(
            "/settings/get_reason_for_exit_list",
            {
              params: {
                org_id: getOrgCode(),
              },
            },
          );

          const reasons = reasonRes?.data?.success
            ? reasonRes.data.data || []
            : [];

          console.log("Saved reason ID:", exitDetails.reason_of_exit);
          console.log("Reasons list:", reasons);

          setReasonsList(reasons);

          const matchedReason = reasons.find(
            (reason) =>
              String(reason._id).trim() ===
              String(exitDetails.reason_of_exit).trim(),
          );

          console.log("Matched reason:", matchedReason);

          setValue("reasonForExit_id", exitDetails.reason_of_exit);
          setValue("reasonForExit", matchedReason?.reason_name || "");
        }
      } catch (err) {
        if (err?.response?.status === 404) {
          // toast({
          //   description:
          //     err?.response?.data?.msg ||
          //     "No exit details found for this employee.",
          //   status: "warning",
          //   duration: 3000,
          //   isClosable: true,
          // });

          return;
        }
        console.error("Failed to fetch employee exit details", err);
      }
    };

    fetchExitDetails();
  }, [getValues, setValue]);

  const sectionFields = [
    "noticeStartDate",
    "noticeEndDate",
    "lastWorkingDate",
    "finalSettlementDate",
    "portalAccessDisableDate",
    "reasonForExit",
    "personalEmail",
    "newAuthorisedEmployee",
    "exitNotes",
    "reasonForExit_id",
    "newAuthorisedEmployee_id",
  ];

  const handleClear = () => {
    if (viewDisabled) return;
    sectionFields.forEach((field) => resetField(field));
  };

  // const fetchEmployees = async (search = "") => {
  //   try {
  //     setLoadingEmp(true);
  //     const orgId = getOrgCode();
  //     if (!orgId) {
  //       setEmployeesList([]);
  //       return;
  //     }
  //     const url = `/employee/get_employee_by_name?search=${encodeURIComponent(
  //       search
  //     )}&org_id=${encodeURIComponent(orgId)}`;
  //     const res = await api.get(url);
  //     const items = res?.data?.reasons || [];

  //     setEmployeesList(items);
  //   } catch (err) {
  //     console.error("Failed to fetch employees", err);
  //     setEmployeesList([]);
  //   } finally {
  //     setLoadingEmp(false);
  //   }
  // };

  // useEffect(() => {
  //   if (debounceRefEmp.current) clearTimeout(debounceRefEmp.current);
  //   debounceRefEmp.current = setTimeout(
  //     () => fetchEmployees(queryEmp.trim()),
  //     300
  //   );
  //   return () => clearTimeout(debounceRefEmp.current);
  // }, [queryEmp]);

  // const fetchEmployees = async (search = "") => {
  //   try {
  //     setLoadingEmp(true);

  //     const orgId = getOrgCode();
  //     const employeeId =
  //       getValues("employee_emp_code") ||
  //       getValues("employee_db_id") ||
  //       localStorage.getItem("employee_emp_code") ||
  //       localStorage.getItem("employee_db_id");

  //     if (!orgId) {
  //       setEmployeesList([]);
  //       return;
  //     }

  //     const url = `/employee/get_employees_list?org_id=${encodeURIComponent(
  //       orgId,
  //     )}&employee_id=${encodeURIComponent(
  //       employeeId || "",
  //     )}&search=${encodeURIComponent(search.trim())}&offset=0&limit=20`;

  //     const res = await api.get(url);

  //     setEmployeesList(res?.data?.data || []);
  //   } catch (err) {
  //     console.error("Failed to fetch employees", err);
  //     setEmployeesList([]);
  //   } finally {
  //     setLoadingEmp(false);
  //   }
  // };

  // useEffect(() => {
  //   const handler = (e) => {
  //     if (wrapperRefEmp.current && !wrapperRefEmp.current.contains(e.target)) {
  //       setShowEmpDropdown(false);
  //     }
  //     if (
  //       wrapperRefReason.current &&
  //       !wrapperRefReason.current.contains(e.target)
  //     ) {
  //       setShowReasonDropdown(false);
  //     }
  //   };
  //   document.addEventListener("mousedown", handler);
  //   return () => document.removeEventListener("mousedown", handler);
  // }, []);

  const fetchEmployees = async () => {
    try {
      setLoadingEmp(true);

      const orgId = getOrgIdFromReduxOrStorage(user);

      const url = `/employee/get_employees_list?org_id=${encodeURIComponent(
        orgId || "",
      )}&employee_id=${encodeURIComponent(
        user?.employee_id || "",
      )}&search=&offset=0&limit=20`;

      const res = await api.get(url);

      setEmployeesList(Array.isArray(res?.data?.data) ? res.data.data : []);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setEmployeesList([]);
    } finally {
      setLoadingEmp(false);
    }
  };

  useEffect(() => {
    if (user?.employee_id) {
      fetchEmployees();
    }
  }, [user?.employee_id]);

  const filteredEmployees = employeesList.filter((employee) => {
    const employeeCode =
      employee.employee_id ||
      employee.emp_code ||
      employee.employee_code ||
      employee.employee_id_code ||
      "";

    const employeeName =
      employee.full_name ||
      employee.name ||
      employee.employee_name ||
      employee.emp_name ||
      "";

    const searchText = queryEmp.trim().toLowerCase();

    return (
      employeeName.toLowerCase().includes(searchText) ||
      employeeCode.toLowerCase().includes(searchText)
    );
  });

  const authorisedEmployeeId = watch("newAuthorisedEmployee_id");

  useEffect(() => {
    if (!authorisedEmployeeId || employeesList.length === 0) return;

    const matchedEmployee = employeesList.find((employee) => {
      const employeeCode =
        employee.employee_id ||
        employee.emp_code ||
        employee.employee_code ||
        employee.employee_id_code ||
        "";

      return (
        String(employeeCode).trim() === String(authorisedEmployeeId).trim()
      );
    });

    if (matchedEmployee) {
      const employeeName =
        matchedEmployee.full_name ||
        matchedEmployee.name ||
        matchedEmployee.employee_name ||
        matchedEmployee.emp_name ||
        "";

      setValue("newAuthorisedEmployee", employeeName, {
        shouldDirty: false,
      });
    }
  }, [employeesList, authorisedEmployeeId, setValue]);

  useEffect(() => {
    const handler = (e) => {
      // Close employee dropdown only when clicking completely outside
      // the employee field/dropdown area.
      if (wrapperRefEmp.current && !wrapperRefEmp.current.contains(e.target)) {
        setShowEmpDropdown(false);
      }

      // Keep existing reason dropdown behaviour unchanged
      if (
        wrapperRefReason.current &&
        !wrapperRefReason.current.contains(e.target)
      ) {
        setShowReasonDropdown(false);
      }
    };

    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, []);
  //old
  // const fetchReasons = async (search = "") => {
  //   try {
  //     setLoadingReason(true);
  //     const orgId = getOrgCode();
  //     if (!orgId) {
  //       setReasonsList([]);
  //       return;
  //     }
  //     const url = `/organization/get_reasons_for_exit/${encodeURIComponent(
  //       orgId,
  //     )}${search ? `?search=${encodeURIComponent(search)}` : ""}`;
  //     const res = await api.get(url);
  //     const items = res?.data?.reasons || [];

  //     setReasonsList(items);
  //   } catch (err) {
  //     console.error("Failed to fetch reasons for exit", err);
  //     setReasonsList([]);
  //   } finally {
  //     setLoadingReason(false);
  //   }
  // };

  const fetchReasons = async () => {
    try {
      setLoadingReason(true);

      const orgId = getOrgCode();

      if (!orgId) {
        setReasonsList([]);
        return [];
      }

      const res = await api.get("/settings/get_reason_for_exit_list", {
        params: {
          org_id: orgId,
        },
      });

      const items = res?.data?.success ? res.data.data || [] : [];

      setReasonsList(items);

      return items;
    } catch (err) {
      console.error("Failed to fetch reasons for exit", err);
      setReasonsList([]);
      return [];
    } finally {
      setLoadingReason(false);
    }
  };

  // useEffect(() => {
  //   if (debounceRefReason.current) clearTimeout(debounceRefReason.current);
  //   debounceRefReason.current = setTimeout(
  //     () => fetchReasons(queryReason.trim()),
  //     300,
  //   );
  //   return () => clearTimeout(debounceRefReason.current);
  // }, [queryReason]);
  useEffect(() => {
    if (debounceRefReason.current) clearTimeout(debounceRefReason.current);

    debounceRefReason.current = setTimeout(() => fetchReasons(), 300);

    return () => clearTimeout(debounceRefReason.current);
  }, [queryReason]);

  // useEffect(() => {
  //   if (debounceRefEmp.current) {
  //     clearTimeout(debounceRefEmp.current);
  //   }

  //   debounceRefEmp.current = setTimeout(() => {
  //     fetchEmployees(queryEmp.trim());
  //   }, 300);

  //   return () => clearTimeout(debounceRefEmp.current);
  // }, [queryEmp]);

  //create handler

  const handleSave = async () => {
    if (viewDisabled) return;

    const allValues = getValues();
    const exitInfo = {};
    sectionFields.forEach((f) => {
      exitInfo[f] = allValues[f];
    });

    const dbId =
      getValues("employee_db_id") ||
      (typeof window !== "undefined"
        ? localStorage.getItem("employee_db_id")
        : null);
    const empCode =
      getValues("employee_emp_code") ||
      (typeof window !== "undefined"
        ? localStorage.getItem("employee_emp_code")
        : null);

    // if (!dbId && !empCode) {
    //   toast({
    //     title: "Save basic info first",
    //     description:
    //       "Please save basic information before saving exit details.",
    //     status: "warning",
    //     duration: 2500,
    //   });
    //   return;
    // }

    const employee_id = dbId || empCode;
    // const kt_employee_id = empCode || dbId;
    const kt_employee_id = allValues.newAuthorisedEmployee_id || null;

    // Convert date strings to ISO (send as Date strings). If empty, send null.
    const noticeStartIso = allValues.noticeStartDate
      ? new Date(allValues.noticeStartDate).toISOString()
      : null;
    const noticeEndIso = allValues.noticeEndDate
      ? new Date(allValues.noticeEndDate).toISOString()
      : null;
    const lastWorkingIso = allValues.lastWorkingDate
      ? new Date(allValues.lastWorkingDate).toISOString()
      : null;
    const finalSettlementIso = allValues.finalSettlementDate
      ? new Date(allValues.finalSettlementDate).toISOString()
      : null;
    const portalAccessIso = allValues.portalAccessDisableDate
      ? new Date(allValues.portalAccessDisableDate).toISOString()
      : null;

    const body = {
      employee_id,
      kt_employee_id,
      notice_period_start: noticeStartIso,
      notice_period_end: noticeEndIso,
      last_working: lastWorkingIso,
      final_settlement_date: finalSettlementIso,
      portal_access_date: portalAccessIso,
      reason_of_exit: allValues.reasonForExit_id || "",
      // reason_of_exit_id: allValues.reasonForExit_id || null,
    };

    setIsSaving(true);
    try {
      const res = await api.post("/employee/add_exit_information", body);
      console.warn("Add exit information success", res?.data || res);
      try {
        localStorage.setItem("employee_exit", JSON.stringify(exitInfo));
      } catch (e) {}
      toast({
        title: "Employee exit details saved!",
        status: "success",
        duration: 1500,
        isClosable: true,
      });
      if (isViewMode && isEditing) setIsEditing(false);
    } catch (err) {
      console.error("Add exit information error", err);
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to save exit details";
      toast({
        title: "Save failed",
        description: message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  //update handler
  const handleUpdate = async () => {
    if (viewDisabled) return;

    const allValues = getValues();
    const dbId =
      getValues("employee_db_id") ||
      (typeof window !== "undefined"
        ? localStorage.getItem("employee_db_id")
        : null);
    const empCode =
      getValues("employee_emp_code") ||
      (typeof window !== "undefined"
        ? localStorage.getItem("employee_emp_code")
        : null);

    if (!dbId && !empCode) {
      toast({
        title: "Save basic info first",
        description:
          "Please save basic information before updating exit details.",
        status: "warning",
        duration: 2500,
      });
      return;
    }

    // const employee_id = dbId || empCode;
    // const kt_employee_id = empCode || dbId;
    const kt_employee_id = allValues.newAuthorisedEmployee_id || null;
    // Convert date strings to ISO (send as Date strings). If empty, send null.
    const noticeStartIso = allValues.noticeStartDate
      ? new Date(allValues.noticeStartDate).toISOString()
      : null;
    const noticeEndIso = allValues.noticeEndDate
      ? new Date(allValues.noticeEndDate).toISOString()
      : null;
    const lastWorkingIso = allValues.lastWorkingDate
      ? new Date(allValues.lastWorkingDate).toISOString()
      : null;
    const finalSettlementIso = allValues.finalSettlementDate
      ? new Date(allValues.finalSettlementDate).toISOString()
      : null;
    const portalAccessIso = allValues.portalAccessDisableDate
      ? new Date(allValues.portalAccessDisableDate).toISOString()
      : null;

    const body = {
      ...(dbId ? { id: dbId } : {}),
      ...(empCode ? { employee_id: empCode } : {}),
      kt_employee_id, // ADD THIS
      notice_period_start: noticeStartIso,
      notice_period_end: noticeEndIso,
      last_working: lastWorkingIso,
      final_settlement_date: finalSettlementIso,
      portal_access_date: portalAccessIso,
      reason_of_exit: allValues.reasonForExit_id || "",
      // reason_of_exit_id: allValues.reasonForExit_id || null,
    };

    try {
      setIsSaving(true);
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await api.put("/employee/update_exit_information", body, {
        headers,
      });

      try {
        const exitInfo = {};
        sectionFields.forEach((f) => {
          exitInfo[f] = allValues[f];
        });
        localStorage.setItem("employee_exit", JSON.stringify(exitInfo));
      } catch (e) {}

      toast({
        title: "Employee exit details updated!",
        status: "success",
        duration: 1500,
        isClosable: true,
      });

      // exit edit mode
      if (isViewMode && isEditing) setIsEditing(false);
    } catch (err) {
      console.error("Update exit information error", err);
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update exit details";
      toast({
        title: "Update failed",
        description: message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

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
    borderwidth: "1.5px",
    bordercolor: "#D0D5DD",
    borderradius: "8px",
  };

  // Cancel: try to reload saved values from localStorage
  const handleCancel = () => {
    if (!isViewMode) {
      // if not viewMode (creating new) just reset the fields
      handleClear();
      return setIsEditing(false);
    }

    try {
      const raw = localStorage.getItem("employee_exit");
      if (raw) {
        const parsed = JSON.parse(raw);
        // set the known fields back
        sectionFields.forEach((f) => {
          if (parsed.hasOwnProperty(f)) {
            setValue(f, parsed[f], {
              shouldValidate: false,
              shouldDirty: false,
            });
          } else {
            // if not present, clear it
            setValue(f, "", { shouldValidate: false, shouldDirty: false });
          }
        });
      }
    } catch (e) {
      // fallback: do nothing
      console.warn("Failed to reload exit data from storage on cancel", e);
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <Box
      border={"1px solid #e1e8f0"}
      borderRadius={"14px"}
      mb={4}
      bg="white"
      p={4}
      pb={2}
      // h="70vh"
      height={{ base: "50vh", sm: "60vh", md: "66vh", lg: "66Vh" }}
      overflowY="auto"
      sx={{
        "&::-webkit-scrollbar": {
          width: "0px",
        },
      }}
    >
      {/* Collapsible Header */}

      <Flex
        align="center"
        justify="space-between"
        borderRadius="md"
        bg="#ffffff"
        onClick={() => setIsOpen((v) => !v)}
        cursor="pointer"
      >
        <Flex align="center" gap={3}>
          <Heading
            fontSize="23px"
            fontFamily="Poppins, sans-serif"
            pl={2}
            fontWeight={"600"}
            color={"#000"}
          >
            Employee exit details
          </Heading>

          {/* Show Edit icon when viewing an existing employee */}
          {isViewMode && (
            <IconButton
              aria-label="Edit Exit Details"
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
          icon={
            isOpen ? (
              <ChevronUpIcon boxSize={7} />
            ) : (
              <ChevronDownIcon boxSize={7} />
            )
          }
          size="lg"
          variant="ghost"
          aria-label="Toggle section"
          mt={-2}
        />
      </Flex>
      <Box
        borderBottom="2px solid transparent"
        // sx={{
        //   borderImage:
        //     "repeating-linear-gradient(to right, #C7C7C7 0 4px, transparent 3px 9px) 1",
        // }}
        sx={{
          borderImage:
            "repeating-linear-gradient(to right, #C7C7C7 0 11px, transparent 11px 20px) 1",
        }}
        mt={6}
        mb={3}
        mr={-2}
        ml={-2}
      ></Box>

      <Collapse in={isOpen}>
        <Box p={4}>
          <SimpleGrid columns={2} spacing={4}>
            {/* Notice period start date */}

            <FormControl
              mb={3}
              isInvalid={!!errors?.noticeStartDate}
              isRequired
            >
              <FormLabel
                fontFamily={"poppins"}
                fontWeight={"600"}
                fontSize={14}
              >
                Notice period start date
              </FormLabel>

              <Controller
                name="noticeStartDate"
                control={control}
                rules={{
                  required: "Notice period start date is required",
                }}
                render={({ field }) => (
                  <DatePicker
                    placeholder="dd/mm/yyyy"
                    value={field.value}
                    onChange={(v) => {
                      if (!viewDisabled) field.onChange(v);
                    }}
                    isDisabled={viewDisabled}
                    inputProps={inputStyle}
                  />
                )}
              />

              <FormErrorMessage>
                {errors?.noticeStartDate?.message}
              </FormErrorMessage>
            </FormControl>

            {/* Notice period end date */}

            <FormControl mb={3} isInvalid={!!errors?.noticeEndDate} isRequired>
              <FormLabel
                fontFamily={"poppins"}
                fontWeight={"600"}
                fontSize={14}
              >
                Notice period end date
              </FormLabel>

              <Controller
                name="noticeEndDate"
                control={control}
                rules={{
                  required: "Notice period end date is required",
                  validate: {
                    afterStartDate: (value) => {
                      if (!value || !noticeStart) return true;
                      const start = new Date(noticeStart);
                      const end = new Date(value);
                      start.setHours(0, 0, 0, 0);
                      end.setHours(0, 0, 0, 0);
                      return (
                        end > start ||
                        "End date must be at least 1 day after start date"
                      );
                    },
                  },
                }}
                render={({ field }) => (
                  <DatePicker
                    // label="Notice period end date"
                    placeholder="dd/mm/yyyy"
                    value={field.value}
                    onChange={(v) => {
                      if (!viewDisabled) field.onChange(v);
                    }}
                    minDate={
                      noticeStart
                        ? new Date(
                            new Date(noticeStart).setDate(
                              new Date(noticeStart).getDate() + 1,
                            ),
                          )
                        : undefined
                    }
                    isDisabled={viewDisabled}
                    inputProps={inputStyle}
                  />
                )}
              />
              <FormErrorMessage>
                {errors?.noticeEndDate?.message}
              </FormErrorMessage>
            </FormControl>
            <FormControl
              mb={3}
              isInvalid={!!errors?.finalSettlementDate}
              isRequired
            >
              <FormLabel
                fontFamily={"poppins"}
                fontWeight={"600"}
                fontSize={14}
              >
                Final settlement date (approx.)
              </FormLabel>

              {/* <Controller
                name="finalSettlementDate"
                control={control}
                rules={{
                  required: "Final settlement date is required",
                  validate: {
                    afterNoticeEnd: (value) => {
                      if (!value || !noticeEnd) return true;
                      const endNotice = new Date(noticeEnd);
                      const finalSettle = new Date(value);
                      endNotice.setHours(0, 0, 0, 0);
                      finalSettle.setHours(0, 0, 0, 0);
                      endNotice.setDate(endNotice.getDate() + 1);
                      return (
                        finalSettle >= endNotice ||
                        "Final settlement date must be after notice period end date"
                      );
                    },
                  },
                }}
                render={({ field }) => (
                  <DatePicker
                    // label="Final settlement date (approx.)"
                    placeholder="dd/mm/yyyy"
                    value={field.value}
                    onChange={(v) => {
                      if (!viewDisabled) field.onChange(v);
                    }}
                    // minDate={noticeEnd ? new Date(noticeEnd) : undefined}
                    minDate={
                      noticeEnd
                        ? (() => {
                          const d = new Date(noticeEnd);
                          d.setDate(d.getDate() + 1);
                          return d;
                        })()
                        : undefined
                    }
                    isDisabled={viewDisabled}
                    inputProps={inputStyle}
                  />
                )}
              /> */}

              <Controller
                name="finalSettlementDate"
                control={control}
                rules={{
                  required: "Final settlement date is required",
                  // validate: {
                  //   afterNoticeEnd: (value) => {
                  //     if (!value || !noticeEnd) return true;

                  //     const endNotice = new Date(noticeEnd);
                  //     const finalSettle = new Date(value);

                  //     endNotice.setHours(0, 0, 0, 0);
                  //     finalSettle.setHours(0, 0, 0, 0);

                  //     endNotice.setDate(endNotice.getDate() + 1);

                  //     return (
                  //       finalSettle >= endNotice ||
                  //       "Final settlement date must be at least 1 day after notice period end date"
                  //     );
                  //   },
                  // },
                  validate: {
                    afterNoticeStart: (value) => {
                      if (!value || !noticeStart) return true;

                      const start = new Date(noticeStart);
                      const finalSettle = new Date(value);

                      start.setHours(0, 0, 0, 0);
                      finalSettle.setHours(0, 0, 0, 0);

                      start.setDate(start.getDate() + 1);

                      return (
                        finalSettle >= start ||
                        "Final settlement date must be at least 1 day after notice period start date"
                      );
                    },
                  },
                }}
                render={({ field }) => (
                  <DatePicker
                    placeholder="dd/mm/yyyy"
                    value={field.value}
                    onChange={(v) => {
                      if (!viewDisabled) field.onChange(v);
                    }}
                    // minDate={
                    //   noticeEnd
                    //     ? (() => {
                    //         const d = new Date(noticeEnd);
                    //         d.setDate(d.getDate() + 1);
                    //         return d;
                    //       })()
                    //     : undefined
                    // }
                    minDate={
                      noticeStart
                        ? (() => {
                            const d = new Date(noticeStart);
                            d.setDate(d.getDate() + 1);
                            return d;
                          })()
                        : undefined
                    }
                    isDisabled={viewDisabled}
                    inputProps={inputStyle}
                  />
                )}
              />

              <FormErrorMessage>
                {errors?.finalSettlementDate?.message}
              </FormErrorMessage>
            </FormControl>
            {/* Portal access disable date */}
            <FormControl
              mb={3}
              isInvalid={!!errors?.portalAccessDisableDate}
              isRequired
            >
              <FormLabel
                fontFamily={"poppins"}
                fontWeight={"600"}
                fontSize={14}
              >
                Portal access disable date
              </FormLabel>
              {/* <Controller
                name="portalAccessDisableDate"
                control={control}
                rules={{
                  required: "Portal access disable date is required",
                  validate: {
                    afterNoticeEnd: (value) => {
                      if (!value || !noticeEnd) return true;
                      const endNotice = new Date(noticeEnd);
                      const portal = new Date(value);
                      endNotice.setHours(0, 0, 0, 0);
                      portal.setHours(0, 0, 0, 0);
                      return (
                        portal >= endNotice ||
                        "Portal access disable date must be after notice period end date"
                      );
                    },

                    beforeFinalSettlement: (value) => {
                      if (!value || !getValues("finalSettlementDate")) return true;
                      const portal = new Date(value);
                      const finalSettle = new Date(getValues("finalSettlementDate"));
                      portal.setHours(0, 0, 0, 0);
                      finalSettle.setHours(0, 0, 0, 0);
                      return (
                        portal <= finalSettle ||
                        "Portal access disable date must be before final settlement date"
                      );
                    },
                  },
                }}
                render={({ field }) => (
                  <DatePicker
                    // label="Portal access disable date"
                    placeholder="dd/mm/yyyy"
                    value={field.value}
                    onChange={(v) => {
                      if (!viewDisabled) field.onChange(v);
                    }}
                    minDate={noticeEnd ? new Date(noticeEnd) : undefined}
                    maxDate={
                      getValues("finalSettlementDate")
                        ? new Date(getValues("finalSettlementDate"))
                        : undefined
                    }
                    isDisabled={viewDisabled}
                    inputProps={inputStyle}
                  />
                )}
              /> */}

              <Controller
                name="portalAccessDisableDate"
                control={control}
                rules={{
                  required: "Portal access disable date is required",
                  // validate: {
                  //   exactlyOneDayAfterNoticeEnd: (value) => {
                  //     if (!value || !noticeEnd) return true;

                  //     const endNotice = new Date(noticeEnd);
                  //     const portal = new Date(value);

                  //     endNotice.setHours(0, 0, 0, 0);
                  //     portal.setHours(0, 0, 0, 0);

                  //     // noticeEnd + 1 day
                  //     const allowedDate = new Date(endNotice);
                  //     allowedDate.setDate(allowedDate.getDate() + 1);

                  //     return (
                  //       (portal >= endNotice && portal <= nextDay) ||
                  //       "Portal access disable date must be exactly 1 day after notice period end date"
                  //     );

                  //   },
                  // },
                  validate: {
                    afterNoticeStart: (value) => {
                      if (!value || !noticeStart) return true;

                      const start = new Date(noticeStart);
                      const portal = new Date(value);

                      start.setHours(0, 0, 0, 0);
                      portal.setHours(0, 0, 0, 0);

                      return (
                        portal > start ||
                        "Portal access disable date must be at least 1 day after notice period start date"
                      );
                    },
                  },
                }}
                render={({ field }) => {
                  // const minMaxDate = noticeEnd
                  //   ? (() => {
                  //     const d = new Date(noticeEnd);
                  //     d.setDate(d.getDate() + 1);
                  //     return d;
                  //   })()
                  //   : undefined;
                  //old
                  // const minDate = noticeEnd ? new Date(noticeEnd) : undefined;

                  // const maxDate = noticeEnd
                  //   ? (() => {
                  //       const d = new Date(noticeEnd);
                  //       d.setDate(d.getDate() + 1);
                  //       return d;
                  //     })()
                  //   : undefined;
                  //old
                  // const minDate = noticeStart
                  //   ? new Date(noticeStart)
                  //   : undefined;
                  const minDate = noticeStart
                    ? (() => {
                        const d = new Date(noticeStart);
                        d.setDate(d.getDate() + 1);
                        return d;
                      })()
                    : undefined;
                  return (
                    <DatePicker
                      placeholder="dd/mm/yyyy"
                      value={field.value}
                      onChange={(v) => {
                        if (!viewDisabled) field.onChange(v);
                      }}
                      minDate={minDate}
                      // maxDate={maxDate}
                      isDisabled={viewDisabled}
                      inputProps={inputStyle}
                    />
                  );
                }}
              />

              <FormErrorMessage>
                {errors?.portalAccessDisableDate?.message}
              </FormErrorMessage>
            </FormControl>

            {/* Reason for exit */}
            <FormControl
              ref={wrapperRefReason}
              mb={3}
              position="relative"
              zIndex={1}
              isInvalid={!!errors?.reasonForExit}
              isRequired
            >
              <FormLabel
                fontWeight="600"
                fontFamily={"Poppins"}
                fontSize={"14px"}
                letterSpacing={"-0.3px"}
              >
                Reason for exit
              </FormLabel>
              {/* <InputGroup position="relative">
                <input type="hidden" {...register("reasonForExit_id")} />
                <Controller
                  name="reasonForExit"
                  control={control}
                  rules={{
                    required: "Reason for exit is required",
                  }}
                  render={({ field }) => (
                    <>
                      <Input
                        {...field}
                        placeholder="Enter reason"
                        mr={2}
                        onChange={(e) => {
                          if (!viewDisabled) {
                            field.onChange(e.target.value);
                            setQueryReason(e.target.value);
                            setShowReasonDropdown(true);
                          }
                        }}
                        onFocus={() => {
                          if (!viewDisabled) {
                            setShowReasonDropdown(true);
                            if (reasonsList.length === 0) fetchReasons("");
                          }
                        }}
                        isDisabled={viewDisabled}
                        {...inputStyle}
                      />

                      {showReasonDropdown && !viewDisabled && (
                        // <Box
                        //   position="absolute"
                        //   left={0}
                        //   right={0}
                        //   mt={1}
                        //   bg="white"
                        //   border="1px solid #e2e8f0"
                        //   borderRadius="md"
                        //   zIndex={50}
                        //   maxH="200px"
                        //   overflowY="auto"
                        // >
                        <Box
                          position="absolute"
                          top="100%"
                          left={0}
                          right={0}
                          mt={1}
                          bg="white"
                          border="1px solid #e2e8f0"
                          borderRadius="md"
                          zIndex={1000}
                          maxH="200px"
                          overflowY="auto"
                        >

                          {loadingReason ? (
                            <Box p={2}>Loading...</Box>
                          ) : reasonsList.length === 0 ? (
                            <Box p={2}>No results</Box>
                          ) : (
                            reasonsList.map((r) => (
                              <Box
                                key={r._id}
                                px={3}
                                py={2}
                                _hover={{ bg: "gray.50", cursor: "pointer" }}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                  field.onChange(r.reason_name);
                                  setValue("reasonForExit_id", r._id);
                                  setShowReasonDropdown(false);
                                }}
                              >
                                {r.reason_name}
                              </Box>
                            ))
                          )}
                        </Box>
                      )}
                    </>
                  )}
                />
              </InputGroup> */}
              <InputGroup position="relative">
                <input type="hidden" {...register("reasonForExit_id")} />
                <Controller
                  name="reasonForExit"
                  control={control}
                  rules={{
                    required: "Reason for exit is required",
                  }}
                  render={({ field }) => (
                    <>
                      <Input
                        {...field}
                        placeholder="Enter reason"
                        pr="2.5rem"
                        onChange={(e) => {
                          if (!viewDisabled) {
                            field.onChange(e.target.value);
                            setQueryReason(e.target.value);
                            setShowReasonDropdown(true);
                          }
                        }}
                        onFocus={() => {
                          if (!viewDisabled) {
                            setShowReasonDropdown(true);
                            console.log(reasonsList);
                            if (reasonsList.length === 0) fetchReasons("");
                          }
                        }}
                        isDisabled={viewDisabled}
                        {...inputStyle}
                      />
                      <InputRightElement
                        h="100%"
                        cursor={viewDisabled ? "not-allowed" : "pointer"}
                        onClick={() => {
                          console.log("CLICKED");
                          if (!viewDisabled) {
                            setShowReasonDropdown((prev) => !prev);
                          }
                        }}
                      >
                        <ChevronDownIcon color="gray.500" boxSize={5} mr={0} />
                      </InputRightElement>

                      {showReasonDropdown &&
                        !viewDisabled &&
                        wrapperRefReason.current && (
                          // <Portal>
                          <Box
                            position="absolute"
                            top="100%"
                            bg="white"
                            left={0}
                            width={wrapperRefReason.current.offsetWidth}
                            // bg="white"
                            border="1px solid #cccccc"
                            borderRadius="md"
                            zIndex={999999}
                            maxH="200px"
                            overflowY="auto"
                            boxShadow="lg"
                          >
                            {loadingReason ? (
                              <Box bg="white" p={2}>
                                Loading...
                              </Box>
                            ) : reasonsList.length === 0 ? (
                              <Box p={2}>No results</Box>
                            ) : (
                              reasonsList.map((r) => (
                                <Box
                                  key={r._id}
                                  px={3}
                                  py={2}
                                  bg="white"
                                  position="relative"
                                  _hover={{
                                    bg: "gray.50",
                                    cursor: "pointer",
                                  }}
                                  // onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => {
                                    console.log("CLICKED", r);
                                    field.onChange(r.reason_name);
                                    setValue("reasonForExit_id", r._id);
                                    setShowReasonDropdown(false);
                                  }}
                                >
                                  {r.reason_name}
                                </Box>
                              ))
                            )}
                          </Box>
                          // </Portal>
                        )}
                    </>
                  )}
                />
              </InputGroup>
              <FormErrorMessage fontFamily={"Poppins"}>
                {errors?.reasonForExit?.message}
              </FormErrorMessage>
            </FormControl>
            <FormControl ref={wrapperRefEmp}>
              <FormLabel
                fontWeight="600"
                fontFamily={"Poppins"}
                fontSize={"14px"}
                letterSpacing={"-0.3px"}
              >
                New authorised employee
              </FormLabel>
              <input
                type="hidden"
                {...register("newAuthorisedEmployee_id")}
                {...inputStyle}
              />
              <InputGroup position="relative">
                {/* <Controller
                  name="newAuthorisedEmployee"
                  control={control}
                  render={({ field }) => (
                    <>
                      <Input
                        {...field}
                        placeholder="Enter name / id"
                        onChange={(e) => {
                          if (!viewDisabled) {
                            const value = e.target.value;

                            field.onChange(value);
                            setQueryEmp(value);
                            setShowEmpDropdown(true);

                            fetchEmployees(value);
                          }
                        }}
                        onFocus={() => {
                          if (!viewDisabled) {
                            setShowEmpDropdown(true);
                          }
                        }}
                        {...inputStyle}
                        isDisabled={viewDisabled}
                      />
                     
                      {showEmpDropdown && queryEmp.trim() && (
                        <Box
                          position="absolute"
                          top="100%"
                          left={0}
                          right={0}
                          mt={1}
                          bg="white"
                          border="1px solid #CBD5E1"
                          borderRadius="6px"
                          boxShadow="md"
                          zIndex={9999}
                          maxH="200px"
                          overflowY="auto"
                        >
                          {loadingEmp ? (
                            <Text px={3} py={2} fontSize="13px" color="#64748B">
                              Searching employees...
                            </Text>
                          ) : employeesList.length === 0 ? (
                            <Text px={3} py={2} fontSize="13px" color="#64748B">
                              No employee found
                            </Text>
                          ) : (
                            employeesList.map((employee, index) => {
                              const employeeCode =
                                employee.employee_id ||
                                employee.emp_code ||
                                employee.employee_code ||
                                employee.employee_id_code ||
                                "";

                              const employeeName =
                                employee.full_name ||
                                employee.name ||
                                employee.employee_name ||
                                employee.emp_name ||
                                "";

                              return (
                                <Box
                                  key={employeeCode || index}
                                  px={3}
                                  py={2}
                                  cursor="pointer"
                                  bg="white"
                                  _hover={{ bg: "#F1F5F9" }}
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => {
                                    field.onChange(employeeCode);
                                    setValue(
                                      "newAuthorisedEmployee_id",
                                      employeeCode,
                                      {
                                        shouldDirty: true,
                                      },
                                    );
                                    setQueryEmp("");
                                    setShowEmpDropdown(false);
                                    setEmployeesList([]);
                                  }}
                                >
                                  <Text fontSize="13px" color="#334155">
                                    {employeeName}
                                  </Text>

                                  <Text fontSize="11px" color="#64748B">
                                    {employeeCode}
                                  </Text>
                                </Box>
                              );
                            })
                          )}
                        </Box>
                      )}
                    </>
                  )}
                /> */}
                <Controller
                  name="newAuthorisedEmployee"
                  control={control}
                  render={({ field }) => (
                    <>
                      <Input
                        {...field}
                        placeholder="Enter name / id"
                        // onChange={(e) => {
                        //   if (viewDisabled) return;

                        //   const value = e.target.value;

                        //   field.onChange(value);
                        //   setQueryEmp(value);
                        //   setShowEmpDropdown(true);
                        //   fetchEmployees(value);
                        // }}
                        // onFocus={() => {
                        //   if (!viewDisabled) {
                        //     setShowEmpDropdown(true);
                        //   }
                        // }}
                        onChange={(e) => {
                          if (viewDisabled) return;

                          const value = e.target.value;

                          field.onChange(value);
                          setQueryEmp(value);
                          setShowEmpDropdown(true);
                        }}
                        onFocus={() => {
                          if (!viewDisabled) {
                            setShowEmpDropdown(true);

                            if (employeesList.length === 0) {
                              fetchEmployees();
                            }
                          }
                        }}
                        {...inputStyle}
                        isDisabled={viewDisabled}
                      />

                      {showEmpDropdown && queryEmp.trim() && (
                        <Box
                          position="absolute"
                          top="100%"
                          left={0}
                          right={0}
                          mt={1}
                          bg="white"
                          border="1px solid #CBD5E1"
                          borderRadius="6px"
                          boxShadow="md"
                          zIndex={9999}
                          maxH="200px"
                          overflowY="auto"
                        >
                          {loadingEmp ? (
                            <Text px={3} py={2} fontSize="13px" color="#64748B">
                              Searching employees...
                            </Text>
                          ) : filteredEmployees.length === 0 ? (
                            <Text px={3} py={2} fontSize="13px" color="#64748B">
                              No employee found
                            </Text>
                          ) : (
                            filteredEmployees.map((employee, index) => {
                              const employeeCode =
                                employee.employee_id ||
                                employee.emp_code ||
                                employee.employee_code ||
                                employee.employee_id_code ||
                                "";

                              const employeeName =
                                employee.full_name ||
                                employee.name ||
                                employee.employee_name ||
                                employee.emp_name ||
                                "";

                              return (
                                <Box
                                  key={employeeCode || index}
                                  px={3}
                                  py={2}
                                  cursor="pointer"
                                  bg="white"
                                  _hover={{ bg: "#F1F5F9" }}
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => {
                                    // field.onChange(employeeCode);
                                    field.onChange(employeeName);

                                    setValue(
                                      "newAuthorisedEmployee_id",
                                      employeeCode,
                                      {
                                        shouldDirty: true,
                                      },
                                    );

                                    setQueryEmp("");
                                    setShowEmpDropdown(false);
                                    setEmployeesList([]);
                                  }}
                                >
                                  <Text fontSize="13px" color="#334155">
                                    {employeeName}
                                  </Text>

                                  <Text fontSize="11px" color="#64748B">
                                    {employeeCode}
                                  </Text>
                                </Box>
                              );
                            })
                          )}
                        </Box>
                      )}
                    </>
                  )}
                />
              </InputGroup>
            </FormControl>

            {/* <FormControl gridColumn="1 / -1">
              <FormLabel
                fontWeight="600"
                fontFamily={"Poppins"}
                fontSize={"14px"}
                letterSpacing={"-0.3px"}
              >
                Notes
              </FormLabel>
              <Textarea
                {...register("exitNotes")}
                placeholder="Enter notes"
                rows={4}
                isDisabled={viewDisabled}
                {...inputStyle}
              />
            </FormControl> */}
          </SimpleGrid>

          <Flex justifyContent={"space-between"} p={4}>
            <Button
              variant="outline"
              onClick={handleClear}
              color={"#757575"}
              border={"white"}
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
                      // onClick={async () => {
                      //  handleSubmit(handleUpdate)
                      // }}
                      onClick={handleSubmit(handleUpdate)}
                      isLoading={isSaving}
                      isDisabled={isSaving}
                      width={"121px"}
                      borderRadius={"10px"}
                    >
                      Update
                    </Button>

                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      isDisabled={isSaving}
                      width={"121px"}
                      borderRadius={"10px"}
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
                  onClick={handleSubmit(handleSave)}
                  isLoading={isSaving}
                  isDisabled={isSaving}
                  width={"121px"}
                  borderRadius={"10px"}
                >
                  Save
                </Button>
              )}
            </Flex>
          </Flex>
        </Box>
      </Collapse>
    </Box>
  );
}
