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
import axios from "../../../api/axios";
import { getOrgCode } from "../../../utils/token";

export default function CalendarEditModal({
  isOpen,
  onClose,
  calendarId,
  onUpdated,
}) {
  const toast = useToast();

  const [formData, setFormData] = useState({
    financial_year_start: "",
    financial_year_end: "",
    leave_year_start: "",
    leave_year_end: "",
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchCalendar = async () => {
      setLoading(true);
      setError(null);
      try {
        const orgId = getOrgCode();
        const res = await axios.get(`/settings/get_company_calendar/${orgId}`);
        const data = res?.data?.data;

        if (data) {
          const toDate = (v) => (v ? v.split("T")[0] : "");

          setFormData({
            financial_year_start: toDate(data.financial_year_start),
            financial_year_end: toDate(data.financial_year_end),
            leave_year_start: toDate(data.leave_year_start),
            leave_year_end: toDate(data.leave_year_end),
          });
        }
      } catch (err) {
        console.error("Failed to fetch calendar", err);
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load calendar data",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCalendar();
  }, [isOpen]);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const isValidDateRange = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (start === end) {
      return "Start date and end date cannot be the same";
    }

    if (endDate <= startDate) {
      return "End date must be greater than start date";
    }

    return null;
  };

  const handleUpdate = async () => {
    const {
      financial_year_start,
      financial_year_end,
      leave_year_start,
      leave_year_end,
    } = formData;

    if (
      !financial_year_start ||
      !financial_year_end ||
      !leave_year_start ||
      !leave_year_end
    ) {
      toast({
        title: "All fields are required",
        status: "error",
        duration: 3000,
      });
      return;
    }

    const fyError = isValidDateRange(financial_year_start, financial_year_end);
    if (fyError) {
      toast({
        title: "Invalid financial year",
        description: fyError,
        status: "error",
        duration: 4000,
      });
      return;
    }

    const lyError = isValidDateRange(leave_year_start, leave_year_end);
    if (lyError) {
      toast({
        title: "Invalid leave year",
        description: lyError,
        status: "error",
        duration: 4000,
      });
      return;
    }

    // Leave year must lie within financial year
    // if (
    //   leave_year_start < financial_year_start ||
    //   leave_year_end > financial_year_end
    // ) {
    //   toast({
    //     title: "Invalid leave year range",
    //     description: "Leave year must fall within the financial year range",
    //     status: "error",
    //     duration: 4000,
    //   });
    //   return;
    // }

    setSaving(true);
    setError(null);

    try {
      const payload = {
        financial_year_start,
        financial_year_end,
        leave_year_start,
        leave_year_end,
        organisation_id: getOrgCode(),
      };

      await axios.put(
        `/settings/update_company_calendar/${calendarId}`,
        payload,
      );

      toast({
        title: "Calendar updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      if (onUpdated) {
        await onUpdated();
      }

      onClose();
    } catch (err) {
      console.error("Failed to update calendar", err);
      toast({
        title: "Failed to update calendar",
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
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
      <ModalOverlay />
      <ModalContent fontFamily="Poppins">
        <ModalHeader fontWeight="600">Edit Calendar</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          {loading ? (
            <Flex align="center" justify="center" py={8} gap={3}>
              <Spinner />
              <Text>Loading calendar...</Text>
            </Flex>
          ) : error ? (
            <Text color="red.500" mb={3} fontSize="sm">
              {error}
            </Text>
          ) : (
            <Box>
              <FormControl mb={3} isRequired>
                <FormLabel fontSize="sm">Financial year start</FormLabel>
                <Input
                  type="date"
                  value={formData.financial_year_start}
                  onChange={handleChange("financial_year_start")}
                />
              </FormControl>

              <FormControl mb={3} isRequired>
                <FormLabel fontSize="sm">Financial year end</FormLabel>
                <Input
                  type="date"
                  value={formData.financial_year_end}
                  onChange={handleChange("financial_year_end")}
                />
              </FormControl>

              <FormControl mb={3} isRequired>
                <FormLabel fontSize="sm">Leave year start</FormLabel>
                <Input
                  type="date"
                  value={formData.leave_year_start}
                  onChange={handleChange("leave_year_start")}
                />
              </FormControl>

              <FormControl mb={3} isRequired>
                <FormLabel fontSize="sm">Leave year end</FormLabel>
                <Input
                  type="date"
                  value={formData.leave_year_end}
                  onChange={handleChange("leave_year_end")}
                />
              </FormControl>
            </Box>
          )}
        </ModalBody>

        <Flex p={4} justify="space-between">
          <Button onClick={onClose} size="sm" bg="white" color="#757575">
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
