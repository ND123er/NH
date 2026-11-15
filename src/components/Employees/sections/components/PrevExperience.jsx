import React, { useState, useEffect } from "react";
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
  Text,
} from "@chakra-ui/react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import api from "../../../../api/axios";
// import { updateEmployee } from "../../../../api/employee";
import { deleteEmployeePreviousExperience } from "../../../../api/employee";
import { getOrgCode } from "../../../../utils/token";
import { useFormContext } from "react-hook-form";
import { DatePicker } from "../../../../layouts/DatePicker";

export default function PrevExperience() {
  const [experience, setExperience] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);

  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const raw = localStorage.getItem("employee_prev_experience");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) setExperience(parsed);
      }
    } catch (e) {
      console.warn("Failed to initialize previous experience from storage", e);
    }
  }, []);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const methods = useForm();
  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = methods;
  const methods2 = useFormContext();
  const { getValues } = methods2;

  const prevExpStart = watch("previous_experience_start");
  const prevExpEnd = watch("previous_experience_end");

  const prevExpStartDateObj = prevExpStart ? new Date(prevExpStart) : null;
  const prevExpEndDateObj = prevExpEnd ? new Date(prevExpEnd) : null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

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

  // Open modal for adding (clears edit state)
  const openAddModal = () => {
    setEditingIndex(null);
    reset({
      name: "",
      title: "",
      previous_experience_start: "",
      previous_experience_end: "",
      description: "",
    });
    onOpen();
  };

  // Open modal to edit a specific row (prefill)
  const openEditModal = (row, idx) => {
    reset({
      name: String(row.name || row.company_name || "").trim(),
      title: String(row.title || row.job_title || "").trim(),
      previous_experience_start:
        row.start || row.start_date || row.previous_experience_start || "",
      previous_experience_end:
        row.end || row.end_date || row.previous_experience_end || "",
      description: String(row.description || row.job_description || "").trim(),
    });
    setEditingIndex(idx);
    onOpen();
  };

  // Add or Update handler
  const onSubmit = async (data) => {
    const dbId =
      typeof window !== "undefined"
        ? localStorage.getItem("employee_db_id")
        : null;

    const empCode =
      getValues("employee_emp_code") ||
      (typeof window !== "undefined"
        ? localStorage.getItem("employee_emp_code")
        : null);

    if (!dbId && !empCode) {
      toast({
        title: "Save basic info first",
        description:
          "Please save basic information before adding previous experience.",
        status: "warning",
        duration: 2500,
      });
      return;
    }

    const employee_id = dbId || empCode;

    // Trim and sanitize inputs
    const cleanName = String(data.name || "").trim();
    const cleanTitle = String(data.title || "").trim();
    const cleanDescription = String(data.description || "").trim();

    // Build UI entry
    const newEntry = {
      name: cleanName,
      title: cleanTitle,
      start: data.previous_experience_start || "",
      end: data.previous_experience_end || "",
      description: cleanDescription,
    };

    // EDIT MODE: call dedicated update endpoint
    if (editingIndex !== null && editingIndex >= 0) {
      try {
        const existing = experience[editingIndex] || {};
        // try to extract an id of the specific experience entry if available
        const previous_experience_id =
          existing._id ||
          existing.id ||
          existing.previous_experience_id ||
          null;

        // update body
        const body = {
          employee_id,
          // ...(previous_experience_id ? { previous_experience_id } : {}),
          company_name: cleanName || "",
          job_title: cleanTitle || "",
          job_description: cleanDescription || "",
          start_date: data.previous_experience_start || "",
          end_date: data.previous_experience_end || "",
        };

        // update api
        const res = await api.put("/employee/update_previous_experience", body);

        // prefer server returned updated object if present
        let updatedItem = null;
        if (res?.data) {
          updatedItem = res.data.data || res.data.updated || res.data || null;
        }

        const newList = [...experience];
        if (updatedItem) {
          // map server response to UI shape
          const uiItem = {
            name: updatedItem.company_name || updatedItem.name || newEntry.name,
            title: updatedItem.job_title || updatedItem.title || newEntry.title,
            start:
              updatedItem.start_date || updatedItem.start || newEntry.start,
            end: updatedItem.end_date || updatedItem.end || newEntry.end,
            description:
              updatedItem.job_description ||
              updatedItem.description ||
              newEntry.description,
            // preserve id
            _id: updatedItem._id || updatedItem.id || previous_experience_id,
          };
          newList[editingIndex] = uiItem;
        } else {
          // fallback: replace locally and keep any existing id
          newList[editingIndex] = {
            ...newList[editingIndex],
            ...newEntry,
            _id: previous_experience_id || newList[editingIndex]._id || null,
          };
        }

        setExperience(newList);
        try {
          localStorage.setItem(
            "employee_prev_experience",
            JSON.stringify(newList),
          );
        } catch (e) {}

        toast({
          title: "Previous experience updated",
          status: "success",
          duration: 1500,
          isClosable: true,
        });

        reset();
        setEditingIndex(null);
        onClose();
      } catch (err) {
        console.error("Update experience failed", err);
        toast({
          title: "Update failed",
          description:
            err?.response?.data?.message ||
            err?.message ||
            "Unable to update experience",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
      return;
    }

    // ADD MODE (existing behavior)
    const body = {
      employee_id,
      company_name: data.name || "",
      job_title: data.title || "",
      job_description: data.description || "",
      start_date: data.previous_experience_start || "",
      end_date: data.previous_experience_end || "",
    };

    try {
      // await api.post("/employee/add_previous_exprience", body);
      // const appended = {
      //   name: data.name,
      //   title: data.title,
      //   start: data.previous_experience_start || "",
      //   end: data.previous_experience_end || "",
      //   description: data.description || "",
      // };
      // setExperience((prev) => {
      //   const next = [...prev, appended];
      //   try {
      //     localStorage.setItem(
      //       "employee_prev_experience",
      //       JSON.stringify(next)
      //     );
      //   } catch (e) { }
      //   return next;
      // });
      await api.post("/employee/add_previous_exprience", body);

      // Get the newly saved experience with its actual backend ID
      const employeeCode =
        getValues("employee_emp_code") ||
        localStorage.getItem("employee_emp_code");

      const orgId = getOrgCode();

      const res = await api.get("/employee/get_employee_previous_experience", {
        params: {
          employee_id: employeeCode,
          org_id: orgId,
        },
      });

      if (res.data?.success === false) {
        throw new Error(res.data?.msg || "Failed to fetch experience");
      }

      const updatedExperiences = (res.data?.data || []).map((item) => ({
        _id: item._id,
        name: item.company_name,
        title: item.job_title,
        description: item.job_description,
        start: item.start_date,
        end: item.end_date,
      }));

      setExperience(updatedExperiences);

      localStorage.setItem(
        "employee_prev_experience",
        JSON.stringify(updatedExperiences),
      );

      toast({
        title: "Previous Experience Added",
        status: "success",
        duration: 1500,
        isClosable: true,
      });

      reset();
      onClose();
    } catch (err) {
      console.error("Add experience failed", err);
      toast({
        title: "Add failed",
        description:
          err?.response?.data?.msg ||
          err?.message ||
          "Unable to add experience",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Delete functionality
  // const handleDelete = (index) => {
  //   const newList = experience.filter((_, i) => i !== index);
  //   const dbId =
  //     typeof window !== "undefined"
  //       ? localStorage.getItem("employee_db_id")
  //       : null;

  //   const empCode =
  //     getValues("employee_emp_code") ||
  //     (typeof window !== "undefined"
  //       ? localStorage.getItem("employee_emp_code")
  //       : null);

  //   if (!dbId && !empCode) {
  //     toast({
  //       title: "Save basic info first",
  //       description:
  //         "Please save basic information before deleting experience.",
  //       status: "warning",
  //       duration: 2500,
  //     });
  //     return;
  //   }
  //   const idToUse = dbId || empCode;
  //   const opts = dbId ? { by: "id" } : { by: "emp_code" };
  //   updateEmployee(idToUse, { previous_experience: newList }, opts)
  //     .then(() => {
  //       setExperience(newList);
  //       try {
  //         localStorage.setItem(
  //           "employee_prev_experience",
  //           JSON.stringify(newList)
  //         );
  //       } catch (e) { }
  //       toast({
  //         title: "Previous Experience Deleted",
  //         status: "info",
  //         duration: 1500,
  //         isClosable: true,
  //       });
  //     })
  //     .catch((err) => {
  //       console.error("Delete experience failed", err);
  //       toast({
  //         title: "Delete failed",
  //         description: err?.message || "Unable to delete experience",
  //         status: "error",
  //         duration: 3000,
  //         isClosable: true,
  //       });
  //     });
  // };

  const handleDelete = async (index) => {
    const selectedExperience = experience[index];

    const experienceId = selectedExperience?._id;

    if (!experienceId) {
      toast({
        title: "Delete failed",
        description: "Previous experience ID is missing.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await deleteEmployeePreviousExperience(experienceId);

      if (response?.success === false) {
        throw new Error(response?.msg || "Unable to delete experience");
      }

      const newList = experience.filter((_, i) => i !== index);

      setExperience(newList);

      localStorage.setItem("employee_prev_experience", JSON.stringify(newList));

      toast({
        title: "Previous Experience Deleted",
        status: "success",
        duration: 1500,
        isClosable: true,
      });
    } catch (err) {
      console.error("Delete experience failed", err);

      toast({
        title: "Delete failed",
        description: err?.message || err?.msg || "Unable to delete experience",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
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

  return (
    <Box>
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
        mr={-2}
        ml={-2}
        mt={-2}
        mb={4}
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

      {/* experience Table */}
      <Table variant="simple">
        <Thead
          sx={{
            th: {
              fontFamily: "Poppins, sans-serif",
              fontWeight: 600,
              // textTransform: "capitalize",
              color: "black",
              h: "21px",
              w: "96px",
              fontSize: "14px",
              textTransform: "none",
            },
          }}
        >
          <Tr>
            <Th>Company name</Th>
            <Th>Job title</Th>
            <Th>Start date</Th>
            <Th>End date</Th>
            <Th>Job description</Th>
            <Th textAlign={"center"} pl={{ base: "8px", md: "0px" }}>
              Action
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {experience.map((v, idx) => (
            <Tr
              key={idx}
              justifyContent={"center"}
              fontSize="13px"
              color="#000"
            >
              <Td>{v.name}</Td>
              <Td>{v.title}</Td>
              <Td>{formatDate(v.start)}</Td>
              <Td>{formatDate(v.end)}</Td>
              <Td>{v.description}</Td>
              <Td textAlign={"center"}>
                <Menu>
                  <MenuButton as={Button} size="sm" variant="ghost">
                    ...
                  </MenuButton>
                  <MenuList>
                    <MenuItem
                      onClick={() => {
                        openEditModal(v, idx);
                      }}
                    >
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

      {/* Add / Edit Modal */}
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
                color={"#000"}
                fontWeight={"600"}
                fontFamily={"poppins"}
              >
                {editingIndex !== null
                  ? "Update Previous Experience"
                  : "Previous Experience"}
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                {/* Employer name */}
                <Box
                  borderBottom="2px solid transparent"
                  sx={{
                    borderImage:
                      "repeating-linear-gradient(to right, #C7C7C7 0 11px, transparent 11px 20px) 1",
                  }}
                  mt={-2}
                  mb={6}
                  ml={-5}
                  mr={-5}
                ></Box>
                <FormControl isRequired mb={3} isInvalid={!!errors?.name}>
                  <FormLabel
                    fontWeight="600"
                    fontFamily={"Poppins"}
                    fontSize={"14px"}
                  >
                    Company name
                  </FormLabel>
                  <Input
                    maxLength={32}
                    {...register("name", {
                      required: "Company name is required",
                      validate: (v) =>
                        (v && v.trim().length > 0) ||
                        "Company name cannot be empty",
                    })}
                    {...inputStyle}
                    placeholder="Company Name"
                  />
                  <FormErrorMessage>{errors?.name?.message}</FormErrorMessage>
                </FormControl>

                {/* Job title */}
                <FormControl isRequired mb={3} isInvalid={!!errors?.title}>
                  <FormLabel
                    fontWeight="600"
                    fontFamily={"Poppins"}
                    fontSize={"14px"}
                  >
                    Job title
                  </FormLabel>
                  <Input
                    maxLength={32}
                    {...register("title", {
                      required: "Job title is required",
                      validate: (v) =>
                        (v && v.trim().length > 0) ||
                        "Job title cannot be empty",
                    })}
                    {...inputStyle}
                    placeholder="Enter Job Title"
                  />
                  <FormErrorMessage>{errors?.title?.message}</FormErrorMessage>
                </FormControl>

                {/* Previous experience start date */}
                <FormControl
                  isRequired
                  mb={3}
                  isInvalid={!!errors?.previous_experience_start}
                >
                  <FormLabel>Start date</FormLabel>

                  <Controller
                    name="previous_experience_start"
                    control={control}
                    rules={{
                      required: "Start date is required",
                      validate: {
                        notFuture: (value) => {
                          if (!value) return true;
                          const d = new Date(value);
                          d.setHours(0, 0, 0, 0);
                          return (
                            d <= today || "Start date cannot be in the future"
                          );
                        },
                        notAfterEnd: (value) => {
                          if (!value || !prevExpEnd) return true;
                          const start = new Date(value);
                          const end = new Date(prevExpEnd);
                          start.setHours(0, 0, 0, 0);
                          end.setHours(0, 0, 0, 0);
                          return (
                            start < end || "Start date must be before end date"
                          );
                        },
                      },
                    }}
                    render={({ field }) => (
                      <DatePicker
                        placeholder="dd/mm/yyyy"
                        value={field.value}
                        onChange={field.onChange}
                        maxDate={prevExpEndDateObj || today}
                        inputProps={inputStyle}
                      />
                    )}
                  />

                  <FormErrorMessage>
                    {errors?.previous_experience_start?.message}
                  </FormErrorMessage>
                </FormControl>

                {/* Previous experience end date */}
                <FormControl
                  isRequired
                  mb={3}
                  isInvalid={!!errors?.previous_experience_end}
                >
                  <FormLabel>End date</FormLabel>
                  <Controller
                    name="previous_experience_end"
                    control={control}
                    rules={{
                      required: "End date is required",
                      validate: {
                        notFuture: (value) => {
                          if (!value) return true;
                          const d = new Date(value);
                          d.setHours(0, 0, 0, 0);
                          return (
                            d <= today || "End date cannot be in the future"
                          );
                        },
                        notBeforeStart: (value) => {
                          if (!value || !prevExpStart) return true;
                          const start = new Date(prevExpStart);
                          const end = new Date(value);
                          start.setHours(0, 0, 0, 0);
                          end.setHours(0, 0, 0, 0);
                          // require end to be strictly after start (not same)
                          return (
                            end > start || "End date must be after start date"
                          );
                        },
                      },
                    }}
                    render={({ field }) => (
                      <DatePicker
                        placeholder="dd/mm/yyyy"
                        value={field.value}
                        onChange={field.onChange}
                        minDate={prevExpStartDateObj || undefined}
                        maxDate={today}
                        inputProps={inputStyle}
                      />
                    )}
                  />
                  <FormErrorMessage>
                    {errors?.previous_experience_end?.message}
                  </FormErrorMessage>
                </FormControl>

                {/* Job description */}
                <FormControl
                  isRequired
                  mb={3}
                  isInvalid={!!errors?.description}
                >
                  <FormLabel
                    fontWeight="600"
                    fontFamily={"Poppins"}
                    fontSize={"14px"}
                  >
                    Job description
                  </FormLabel>
                  <Input
                    {...register("description", {
                      required: "Job description is required",
                      validate: (v) =>
                        (v && v.trim().length > 0) ||
                        "Job description cannot be empty",
                    })}
                    {...inputStyle}
                    placeholder="Job Description"
                  />
                  <FormErrorMessage>
                    {errors?.description?.message}
                  </FormErrorMessage>
                </FormControl>
              </ModalBody>

              <Flex justifyContent={"space-between"} p={4}>
                <Button
                  variant="ghost"
                  mr={3}
                  onClick={() => reset()}
                  color={"#757575"}
                  width={"121px"}
                  fontFamily={"poppins"}
                  fontWeight={"500"}
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
                  fontFamily={"poppins"}
                  fontWeight={"500"}
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
