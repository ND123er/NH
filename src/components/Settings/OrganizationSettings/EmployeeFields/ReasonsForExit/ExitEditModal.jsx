// ExitEditModal.jsx
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
} from "@chakra-ui/react";
import axios from "../../../../../api/axios";
import { getOrgCode } from "../../../../../utils/token";

export default function ExitEditModal({ isOpen, onClose, exitId, onUpdated }) {
  const toast = useToast();

  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const inputStyle = {
    fontFamily: "Poppins",
    fontSize: "15px",
    h: "55px",
    borderWidth: "1.5px",
    borderColor: "#D0D5DD",
    borderRadius: "8px",
  };

  useEffect(() => {
    if (!isOpen || !exitId) return;

    const fetchSingle = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `/settings/get_single_reason_for_exit/${exitId}`
        );
        setReason(res?.data?.data?.reason_name || "");
      } catch (err) {
        toast({
          title: "Failed to load exit reason",
          status: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSingle();
  }, [isOpen, exitId]);

  const handleUpdate = async () => {
    if (!reason.trim()) {
      toast({
        title: "Reason is required",
        status: "error",
      });
      return;
    }

    setSaving(true);
    try {
      await axios.put(`/settings/update_reason_of_exit/${exitId}`, {
        reason_name: reason,
        organisation_id: getOrgCode(),
      });

      toast({
        title: "Exit reason updated",
        status: "success",
        duration: 3000,
      });

      onUpdated();
      onClose();
    } catch (err) {
      toast({
        title: "Failed to update",
        description: err?.response?.data?.message || "Something went wrong",
        status: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay />
      <ModalContent fontFamily="Poppins">
        <ModalHeader>Edit Reason for Exit</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          {loading ? (
            <Flex justify="center" py={6}>
              <Spinner />
            </Flex>
          ) : (
            <FormControl isRequired>
              <FormLabel>Reason for Exit</FormLabel>
              <Input
                value={reason}
                // onChange={(e) => setReason(e.target.value)}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^A-Za-z\s]/g, "");
                  setReason(value);
                }}
                placeholder="Enter reason for exit"
                {...inputStyle}
              />
            </FormControl>
          )}
        </ModalBody>

        <Flex p={4} justify="space-between">
          <Button onClick={onClose} bg="white" color="#757575">
            Cancel
          </Button>
          <Button
            bg="blue.900"
            color="white"
            _hover={{ bg: "blue.800" }}
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
