import React, { useState, useEffect } from "react";
import {
  Box,
  Text,
  Button,
  Flex,
  Input,
  FormControl,
  FormLabel,
  useToast,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { Routes, Route, useNavigate } from "react-router-dom";
import BreadcrumbsNav from "../../../../BreadCrumbsNav/BreadCrumbsNav";
import SetRoles from "./setRoles/SetRoles";
import axios from "../../../../../api/axios";
import { getOrgCode } from "../../../../../utils/token";

export default function AddRolesForm() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ mode: "onChange" });
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [existingRoles, setExistingRoles] = useState([]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const orgId = getOrgCode();

        const res = await axios.get(
          `/settings/get_company_roles_list?org_id=${encodeURIComponent(
            orgId || "",
          )}`,
        );

        setExistingRoles(res?.data?.roles || []);
      } catch (err) {
        console.error("Error fetching roles:", err);
        setExistingRoles([]);
      }
    };

    fetchRoles();
  }, []);

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

  const onSubmit = async (data) => {
    const payload = {
      role_name: data.roleName,
      org_id: getOrgCode(),
      description: data.description || "",
    };

    setIsSubmitting(true);
    try {
      const res = await axios.post("/settings/create_role", payload);
      // You can adjust success detection based on your API's response shape
      if (res && (res.status === 200 || res.status === 201)) {
        toast({
          title: "Role created",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        reset();
        navigate("set-roles");
      } else {
        toast({
          title: "Unexpected response",
          description: "Role may not have been created.",
          status: "warning",
          duration: 4000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error("Error creating role:", err);
      const message =
        err?.response?.data?.message || err.message || "Failed to create role";
      toast({
        title: "Error",
        description: message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Routes>
        <Route path="set-roles" element={<SetRoles />} />
        <Route
          path="/"
          element={
            <Box
              bg="white"
              borderRadius="12px"
              p={6}
              boxShadow="sm"
              w={"100%"}
              mt={3}
              border={"1px solid #cccccc"}
            >
              <BreadcrumbsNav />
              <Box borderRadius={"10px"} border={"1px solid #cccccc"} p={8}>
                <Flex align="center" justify="space-between" mb={4}>
                  <Box fontWeight="bold" fontSize="xl">
                    Add Roles
                  </Box>
                </Flex>
                <form id="add-roles"
                noValidate
                onSubmit={handleSubmit(onSubmit)}>
                  <Flex gap={4} mb={4}>
                    <FormControl isRequired isInvalid={!!errors.roleName}>
                      <FormLabel>Role name</FormLabel>
                      <Input
                        placeholder="Enter role name"
                        // {...register("roleName", {
                        //   required: true,

                        //   validate: (value) => {
                        //     if (value.trim() !== value) {
                        //       return "Spaces at the beginning or end are not allowed";
                        //     }

                        //     if (/\s{2,}/.test(value)) {
                        //       return "Only one space is allowed between words";
                        //     }

                        //     const enteredRoleName = value.trim().toLowerCase();

                        //     const roleAlreadyExists = existingRoles.some(
                        //       (role) =>
                        //         role?.role_name?.trim().toLowerCase() ===
                        //         enteredRoleName,
                        //     );

                        //     return (
                        //       !roleAlreadyExists || "Role Name already exists"
                        //     );
                        //   },
                        // })}
                        {...register("roleName", {
                          required: "Role name is required",

                          validate: (value) => {
                            if (!value.trim()) {
                              return "Role name cannot contain only spaces";
                            }

                            if (value.trim() !== value) {
                              return "Spaces at the beginning or end are not allowed";
                            }

                            if (/\s{2,}/.test(value)) {
                              return "Only one space is allowed between words";
                            }

                            const enteredRoleName = value.trim().toLowerCase();

                            const roleAlreadyExists = existingRoles.some(
                              (role) =>
                                role?.role_name?.trim().toLowerCase() ===
                                enteredRoleName,
                            );

                            return (
                              !roleAlreadyExists || "Role Name already exists"
                            );
                          },
                        })}
                        {...inputStyle}
                      />
                      {errors.roleName && (
                        <Text color="red.500" fontSize="sm" mt={1}>
                          {errors.roleName.message}
                        </Text>
                      )}
                    </FormControl>
                    {/* <FormControl isRequired>
                      <FormLabel>mail</FormLabel>
                      <Input
                        placeholder="Enter mail"
                        {...register("mail", { required: true })}
                      />
                    </FormControl> */}
                  </Flex>

                  <Flex gap={4} mb={4}>
                    {/* <FormControl isRequired>
                      <FormLabel>Description</FormLabel>
                      <Input
                        placeholder="Enter description"
                        {...register("description", { required: true })}
                        {...inputStyle}
                      />
                    </FormControl> */}
                    <FormControl isRequired isInvalid={!!errors.description}>
                      <FormLabel>Description</FormLabel>

                      <Input
                        placeholder="Enter description"
                        {...register("description", {
                          required: "Description is required",

                          validate: (value) => {
                            if (!value.trim()) {
                              return "Description cannot contain only spaces";
                            }

                            if (value.trim() !== value) {
                              return "Spaces at the beginning or end are not allowed";
                            }

                            if (/\s{2,}/.test(value)) {
                              return "Only one space is allowed between words";
                            }

                            return true;
                          },
                        })}
                        {...inputStyle}
                      />

                      {errors.description && (
                        <Text color="red.500" fontSize="sm" mt={1}>
                          {errors.description.message}
                        </Text>
                      )}
                    </FormControl>
                  </Flex>
                </form>

                <Flex justifyContent={"flex-end"}>
                  <Button
                    bg="blue.900"
                    color="white"
                    borderRadius="5px"
                    _hover={{ bg: "blue.800" }}
                    size="md"
                    type="submit"
                    form="add-roles"
                    // onClick={() => navigate("set-roles")}
                  >
                    Save & Proceed to set role {">"}
                  </Button>
                </Flex>
              </Box>
            </Box>
          }
        />
      </Routes>
    </>
  );
}
