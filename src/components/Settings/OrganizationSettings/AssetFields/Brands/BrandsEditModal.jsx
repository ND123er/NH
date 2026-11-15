// BrandsEditModal.jsx
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

export default function BrandsEditModal({ isOpen, onClose, brand, onUpdated }) {
  const toast = useToast();

  const [formData, setFormData] = useState({
    brand_name: "",
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

  // Populate form when modal opens / brand changes
  useEffect(() => {
    if (!isOpen || !brand) return;

    setError(null);
    setFormData({
      brand_name: brand.brand_name || "",
      organisation_id: brand.organisation_id || getOrgCode() || "",
    });
  }, [isOpen, brand]);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdate = async () => {
    if (!brand?._id) return;

    if (!formData.brand_name.trim()) {
      toast({
        title: "Brand name is required",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const url = `/organization/update_asset_brand/${brand._id}`;
      const payload = {
        brand_name: formData.brand_name,
        organisation_id: formData.organisation_id || getOrgCode(),
      };

      await api.put(url, payload);

      toast({
        title: "Brand updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      if (onUpdated) {
        await onUpdated();
      }

      onClose();
    } catch (err) {
      console.error("Failed to update brand", err);
      setError(
        err?.response?.data?.message || err?.message || "Failed to update brand"
      );
      toast({
        title: "Failed to update brand",
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

  if (!brand) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size="md">
      <ModalOverlay />
      <ModalContent fontFamily={"Poppins"}>
        <ModalHeader fontWeight="600">Edit Brand</ModalHeader>
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
              <FormLabel fontSize="sm">Brand name</FormLabel>
              <Input
                value={formData.brand_name}
                // onChange={handleChange("brand_name")}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^[a-zA-Z\s]*$/.test(value) || value === "") {
                    handleChange("brand_name")(e);
                  }
                }}
                placeholder="Enter Brand name"
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
