// OfficeLocationEditModal.jsx
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
  Select,
  Text,
  Spinner,
  useToast,
  Box,
  FormErrorMessage,
} from "@chakra-ui/react";
import axios from "../../../../../api/axios";
import { getOrgCode } from "../../../../../utils/token";

export default function OfficeLocationEditModal({
  isOpen,
  onClose,
  locationId,
  onUpdated,
}) {
  const toast = useToast();

  const [formData, setFormData] = useState({
    location_name: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    country: "",
    postal_code: "",
    phone: "",
    timezone: "",
    organisation_id: "",
  });

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [phoneError, setPhoneError] = useState("");
  const [pinError, setPinError] = useState("");

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

  // Fetch single location details when modal opens
  useEffect(() => {
    if (!isOpen || !locationId) return;

    const fetchSingleLocation = async () => {
      setLoading(true);
      setError(null);
      try {
        // GET /settings/get_single_location?location_id=...
        const res = await axios.get(
          `/settings/get_single_location?location_id=${encodeURIComponent(
            locationId,
          )}`,
        );
        const data = res?.data?.data;

        if (data) {
          setFormData({
            location_name: data.location_name || "",
            address_line_1: data.address_line_1 || data.address_line1 || "",
            address_line_2: data.address_line_2 || data.address_line2 || "",
            city: data.city || "",
            state: data.state || "",
            country: data.country || "",
            postal_code: data.postal_code || "",
            phone: data.phone || "",
            timezone: data.timezone || "",
            organisation_id: data.organisation_id || getOrgCode() || "",
          });
        }
      } catch (err) {
        console.error("Failed to fetch single location", err);
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load location details",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSingleLocation();
  }, [isOpen, locationId]);

  const handleChange = (field) => (e) => {
    const value =
      field === "phone"
        ? e.target.value.replace(/[^0-9]/g, "")
        : e.target.value;

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (field === "phone") {
      // basic 10-digit validation like AddOfficeLocationForm
      if (!value) {
        setPhoneError("Phone number is required");
      } else if (!/^[0-9]{10}$/.test(value)) {
        setPhoneError("Phone number must be 10 digits");
      } else {
        setPhoneError("");
      }
    }
  };
  const handlePinChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // only numbers

    setFormData((prev) => ({
      ...prev,
      postal_code: value,
    }));

    if (!value) {
      setPinError("Pin Code is required");
    } else if (value.length !== 6) {
      setPinError("Pin Code must be exactly 6 digits");
    } else {
      setPinError("");
    }
  };

  const handleUpdate = async () => {
    if (!locationId) return;

    // basic required checks
    if (!formData.location_name.trim()) {
      toast({
        title: "Location name is required",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!formData.address_line_1.trim()) {
      toast({
        title: "Address line 1 is required",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!formData.city.trim()) {
      toast({
        title: "City is required",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!formData.state.trim()) {
      toast({
        title: "State is required",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!formData.country.trim()) {
      toast({
        title: "Country is required",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!formData.timezone.trim()) {
      toast({
        title: "Timezone is required",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (phoneError) {
      toast({
        title: "Invalid phone number",
        description: phoneError,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!formData.phone.trim()) {
      setPhoneError("Phone number is required");
      toast({
        title: "Phone number is required",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // PUT /settings/update_location/:locationId
      const url = `/settings/update_location/${locationId}`;

      const payload = {
        organisation_id: formData.organisation_id || getOrgCode(),
        location_name: formData.location_name,
        address_line_1: formData.address_line_1,
        address_line_2: formData.address_line_2,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        postal_code: formData.postal_code,
        phone: formData.phone,
        timezone: formData.timezone,
      };

      await axios.put(url, payload);

      toast({
        title: "Location updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      if (onUpdated) {
        await onUpdated();
      }

      onClose();
    } catch (err) {
      console.error("Failed to update location", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update location",
      );
      toast({
        title: "Failed to update location",
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
    setPhoneError("");
    onClose();
  };

  if (!locationId) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size="lg">
      <ModalOverlay />
      <ModalContent fontFamily={"Poppins"}>
        <ModalHeader fontWeight="600">Edit Office Location</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          {loading ? (
            <Flex align="center" justify="center" py={8} gap={3}>
              <Spinner />
              <Text>Loading location details...</Text>
            </Flex>
          ) : (
            <Box fontFamily={"Poppins"}>
              {error && (
                <Text color="red.500" mb={3} fontSize="sm">
                  {error}
                </Text>
              )}

              <Flex gap={4} mb={3}>
                <FormControl isRequired>
                  <FormLabel fontSize="sm">Location name</FormLabel>
                  <Input
                    value={formData.location_name}
                    // onChange={handleChange("location_name")}
                    onChange={(e) => {
                      e.target.value = e.target.value.replace(
                        /[^a-zA-Z0-9 ]/g,
                        "",
                      );
                      handleChange("location_name")(e);
                    }}
                    placeholder="Enter office location name"
                    {...inputStyle}
                  />
                </FormControl>
              </Flex>

              <Flex gap={4} mb={3}>
                <FormControl isRequired>
                  <FormLabel fontSize="sm">Address line 1</FormLabel>
                  <Input
                    value={formData.address_line_1}
                    // onChange={handleChange("address_line_1")}
                    onChange={(e) => {
                      e.target.value = e.target.value.replace(
                        /[^a-zA-Z0-9 ]/g,
                        "",
                      );
                      handleChange("address_line_1")(e);
                    }}
                    placeholder="Enter address line 1"
                    {...inputStyle}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">Address line 2</FormLabel>
                  <Input
                    value={formData.address_line_2}
                    // onChange={handleChange("address_line_2")}
                    onChange={(e) => {
                      e.target.value = e.target.value.replace(
                        /[^a-zA-Z0-9 ]/g,
                        "",
                      );
                      handleChange("address_line_2")(e);
                    }}
                    placeholder="Enter address line 2"
                    {...inputStyle}
                  />
                </FormControl>
              </Flex>

              <Flex gap={4} mb={3}>
                <FormControl isRequired>
                  <FormLabel fontSize="sm">City</FormLabel>
                  <Input
                    value={formData.city}
                    // onChange={handleChange("city")}
                    onChange={(e) => {
                      e.target.value = e.target.value.replace(
                        /[^a-zA-Z0-9 ]/g,
                        "",
                      );
                      handleChange("city")(e);
                    }}
                    placeholder="Enter city"
                    {...inputStyle}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontSize="sm">State</FormLabel>
                  <Input
                    value={formData.state}
                    // onChange={handleChange("state")}
                    onChange={(e) => {
                      e.target.value = e.target.value.replace(
                        /[^a-zA-Z0-9 ]/g,
                        "",
                      );
                      handleChange("state")(e);
                    }}
                    placeholder="Enter State"
                    {...inputStyle}
                  />
                </FormControl>
              </Flex>

              <Flex gap={4} mb={3}>
                <FormControl isRequired>
                  <FormLabel fontSize="sm">Country</FormLabel>
                  <Input
                    value={formData.country}
                    // onChange={handleChange("country")}
                    onChange={(e) => {
                      e.target.value = e.target.value.replace(
                        /[^a-zA-Z0-9 ]/g,
                        "",
                      );
                      handleChange("country")(e);
                    }}
                    placeholder="Enter country"
                    {...inputStyle}
                  />
                </FormControl>
                <FormControl isInvalid={!!pinError} isRequired>
                  <FormLabel fontSize="sm">Pin Code</FormLabel>
                  {/* <Input
                    value={formData.postal_code}
                    // onChange={handleChange("postal_code")}
                    onChange={(e) => {
                      e.target.value = e.target.value.replace(/[^a-zA-Z0-9 ]/g, "");
                      handleChange("postal_code")(e);
                    }}
                    placeholder="Enter Pin code"
                    {...inputStyle}
                  />  */}
                  <Input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={formData.postal_code}
                    onChange={handlePinChange}
                    placeholder="Enter Pin code"
                    {...inputStyle}
                  />

                  {pinError && (
                    <FormErrorMessage fontSize="12px">
                      {pinError}
                    </FormErrorMessage>
                  )}
                </FormControl>
              </Flex>

              <Flex gap={4} mb={3}>
                {/* <FormControl isRequired>
                  <FormLabel fontSize="sm">Timezone</FormLabel>
                  <Input
                    value={formData.timezone}
                    onChange={(e) => {
                      e.target.value = e.target.value.replace(/[^a-zA-Z0-9 ]/g, "");
                      handleChange("timezone")(e);
                    }}
                    placeholder="Enter timezone"
                    {...inputStyle}
                  />
                </FormControl> */}
                <FormControl isRequired>
                  <FormLabel fontSize="sm">Timezone</FormLabel>

                  <Select
                    value={formData.timezone}
                    onChange={handleChange("timezone")}
                    placeholder="Select timezone"
                    {...inputStyle}
                  >
                    <option value="UTC-12:00">
                      (UTC-12:00) International Date Line West
                    </option>

                    <option value="UTC-08:00">
                      (UTC-08:00) Pacific Time (US & Canada)
                    </option>

                    <option value="UTC-05:00">
                      (UTC-05:00) Eastern Time (US & Canada)
                    </option>

                    <option value="UTC+00:00">
                      (UTC+00:00) Greenwich Mean Time
                    </option>

                    <option value="UTC+01:00">
                      (UTC+01:00) Central European Time
                    </option>

                    <option value="UTC+05:30">
                      (UTC+05:30) India Standard Time
                    </option>

                    <option value="UTC+08:00">
                      (UTC+08:00) China Standard Time
                    </option>

                    <option value="UTC+10:00">
                      (UTC+10:00) Australian Eastern Time
                    </option>
                  </Select>
                </FormControl>
                <FormControl isRequired isInvalid={!!phoneError}>
                  <FormLabel fontSize="sm">Phone Number</FormLabel>
                  <Input
                    type="text"
                    maxLength={10}
                    inputMode="numeric"
                    placeholder="Enter Phone number"
                    value={formData.phone}
                    onChange={handleChange("phone")}
                    {...inputStyle}
                  />
                  <FormErrorMessage>{phoneError}</FormErrorMessage>
                </FormControl>
              </Flex>
            </Box>
          )}
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
            isDisabled={loading}
          >
            Update
          </Button>
        </Flex>
      </ModalContent>
    </Modal>
  );
}
