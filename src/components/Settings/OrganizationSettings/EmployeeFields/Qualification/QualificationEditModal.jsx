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

export default function QualificationEditModal({
  isOpen,
  onClose,
  qualificationId,
  onUpdated,
}) {
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: "",
  });

  const [loading, setLoading] = useState(false);
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
    if (!isOpen || !qualificationId) return;

    const fetchSingleQualification = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `/settings/get_single_qualification/${qualificationId}`;
        const res = await api.get(url);
        const data = res?.data?.data;

        if (data) {
          setFormData({
            name: data.name || data.qualification_name || "",
          });
        }
      } catch (err) {
        console.error("Failed to fetch qualification", err);
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load qualification details",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSingleQualification();
  }, [isOpen, qualificationId]);

  const handleChange = (e) => {
    const value = e.target.value.replace(/[^a-zA-Z0-9\s]/g, "");
    setFormData({ name: value });
  };

  const handleUpdate = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Qualification is required",
        status: "error",
        duration: 3000,
      });
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const url = `/settings/update_qualification/${qualificationId}`;
      await api.put(url, { name: formData.name.trim() });

      toast({
        title: "Qualification updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      if (onUpdated) {
        await onUpdated();
      }

      onClose();
    } catch (err) {
      console.error("Failed to update qualification", err);
      toast({
        title: "Failed to update qualification",
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay />
      <ModalContent fontFamily={"Poppins"}>
        <ModalHeader fontWeight="600">Edit Qualification</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          {loading ? (
            <Flex align="center" justify="center" py={8} gap={3}>
              <Spinner />
              <Text>Loading qualification...</Text>
            </Flex>
          ) : error ? (
            <Text color="red.500" mb={3} fontSize="sm">
              {error}
            </Text>
          ) : (
            <Box>
              <FormControl mb={3} isRequired>
                <FormLabel fontSize="sm">Qualification</FormLabel>
                <Input
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter qualification"
                  {...inputStyle}
                />
              </FormControl>
            </Box>
          )}
        </ModalBody>

        <Flex p={4} justify={"space-between"}>
          <Button onClick={onClose} size="sm" color={"#757575"} bg={"white"}>
            Cancel
          </Button>
          <Button
            bg="blue.900"
            color="white"
            _hover={{ bg: "blue.800" }}
            size="sm"
            onClick={handleUpdate}
            isLoading={saving}
            isDisabled={loading}
          >
            Update
          </Button>
        </Flex>
      </ModalContent>
    </Modal>
  );
}
