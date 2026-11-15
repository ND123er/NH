import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  FormErrorMessage,
  Image,
} from "@chakra-ui/react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import api from "../../../../api/axios";
import {
  updateEmployee,
  deleteEmployeeEducation,
} from "../../../../api/employee";
import { useFormContext } from "react-hook-form";
import { DatePicker } from "../../../../layouts/DatePicker";
import { getEmpCode } from "../../../../utils/token";
import calenderimg from "../../../../assets/calender.svg";
import { useSelector } from "react-redux";

export default function EducationDetails() {
  const [education, setEducation] = useState([]);
  // editing state: null => adding mode, number => editing that index
  const [editingIndex, setEditingIndex] = useState(null);

  // initialize from preloaded data (if present)
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const raw = localStorage.getItem("employee_education");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) setEducation(parsed);
      }
    } catch (e) {
      console.warn("Failed to initialize education from storage", e);
    }
  }, []);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const methods = useForm();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    clearErrors,
    control,
    formState: { errors },
  } = methods;
  const methods2 = useFormContext();
  const { getValues } = methods2;

  const selectedQualification = watch("qualification", "");

  const isSchoolQualification = ["10th", "12th"].includes(
    String(selectedQualification || "")
      .trim()
      .toLowerCase(),
  );

  // Clear form helper
  const handleClear = () => {
    reset({
      institution: "",
      qualification: "",
      field: "",
      percentage: "",
      completionDate: "",
      qualification_id: null,
      degree_id: null,
      school_id: null,
    });
    setQuery("");
    setQueryField("");
    setQueryInst("");
    setShowDropdown(false);
    setShowDropdownField(false);
    setShowDropdownInst(false);
    try {
      setValue("qualification_id", null);
      setValue("degree_id", null);
      setValue("school_id", null);
    } catch (e) {
      console.warn("Failed to clear hidden id fields", e);
    }
    // reset editing mode when clearing from modal
    setEditingIndex(null);
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
    borderWidth: "1.5px",
    borderColor: "#D0D5DD",
    borderRadius: "5px",
  };

  //****Later on we will refractor and move the dropdowns to separate components --****
  // Qualifications state
  const [qualifications, setQualifications] = useState([]);
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingQual, setLoadingQual] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);
  const { user } = useSelector((state) => state.auth);
  console.log("user", user);

  // Field of study (degrees) state
  const [degrees, setDegrees] = useState([]);
  const [queryField, setQueryField] = useState("");
  const [showDropdownField, setShowDropdownField] = useState(false);
  const [loadingDeg, setLoadingDeg] = useState(false);
  const debounceRefField = useRef(null);
  const wrapperRefField = useRef(null);

  // Institution (schools) state
  const [schools, setSchools] = useState([]);
  const [queryInst, setQueryInst] = useState("");
  const [showDropdownInst, setShowDropdownInst] = useState(false);
  const [loadingSch, setLoadingSch] = useState(false);
  const debounceRefInst = useRef(null);
  const wrapperRefInst = useRef(null);

  const today = new Date();

  // ADD or UPDATE handler
  const onSubmit = async (data) => {
    // data contains form fields: institution, qualification, field, percentage, completionDate
    const dbId =
      typeof window !== "undefined"
        ? localStorage.getItem("employee_db_id")
        : null;

    const empCode =
      getValues("employee_emp_code") ||
      getEmpCode() ||
      (typeof window !== "undefined"
        ? localStorage.getItem("employee_emp_code")
        : null);

    if (!dbId && !empCode) {
      toast({
        title: "Save basic info first",
        description:
          "Please save basic information before adding education details.",
        status: "warning",
        duration: 2500,
      });
      return;
    }

    const employee_id = dbId || empCode;

    // Build the entry object for UI (keep similar keys as you used in setEducation)
    const newEntry = {
      institution: data.institution,
      qualification: data.qualification,
      field: data.field,
      percentage: data.percentage,
      completion_date: data.completionDate,
      qualification_id: data.qualification_id || null,
      degree_id: data.degree_id || null,
      school_id: data.school_id || null,
    };

    // EDIT MODE: call specific Update API
    if (editingIndex !== null && editingIndex >= 0) {
      try {
        // prepare the body required by your API
        const existing = education[editingIndex] || {};
        // attempt to find education id if backend stored it
        const education_id =
          existing._id || existing.id || existing.education_id || null;

        // const body = {
        //   employee_id,
        //   qualification_id: data.qualification_id || null,
        //   degree_id: data.degree_id || null,
        //   school_id: data.school_id || null,
        //   field_of_study: data.field || "",
        //   percentage: data.percentage || "",
        //   completion_date: data.completionDate || "",
        // };
        const schoolQualification = ["10th", "12th"].includes(
          String(data.qualification || "")
            .trim()
            .toLowerCase(),
        );

        const body = {
          employee_id,
          qualification_id: data.qualification_id || null,
          degree_id: schoolQualification ? null : data.degree_id || null,
          school_id: data.school_id || null,
          field_of_study: schoolQualification ? "" : data.field || "",
          percentage: data.percentage || "",
          completion_date: data.completionDate || "",
        };

        // update API
        const res = await api.put("/employee/update_employee_education", body);
        let updatedItem = null;
        if (res?.data) {
          updatedItem = res.data.data || res.data.updated || res.data || null;
        }

        const newList = [...education];
        if (updatedItem) {
          const uiItem = {
            institution:
              updatedItem.school_name ||
              updatedItem.institution ||
              newEntry.institution,
            qualification:
              updatedItem.qualification_name ||
              updatedItem.qualification ||
              newEntry.qualification,
            field:
              updatedItem.degree_name ||
              updatedItem.field_of_study ||
              newEntry.field,
            percentage: updatedItem.percentage || newEntry.percentage,
            completion_date:
              updatedItem.completion_date ||
              updatedItem.completionDate ||
              newEntry.completion_date,
            qualification_id:
              updatedItem.qualification_id || newEntry.qualification_id,
            degree_id: updatedItem.degree_id || newEntry.degree_id,
            school_id: updatedItem.school_id || newEntry.school_id,
            // preserve ids if any
            _id: updatedItem._id || updatedItem.id || education_id,
          };
          newList[editingIndex] = uiItem;
        } else {
          // fallback: use local newEntry and preserve any existing server id
          newList[editingIndex] = {
            ...newList[editingIndex],
            ...newEntry,
            _id: education_id || newList[editingIndex]._id || null,
          };
        }

        setEducation(newList);
        try {
          localStorage.setItem("employee_education", JSON.stringify(newList));
        } catch (e) {}

        toast({
          title: "Education details updated",
          status: "success",
          duration: 1500,
          isClosable: true,
        });

        // reset modal/form state
        reset();
        setEditingIndex(null);
        onClose();
      } catch (err) {
        console.error("Update education failed", err);
        toast({
          title: "Update failed",
          description:
            err?.response?.data?.message ||
            err?.message ||
            "Unable to update education details",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }

      return;
    }

    // ADD MODE (existing behavior)
    try {
      // const body = {
      //   employee_id,
      //   qualification_id: data.qualification_id || null,
      //   degree_id: data.degree_id || null,
      //   school_id: data.school_id || null,
      //   percentage: data.percentage || "",
      //   completion_date: data.completionDate || "",
      // };
      const schoolQualification = ["10th", "12th"].includes(
        String(data.qualification || "")
          .trim()
          .toLowerCase(),
      );

      const body = {
        employee_id,
        qualification_id: data.qualification_id || null,
        degree_id: schoolQualification ? null : data.degree_id || null,
        school_id: data.school_id || null,
        field_of_study: schoolQualification ? "" : data.field || "",
        percentage: data.percentage || "",
        completion_date: data.completionDate || "",
      };
      if (Number(data.percentage) > 100) {
        toast({
          title: "Invalid Percentage",
          description: "Percentage cannot be more than 100.",
          status: "error",
          duration: 2000,
          isClosable: true,
        });
        return;
      }
      const res = await api.post("/employee/add_employee_education", body);
      let created =
        res?.data?.data ||
        res?.data?.created ||
        res?.data?.education ||
        (res?.data && typeof res.data === "object" ? res.data : null);
      const uiItem = created
        ? {
            institution:
              created.school_name ||
              created.institution ||
              newEntry.institution,
            qualification:
              created.qualification_name ||
              created.qualification ||
              newEntry.qualification,
            field:
              created.degree_name || created.field_of_study || newEntry.field,
            percentage: created.percentage || newEntry.percentage,
            completion_date:
              created.completion_date ||
              created.completionDate ||
              newEntry.completion_date,
            qualification_id:
              created.qualification_id || newEntry.qualification_id,
            degree_id: created.degree_id || newEntry.degree_id,
            school_id: created.school_id || newEntry.school_id,
            _id: created._id || created.id || null,
          }
        : { ...newEntry, _id: res?.data?._id || null };

      // append to local state
      setEducation((prev) => {
        const next = [...prev, uiItem];
        try {
          localStorage.setItem("employee_education", JSON.stringify(next));
        } catch (e) {}
        return next;
      });

      // If server didn't return an id, fetch the fresh list to ensure ids are cached
      if (!uiItem._id) {
        try {
          const orgId =
            typeof window !== "undefined"
              ? localStorage.getItem("org_code")
              : null;
          const q = `/employee/get_employee_education_details?employee_id=${encodeURIComponent(
            employee_id,
          )}${orgId ? `&org_id=${encodeURIComponent(orgId)}` : ""}`;
          const fetchRes = await api.get(q);
          const items = fetchRes?.data?.data ?? fetchRes?.data ?? [];
          if (Array.isArray(items)) {
            setEducation(items);
            try {
              localStorage.setItem("employee_education", JSON.stringify(items));
            } catch (e) {}
          }
        } catch (e) {}
      }

      toast({
        title: "Education Details Added",
        status: "success",
        duration: 1500,
        variant: "solid",
        isClosable: true,
      });

      reset();
      onClose();
    } catch (err) {
      console.error("Add education failed", err);
      toast({
        title: "Add failed",
        description:
          err?.response?.data?.message ||
          err?.message ||
          "Unable to add education details",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Qualification dropdown states
  const fetchQualifications = async (search = "") => {
    try {
      setLoadingQual(true);
      // const url = `/employee/qualifications${search ? `?search=${encodeURIComponent(search)}` : ""
      const url = `/employee/qualifications?org_id=${user?.org_id || user?.organisation_id}${search ? `&search=${encodeURIComponent(search)}` : ""}`;
      const res = await api.get(url);
      const items = res?.data?.data || [];
      setQualifications(items);
    } catch (err) {
      console.error("Failed to fetch qualifications", err);
      setQualifications([]);
    } finally {
      setLoadingQual(false);
    }
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchQualifications(query.trim());
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const clickedInsideQual =
        wrapperRef.current && wrapperRef.current.contains(e.target);
      const clickedInsideField =
        wrapperRefField.current && wrapperRefField.current.contains(e.target);
      const clickedInsideInst =
        wrapperRefInst.current && wrapperRefInst.current.contains(e.target);
      if (!clickedInsideQual) setShowDropdown(false);
      if (!clickedInsideField) setShowDropdownField(false);
      if (!clickedInsideInst) setShowDropdownInst(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Degrees fetch
  const fetchDegrees = async (search = "") => {
    try {
      setLoadingDeg(true);
      const url = `/employee/degrees${
        search ? `?search=${encodeURIComponent(search)}` : ""
      }`;
      const res = await api.get(url);
      const items = res?.data?.data || [];
      setDegrees(items);
    } catch (err) {
      console.error("Failed to fetch degrees", err);
      setDegrees([]);
    } finally {
      setLoadingDeg(false);
    }
  };

  useEffect(() => {
    if (debounceRefField.current) clearTimeout(debounceRefField.current);
    debounceRefField.current = setTimeout(() => {
      fetchDegrees(queryField.trim());
    }, 300);
    return () => clearTimeout(debounceRefField.current);
  }, [queryField]);

  // Schools fetch
  const fetchSchools = async (search = "") => {
    try {
      setLoadingSch(true);
      const url = `/employee/schools${
        search ? `?search=${encodeURIComponent(search)}` : ""
      }`;
      const res = await api.get(url);
      const items = res?.data?.data || [];
      setSchools(items);
    } catch (err) {
      console.error("Failed to fetch schools", err);
      setSchools([]);
    } finally {
      setLoadingSch(false);
    }
  };

  useEffect(() => {
    if (debounceRefInst.current) clearTimeout(debounceRefInst.current);
    debounceRefInst.current = setTimeout(() => {
      fetchSchools(queryInst.trim());
    }, 300);
    return () => clearTimeout(debounceRefInst.current);
  }, [queryInst]);

  //Delete functionality -
  const handleDelete = async (index) => {
    const item = education[index];
    const educationId = item?._id || item?.id || item?.education_id || null;

    // client-side check for employee saved
    const dbId =
      typeof window !== "undefined"
        ? localStorage.getItem("employee_db_id")
        : null;
    const empCode =
      getValues("employee_emp_code") ||
      (typeof window !== "undefined"
        ? localStorage.getItem("employee_emp_code")
        : null);

    if (!dbId && !empCode && !educationId) {
      toast({
        title: "Save basic info first",
        description:
          "Please save basic information before deleting education details.",
        status: "warning",

        duration: 2500,
      });
      return;
    }

    // Prefer deleting by education id if present
    if (educationId) {
      try {
        await deleteEmployeeEducation(educationId);
        const newList = education.filter((_, i) => i !== index);
        setEducation(newList);
        try {
          localStorage.setItem("employee_education", JSON.stringify(newList));
        } catch (e) {}
        toast({
          title: "Education details Deleted",
          status: "success",
          duration: 1500,
          isClosable: true,
          variant: "solid",
        });
      } catch (err) {
        console.error("Delete education failed", err);
        toast({
          title: "Delete failed",
          description:
            err?.response?.data?.message ||
            err?.message ||
            "Unable to delete education details",
          status: "error",
          duration: 3000,
        });
      }

      return;
    }

    // Fallback: update whole education details on employee record
    const idToUse = dbId || empCode;
    const opts = dbId ? { by: "id" } : { by: "emp_code" };
    const newList = education.filter((_, i) => i !== index);
    updateEmployee(idToUse, { education_details: newList }, opts)
      .then(() => {
        setEducation(newList);
        try {
          localStorage.setItem("employee_education", JSON.stringify(newList));
        } catch (e) {}
        toast({
          title: "Education details Deleted",
          status: "info",
          duration: 1500,
          isClosable: true,
        });
      })
      .catch((err) => {
        console.error("Delete education failed", err);
        toast({
          title: "Delete failed",
          description: err?.message || "Unable to delete education details",
          status: "error",
          duration: 3000,
        });
      });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "-";

    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();

    return `${dd}/${mm}/${yyyy}`;
  };

  // open modal for Add (clears edit state) or for Edit (prefills)
  const openAddModal = () => {
    setEditingIndex(null);
    reset({
      institution: "",
      qualification: "",
      field: "",
      percentage: "",
      completionDate: "",
      qualification_id: null,
      degree_id: null,
      school_id: null,
    });
    onOpen();
  };

  const openEditModal = (row, idx) => {
    // Prefill values - try multiple possible keys as your data shape may vary
    reset({
      institution: row.school_name || row.institution || "",
      qualification:
        row.qualification_name || row.qualification || row.qualification || "",
      field: row.degree_name || row.field || "",
      percentage: row.percentage || "",
      completionDate: row.completion_date || row.completionDate || "",
      qualification_id: row.qualification_id || row.qualification_id || null,
      degree_id: row.degree_id || row.degree_id || null,
      school_id: row.school_id || row.school_id || null,
    });

    // set editing index so onSubmit knows to update instead of create
    setEditingIndex(idx);
    onOpen();
  };

  return (
    <Box>
      <Box
        borderBottom="2px solid transparent"
        sx={{
          borderImage:
            "repeating-linear-gradient(to right, #C7C7C7 0 11px, transparent 11px 20px) 1",
        }}
        mt={-2}
        mb={2}
        ml={-2}
        mr={-2}
      ></Box>

      <Flex justify="flex-end" align="center" p={4}>
        <Button
          onClick={openAddModal}
          color="white"
          backgroundColor="#1A365D"
          _hover={{ bg: "#153e75" }}
          width={"121px"}
          fontWeight={"500"}
          borderRadius={"10px"}
        >
          Add
        </Button>
      </Flex>

      {/* Education Table */}
      <Table variant="simple">
        <Thead
          sx={{
            th: {
              fontFamily: "Poppins, sans-serif",
              fontWeight: 600,
              // textTransform: "capitalize",
              textTransform: "none",
              color: "black",
              h: "21px",
              w: "96px",
              fontSize: "14px",
            },
          }}
        >
          <Tr>
            <Th>Institution</Th>
            <Th>Qualification</Th>
            <Th>Field of study</Th>
            <Th>Percentage</Th>
            <Th>Date of completion</Th>
            <Th>Action</Th>
          </Tr>
        </Thead>
        <Tbody>
          {education.map((v, idx) => (
            <Tr
              key={idx}
              justifyContent={"center"}
              fontSize="13px"
              color="#000"
            >
              <Td>{v.school_name || v.institution}</Td>
              <Td>{v.qualification_name || v.qualification}</Td>
              <Td>{v.degree_name || v.field}</Td>
              <Td>{v.percentage}</Td>
              <Td>{formatDate(v.completion_date)}</Td>
              <Td>
                <Menu>
                  <MenuButton as={Button} size="sm" variant="ghost">
                    ...
                  </MenuButton>
                  <MenuList>
                    <MenuItem onClick={() => openEditModal(v, idx)}>
                      Edit
                    </MenuItem>
                    <MenuItem color="red.500" onClick={() => handleDelete(idx)}>
                      Delete
                    </MenuItem>
                  </MenuList>
                </Menu>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      {/* Education Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => {
          onClose();
          setEditingIndex(null);
          reset();
        }}
      >
        <ModalOverlay />
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalContent>
              <ModalHeader
                fontFamily="poppins"
                fontWeight={"600"}
                color={"#000"}
              >
                {editingIndex !== null
                  ? "Update Education Details"
                  : "Education Details"}
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                {/* Hidden id fields to send to API */}
                <input type="hidden" {...register("qualification_id")} />
                <input type="hidden" {...register("degree_id")} />
                <input type="hidden" {...register("school_id")} />
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
                  mr={-5}
                  ml={-5}
                  mt={-2}
                  mb={4}
                ></Box>
                {/* Institution */}
                <FormControl isRequired mb={3} ref={wrapperRefInst}>
                  <FormLabel
                    fontWeight="500"
                    fontSize={"14px"}
                    fontFamily={"Poppins"}
                  >
                    Institution
                  </FormLabel>
                  <Controller
                    name="institution"
                    control={methods.control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <>
                        <Input
                          maxLength={32}
                          {...field}
                          placeholder="Institution name"
                          onChange={(e) => {
                            field.onChange(e);
                            setQueryInst(e.target.value);
                            setShowDropdownInst(true);
                          }}
                          onFocus={() => {
                            setShowDropdownInst(true);
                            if (schools.length === 0) fetchSchools("");
                          }}
                          {...inputStyle}
                        />

                        {showDropdownInst && (
                          <Box
                            position="absolute"
                            left={0}
                            right={0}
                            mt={1}
                            bg="white"
                            border="1px solid #e2e8f0"
                            borderRadius="md"
                            zIndex={50}
                            maxH="200px"
                            overflowY="auto"
                          >
                            {loadingSch ? (
                              <Box p={2}>Loading...</Box>
                            ) : schools.length === 0 ? (
                              <Box p={2}>No results</Box>
                            ) : (
                              schools.map((s) => (
                                <Box
                                  key={s._id || s.id}
                                  px={3}
                                  py={2}
                                  _hover={{ bg: "gray.50", cursor: "pointer" }}
                                  onClick={() => {
                                    field.onChange(s.name);
                                    // store selected school id (prefer backend _id)
                                    setValue(
                                      "school_id",
                                      s._id || s.id || null,
                                    );
                                    setShowDropdownInst(false);
                                  }}
                                >
                                  {s.name}
                                </Box>
                              ))
                            )}
                          </Box>
                        )}
                      </>
                    )}
                  />
                </FormControl>

                {/* Qualification */}
                <FormControl
                  isRequired
                  mb={3}
                  ref={wrapperRef}
                  fontFamily={"Poppins"}
                >
                  <FormLabel fontWeight="500" fontSize={"14px"}>
                    Qualification
                  </FormLabel>
                  <Controller
                    name="qualification"
                    control={methods.control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <>
                        <Input
                          maxLength={32}
                          {...field}
                          placeholder="Enter qualification"
                          onChange={(e) => {
                            field.onChange(e);
                            setQuery(e.target.value);
                            setShowDropdown(true);
                          }}
                          onFocus={() => {
                            setShowDropdown(true);
                            if (qualifications.length === 0)
                              fetchQualifications("");
                          }}
                          {...inputStyle}
                        />

                        {showDropdown && (
                          <Box
                            position="absolute"
                            left={0}
                            right={0}
                            mt={1}
                            bg="white"
                            border="1px solid #e2e8f0"
                            borderRadius="md"
                            zIndex={50}
                            maxH="200px"
                            overflowY="auto"
                          >
                            {loadingQual ? (
                              <Box p={2}>Loading...</Box>
                            ) : qualifications.length === 0 ? (
                              <Box p={2}>No results</Box>
                            ) : (
                              qualifications?.map((q) => (
                                <Box
                                  key={q._id || q.id}
                                  px={3}
                                  py={2}
                                  _hover={{ bg: "gray.50", cursor: "pointer" }}
                                  // onClick={() => {
                                  //   field.onChange(q.name);
                                  //   setValue(
                                  //     "qualification_id",
                                  //     q._id || q.id || null,
                                  //   );
                                  //   setShowDropdown(false);
                                  // }}
                                  onClick={() => {
                                    field.onChange(q.name);

                                    setValue(
                                      "qualification_id",
                                      q._id || q.id || null,
                                    );

                                    if (
                                      ["10th", "12th"].includes(
                                        String(q.name).trim().toLowerCase(),
                                      )
                                    ) {
                                      setValue("field", "");
                                      setValue("degree_id", null);
                                      setQueryField("");
                                      clearErrors("field");
                                      setShowDropdownField(false);
                                    }

                                    setShowDropdown(false);
                                  }}
                                >
                                  {q.name}
                                </Box>
                              ))
                            )}
                          </Box>
                        )}
                      </>
                    )}
                  />
                </FormControl>

                {/* Field of study */}
                {/* <FormControl isRequired mb={3} ref={wrapperRefField}> */}
                <FormControl
                  isRequired={!isSchoolQualification}
                  isInvalid={!!errors.field}
                  mb={3}
                  ref={wrapperRefField}
                >
                  <FormLabel
                    fontWeight="500"
                    fontSize={"14px"}
                    fontFamily={"Poppins"}
                  >
                    Field of study
                  </FormLabel>
                  <Controller
                    // name="field"
                    // control={methods.control}
                    name="field"
                    control={methods.control}
                    rules={{
                      validate: (value) =>
                        isSchoolQualification ||
                        !!String(value || "").trim() ||
                        "Field of study is required",
                    }}
                    // rules={{ required: true }}
                    render={({ field }) => (
                      <>
                        <Input
                          {...field}
                          placeholder="Enter Field of study"
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            setQueryField(e.target.value);
                            setShowDropdownField(true);
                          }}
                          onFocus={() => {
                            setShowDropdownField(true);
                            if (degrees.length === 0) fetchDegrees("");
                          }}
                          {...inputStyle}
                        />

                        {showDropdownField && (
                          <Box
                            position="absolute"
                            left={0}
                            right={0}
                            mt={1}
                            bg="white"
                            border="1px solid #e2e8f0"
                            borderRadius="md"
                            zIndex={50}
                            maxH="200px"
                            overflowY="auto"
                          >
                            {loadingDeg ? (
                              <Box p={2}>Loading...</Box>
                            ) : degrees.length === 0 ? (
                              <Box p={2}>No results</Box>
                            ) : (
                              degrees.map((d) => (
                                <Box
                                  key={d._id || d.id}
                                  px={3}
                                  py={2}
                                  _hover={{ bg: "gray.50", cursor: "pointer" }}
                                  onClick={() => {
                                    field.onChange(d.name);
                                    // store selected degree id (prefer backend _id)
                                    setValue(
                                      "degree_id",
                                      d._id || d.id || null,
                                    );
                                    setShowDropdownField(false);
                                  }}
                                >
                                  {d.name}
                                </Box>
                              ))
                            )}
                          </Box>
                        )}
                      </>
                    )}
                  />
                  <FormErrorMessage fontFamily="Poppins" fontSize="12px">
                    {errors.field?.message}
                  </FormErrorMessage>
                </FormControl>

                {/* Percentage */}
                <FormControl isRequired mb={3} isInvalid={!!errors?.percentage}>
                  <FormLabel
                    fontWeight="500"
                    fontSize={"14px"}
                    fontFamily={"Poppins"}
                  >
                    Percentage
                  </FormLabel>
                  {/* <Input
                    {...register("percentage", { required: true })}
                    placeholder="Enter Percentage"
                    {...inputStyle}
                  /> */}
                  <Input
                    type="text"
                    placeholder="Enter Percentage"
                    {...register("percentage", {
                      required: "Percentage is required",
                      pattern: {
                        // value: /^[1-9][0-9]*$/,
                        value: /^(100(\.0+)?|[0-9]{1,2}(\.[0-9]+)?)$/,
                        // message: "Only numbers greater than 0 are allowed",
                        message: "Enter a valid percentage between 0 and 100",
                      },
                      // validate: (value) =>
                      //   Number(value) > 0 || "Percentage must be greater than 0",
                      validate: (value) =>
                        (Number(value) >= 0 && Number(value) <= 100) ||
                        "Percentage must be between 0 and 100",
                    })}
                    // onChange={(e) => {
                    //   e.target.value = e.target.value.replace(/[^0-9]/g, "");
                    // }}
                    onChange={(e) => {
                      let value = e.target.value;
                      value = value.replace(/[^0-9.]/g, "");
                      const parts = value.split(".");
                      if (parts.length > 2) {
                        value = parts[0] + "." + parts[1];
                      }

                      e.target.value = value;
                    }}
                    {...inputStyle}
                  />
                  <FormErrorMessage fontFamily="Poppins">
                    {errors?.percentage?.message}
                  </FormErrorMessage>
                </FormControl>

                {/* Date of Completion */}
                <FormControl
                  isRequired
                  isInvalid={!!errors?.completionDate}
                  mb={4}
                >
                  <FormLabel fontFamily={"poppins"} fontWeight={"500"}>
                    Date of completion
                  </FormLabel>
                  <Box position="relative">
                    <Controller
                      name="completionDate"
                      control={control}
                      rules={{
                        required: "Date of completion is required",
                        validate: {
                          notFuture: (value) => {
                            if (!value) return true;
                            const picked = new Date(value);
                            const now = new Date();
                            picked.setHours(0, 0, 0, 0);
                            now.setHours(0, 0, 0, 0);
                            return (
                              picked <= now ||
                              "Date of Completion cannot be in the future"
                            );
                          },
                        },
                      }}
                      render={({ field }) => (
                        <DatePicker
                          value={field.value}
                          onChange={field.onChange}
                          maxDate={today}
                          placeholder="dd/mm/yyyy"
                          inputProps={{
                            ...inputStyle,
                            fontWeight: 500,
                            fontSize: "14px",
                            paddingRight: "40px",
                          }}
                        />
                      )}
                    />
                    {/* <Image
                      src={calenderimg}   // 👈 apni image path
                      alt="calendar"
                      position="absolute"
                      right="12px"
                      top="50%"
                      transform="translateY(-50%)"
                      boxSize="18px"
                      pointerEvents="none"        // 👈 input click unaffected
                    /> */}
                  </Box>
                  <FormErrorMessage fontFamily="Poppins">
                    {errors?.completionDate?.message}
                  </FormErrorMessage>
                </FormControl>
              </ModalBody>

              <Flex justifyContent={"space-between"} p={4}>
                <Button
                  variant="ghost"
                  mr={3}
                  onClick={handleClear}
                  color={"#757575"}
                  width={"121px"}
                  borderRadius={"10px"}
                  fontFamily={"poppins"}
                >
                  Clear form
                </Button>
                <Button
                  type="submit"
                  color="white"
                  backgroundColor="#1A365D"
                  _hover={{ bg: "#153e75" }}
                  width={"121px"}
                  borderRadius={"10px"}
                >
                  {editingIndex !== null ? "Update" : "Save"}
                </Button>
              </Flex>
            </ModalContent>
          </form>
        </FormProvider>
      </Modal>
    </Box>
  );
}
