// JobTitleEditModal.jsx
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

export default function JobTitleEditModal({
  isOpen,
  onClose,
  jobTitle,
  onUpdated,
}) {
  const toast = useToast();

  const [formData, setFormData] = useState({
    position_name: "",
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

  // Populate form when modal opens / jobTitle changes
  useEffect(() => {
    if (!isOpen || !jobTitle) return;

    setError(null);
    setFormData({
      position_name: jobTitle.position_name || "",
      organisation_id: jobTitle.organisation_id || getOrgCode() || "",
    });
  }, [isOpen, jobTitle]);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdate = async () => {
    if (!jobTitle?._id) return;

    if (!formData.position_name.trim()) {
      toast({
        title: "Designation name is required",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const url = `/organization/update_position/${jobTitle._id}`;
      const payload = {
        position_name: formData.position_name,
        organisation_id: formData.organisation_id || getOrgCode(),
      };

      const response = await api.put(url, payload);
      toast({
        title: "Designation updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      if (onUpdated) {
        await onUpdated();
      }

      onClose();
    } catch (err) {
      console.error("Failed to update designation", err);
      // setError(
      //   err?.response?.data?.message ||
      //   err?.message ||
      //   "Failed to update designation"
      // );
      toast({
        title: "Failed to update designation",
        // description:
        //   err?.response?.data?.message ||
        //   err?.message ||
        //   "Something went wrong",
        description:
         err?.response?.data?.msg || err?.message ,
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

  if (!jobTitle) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size="md">
      <ModalOverlay />
      <ModalContent fontFamily={"Poppins"}>
        <ModalHeader fontWeight="600">Edit Designation</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          {/* {saving && (
            <Flex align="center" justify="center" py={2} gap={3}>
              <Spinner size="sm" />
              <Text>Saving changes...</Text>
            </Flex>
          )} */}

          {/* {error && (
            <Text color="red.500" mb={3} fontSize="sm">
              {error}
            </Text>
          )} */}

          <Box fontFamily={"Poppins"} mt={2}>
            <FormControl mb={3} isRequired>
              <FormLabel fontSize="sm">Designation name</FormLabel>
              <Input
                value={formData.position_name}
                // onChange={handleChange("position_name")}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^A-Za-z\s]/g, "");
                  setFormData((prev) => ({
                    ...prev,
                    position_name: value,
                  }));
                }}
                placeholder="Enter job title name"
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
