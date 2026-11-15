// AssetCategoriesEditModal.jsx
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

export default function AssetCategoriesEditModal({
  isOpen,
  onClose,
  category,
  onUpdated,
}) {
  const toast = useToast();

  const [formData, setFormData] = useState({
    category_name: "",
    category_code: "",
    organisation_id: "",
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

  // Populate form when modal opens / category changes
  useEffect(() => {
    if (!isOpen || !category) return;

    setError(null);
    setFormData({
      category_name: category.category_name || "",
      category_code: category.category_code || "",
      organisation_id: category.organisation_id || getOrgCode() || "",
    });
  }, [isOpen, category]);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdate = async () => {
    if (!category?._id) return;

    if (!formData.category_name.trim()) {
      toast({
        title: "Asset category name is required",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!formData.category_code.trim()) {
      toast({
        title: "Category code is required",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const url = `/organization/update_asset_category/${category._id}`;
      const payload = {
        category_name: formData.category_name,
        category_code: formData.category_code,
        organisation_id: formData.organisation_id || getOrgCode(),
      };

      await api.put(url, payload);

      toast({
        title: "Asset category updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      if (onUpdated) {
        await onUpdated();
      }

      onClose();
    } catch (err) {
      console.error("Failed to update asset category", err);
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update asset category"
      );
      toast({
        title: "Failed to update asset category",
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

  if (!category) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size="md">
      <ModalOverlay />
      <ModalContent fontFamily={"Poppins"}>
        <ModalHeader fontWeight="600">Edit Asset Category</ModalHeader>
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
              <FormLabel fontSize="sm">Asset category name</FormLabel>
              <Input
                maxLength={32}
                // value={formData.category_name}
                // onChange={handleChange("category_name")}
                value={formData.category_name}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^A-Za-z\s]/g, "");
                  setFormData((prev) => ({
                    ...prev,
                    category_name: value,
                  }));
                }}
                placeholder="Enter Asset category"
                {...inputStyle}
              />
            </FormControl>

            <FormControl mb={3} isRequired>
              <FormLabel fontSize="sm">Category Code</FormLabel>
              <Input
                maxLength={32}
                value={formData.category_code}
                // onChange={handleChange("category_code")}
                onChange={(e) => {
                  // ✅ Only letters & numbers allowed
                  const value = e.target.value.replace(/[^A-Za-z0-9]/g, "");
                  setFormData((prev) => ({
                    ...prev,
                    category_code: value,
                  }));
                }}
                placeholder="Enter Code"
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
