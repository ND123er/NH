// RolesEditModal.jsx
import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Button,
  Flex,
  Text,
  Spinner,
  useToast,
  Box,
} from "@chakra-ui/react";
import axios from "../../../../../api/axios";
import { getOrgCode } from "../../../../../utils/token";

export default function RolesEditModal({ isOpen, onClose, role, onUpdated }) {
  const toast = useToast();

  const [formData, setFormData] = useState({
    role_name: "",
    description: "",
    org_id: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    if (!isOpen || !role) return;

    setError(null);
    setFormData({
      role_name: role.role_name || "",
      description: role.description || "",
      org_id: role.org_id || getOrgCode() || "",
    });
  }, [isOpen, role]);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdate = async () => {
    if (!role?._id) return;

    if (!formData.role_name.trim()) {
      toast({
        title: "Role name is required",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const url = `/organization/update_role/${role._id}`;
      const payload = {
        role_name: formData.role_name,
        description: formData.description,
        org_id: formData.org_id || getOrgCode(),
      };

      await axios.put(url, payload);

      toast({
        title: "Role updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      if (onUpdated) {
        await onUpdated();
      }

      onClose();
    } catch (err) {
      console.error("Failed to update role", err);
      setError(
        err?.response?.data?.message || err?.message || "Failed to update role"
      );
      toast({
        title: "Failed to update role",
        description:
          err?.response?.data?.message ||
          err?.message ||
          "Something went wrong",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  if (!role) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size="md">
      <ModalOverlay />
      <ModalContent fontFamily={"Poppins"}>
        <ModalHeader fontWeight="600">Edit Role</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          {saving && (
            <Flex align="center" justify="center" py={2} gap={3}>
              <Spinner size="sm" />
              <Text>Saving changes...</Text>
            </Flex>
          )}

          {error && (
            <Text color="red.500" mb={3} fontSize="sm">
              {error}
            </Text>
          )}

          <Box fontFamily={"Poppins"} mt={2}>
            <FormControl mb={3} isRequired>
              <FormLabel fontSize="sm">Role name</FormLabel>
              <Input
                value={formData.role_name}
                onChange={handleChange("role_name")}
                placeholder="Enter role name"
                {...inputStyle}
              />
            </FormControl>

            <FormControl mb={3}>
              <FormLabel fontSize="sm">Description</FormLabel>
              <Input
                value={formData.description}
                onChange={handleChange("description")}
                placeholder="Enter description"
                {...inputStyle}
              />
            </FormControl>
          </Box>
        </ModalBody>

        <Flex p={4} justify={"space-between"}>
          <Button
            onClick={handleClose}
            size="sm"
            color={"#757575"}
            bg={"white"}
          >
            Cancel
          </Button>
          <Button
            bg="blue.900"
            color="white"
            _hover={{ bg: "blue.800" }}
            size="sm"
            onClick={handleUpdate}
            isLoading={saving}
          >
            Update
          </Button>
        </Flex>
      </ModalContent>
    </Modal>
  );
}
