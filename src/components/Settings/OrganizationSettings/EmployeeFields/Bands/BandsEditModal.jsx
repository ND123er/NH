// BandsEditModal.jsx
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
  Spinner,
  Flex,
  Text,
  useToast,
  Box,
} from "@chakra-ui/react";
import api from "../../../../../api/axios";
import { getOrgCode } from "../../../../../utils/token";

export default function BandsEditModal({ isOpen, onClose, band, onUpdated }) {
  const toast = useToast();

  const [formData, setFormData] = useState({
    band_name: "",
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

  // Populate form when modal opens / band changes
  useEffect(() => {
    if (!isOpen || !band) return;

    setError(null);
    setFormData({
      band_name: band.band_name || "",
      organisation_id: band.organisation_id || getOrgCode() || "",
    });
  }, [isOpen, band]);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdate = async () => {
    if (!band?._id) return;

    if (!formData.band_name.trim()) {
      toast({
        title: "Band name is required",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const url = `/organization/update_band/${band._id}`;
      const payload = {
        band_name: formData.band_name,
        organisation_id: formData.organisation_id || getOrgCode(),
      };

      await api.put(url, payload);

      toast({
        title: "Band updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      if (onUpdated) {
        await onUpdated();
      }

      onClose();
    } catch (err) {
      console.error("Failed to update band", err);
      setError(
        err?.response?.data?.message || err?.message || "Failed to update band"
      );
      toast({
        title: "Failed to update band",
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

  if (!band) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size="md">
      <ModalOverlay />
      <ModalContent fontFamily={"Poppins"}>
        <ModalHeader fontWeight="600">Edit Band</ModalHeader>
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
              <FormLabel fontSize="sm">Band name</FormLabel>
              <Input
                value={formData.band_name}
                onChange={handleChange("band_name")}
                // onChange={(e) => {
                //   const value = e.target.value;
                //   // ✅ Only alphabets & space allowed
                //   if (/^[A-Za-z\s]*$/.test(value)) {
                //     setFormData((prev) => ({
                //       ...prev,
                //       band_name: value,
                //     }));
                //   }
                // }}
                placeholder="Enter band name"
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
