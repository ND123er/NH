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
import api from "../../../../../api/axios";
import { getOrgCode } from "../../../../../utils/token";

export default function NationalityEditModal({
  isOpen,
  onClose,
  nationality,
  onUpdated,
}) {
  const toast = useToast();

  const [formData, setFormData] = useState({
    nationality_name: "",
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

  // Populate form when modal opens / nationality changes
  useEffect(() => {
    if (!isOpen || !nationality) return;

    setError(null);
    setFormData({
      nationality_name: nationality.nationality_name || "",
      org_id: nationality.org_id || getOrgCode() || "",
    });
  }, [isOpen, nationality]);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdate = async () => {
    if (!nationality?._id) return;

    if (!formData.nationality_name.trim()) {
      toast({
        title: "Nationality name is required",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const url = `/organization/update_nationality/${nationality._id}`;
      const payload = {
        nationality_name: formData.nationality_name,
        org_id: formData.org_id || getOrgCode(),
      };

      await api.put(url, payload);

      toast({
        title: "Nationality updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      if (onUpdated) {
        await onUpdated();
      }

      onClose();
    } catch (err) {
      console.error("Failed to update nationality", err);
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update nationality"
      );
      toast({
        title: "Failed to update nationality",
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

  if (!nationality) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size="md">
      <ModalOverlay />
      <ModalContent fontFamily={"Poppins"}>
        <ModalHeader fontWeight="600">Edit Nationality</ModalHeader>
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
              <FormLabel fontSize="sm">Nationality Name</FormLabel>
              <Input
                value={formData.nationality_name}
                // onChange={handleChange("nationality_name")}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^A-Za-z\s]/g, "");
                  setFormData((prev) => ({
                    ...prev,
                    nationality_name: value,
                  }));
                }}
                placeholder="Enter Nationality name"
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
