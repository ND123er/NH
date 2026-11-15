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
import { useNavigate } from "react-router-dom";
import BreadcrumbsNav from "../../../../BreadCrumbsNav/BreadCrumbsNav";
import axios from "../../../../../api/axios";
import { getOrgCode } from "../../../../../utils/token";

export default function AddExitStatusForm() {
  const navigate = useNavigate();
  const toast = useToast();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({ mode: "onChange" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exit, setExit] = useState([]);

  useEffect(() => {
    const fetchExitReasons = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await axios.get(`/settings/get_reason_for_exit_list`, {
          params: { org_id: getOrgCode() },
        });
        if (res?.data?.success) {
          setExit(res.data.data || []);
        } else {
          setError("Failed to fetch exit reasons");
        }
      } catch (err) {
        console.error("Error fetching exit reasons:", err);
        setError("Something went wrong while fetching data");
      } finally {
        setLoading(false);
      }
    };
    fetchExitReasons();
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
      reason_name: data.exitStatus,
      organisation_id: getOrgCode(),
    };

    setIsSubmitting(true);

    try {
      const res = await axios.post("/settings/add_reason_of_exit", payload);

      if (res?.status === 200 || res?.status === 201) {
        toast({
          title: "Reason for Exit created successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        reset();
      }
    } catch (err) {
      const message =
        err?.response?.data?.message || "Failed to create Reason for Exit";

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
    <Box
      bg="white"
      borderRadius="14px"
      fontFamily="Poppins"
      p={6}
      boxShadow="sm"
      w="100%"
      mt={3}
      border="1px solid #cccccc"
    >
      <BreadcrumbsNav />

      <Flex align="center" justify="space-between" mb={4}>
        <Box fontWeight="bold" fontSize="xl">
          Add Reasons for Exit
        </Box>

        <Flex gap={4}>
          <Button
            bg="blue.900"
            color="white"
            borderRadius="14px"
            width="100px"
            _hover={{ bg: "blue.800" }}
            size="md"
            type="submit"
            form="add-exit-form"
            isLoading={isSubmitting}
          >
            Save
          </Button>

          <Button
            type="button"
            onClick={() => navigate(-1)}
            bg="white"
            color="#757575"
          >
            Cancel
          </Button>
        </Flex>
      </Flex>

      <form id="add-exit-form" onSubmit={handleSubmit(onSubmit)}>
        <FormControl isRequired isInvalid={!!errors.exitStatus}>
          <FormLabel>Reasons for Exit</FormLabel>
          <Input
            placeholder="Enter reason for exit"
            // {...register("exitStatus", { required: true })}
            {...register("exitStatus", {
              required: true,
              pattern: {
                value: /^[A-Za-z\s]+$/,
                message: "Only alphabets are allowed",
              },
              validate: (value) => {
                const enteredexitName = value
                  .trim()
                  .replace(/\s+/g, " ")
                  .toLowerCase();

                const exiting = exit.some(
                  (t) =>
                    t?.reason_name
                      ?.trim()
                      .replace(/\s+/g, " ")
                      .toLowerCase() === enteredexitName,
                );
                return !exiting || "Role Name already exists";
              },
            })}
            // onChange={(e) => {
            //   e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, "");
            // }}
            onChange={(e) => {
              let value = e.target.value.replace(/[^A-Za-z\s]/g, "");

              setValue("exitStatus", value, {
                shouldValidate: true,
                shouldDirty: true,
              });
            }}
            {...inputStyle}
          />
          {errors.exitStatus && (
            <Text color="red.500" fontSize="sm" mt={1}>
              {errors.exitStatus.message}
            </Text>
          )}
        </FormControl>
      </form>
    </Box>
  );
}
