// VendorsEditModal.jsx
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
  Textarea,
  Button,
  Flex,
  Text,
  Spinner,
  useToast,
  Box,
  SimpleGrid,
  Select,
  FormErrorMessage,
} from "@chakra-ui/react";
import api from "../../../../../api/axios";
import { getOrgCode } from "../../../../../utils/token";
import { useForm } from "react-hook-form";

export default function VendorsEditModal({
  isOpen,
  onClose,
  vendorId,
  onUpdated,
}) {
  const toast = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ mode: "onChange", reValidateMode: "onChange" });

  const [formData, setFormData] = useState({
    vendor_id: "",
    vendor_name: "",
    contact_person: "",
    address: "",
    contact_email: "",
    contact_phone: "",
    gst_number: "",
    contract_start_date: "",
    contract_end_date: "",
    payment_terms: "",
    warranty_terms: "",
    support_contact: "",
    rating: "",
    organisation_id: "",
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

  // Fetch single vendor when modal opens (same pattern as DivisionEditModal)
  useEffect(() => {
    if (!isOpen || !vendorId) return;

    const fetchSingleVendor = async () => {
      setLoading(true);
      setError(null);

      try {
        const url = `/settings/get_single_vendor/${encodeURIComponent(
          vendorId
        )}`;
        const res = await api.get(url);
        const data = res?.data?.data;
        if (data) {
          setFormData({
            vendor_id: data.vendor_id || "",
            vendor_name: data.vendor_name || "",
            contact_person: data.contact_person || "",
            address: data.address || "",
            contact_email: data.contact_email || "",
            contact_phone: data.contact_phone || "",
            gst_number: data.gst_number || "",
            contract_start_date: data.contract_start_date
              ? data.contract_start_date.slice(0, 10)
              : "",
            contract_end_date: data.contract_end_date
              ? data.contract_end_date.slice(0, 10)
              : "",
            payment_terms: data.payment_terms || "",
            warranty_terms: data.warranty_terms || "",
            support_contact: data.support_contact || "",
            rating: data.rating || "",
            organisation_id: data.organisation_id || getOrgCode() || "",
          });
        }
      } catch (err) {
        console.error("Failed to fetch vendor", err);
        setError(
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load vendor details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSingleVendor();
  }, [isOpen, vendorId]);

  // const handleChange = (field) => (e) => {
  //   setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  // };
  const handleChange = (field) => (e) => {
    let value = e.target.value;

    // ✅ Sirf email ke liye lowercase force
    if (field === "contact_email") {
      value = value.toLowerCase();
    }

    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };


  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleUpdate = async () => {
    if (!vendorId) return;
    const gstRegex =
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
    if (
      formData.contract_start_date &&
      formData.contract_end_date &&
      new Date(formData.contract_end_date) <=
      new Date(formData.contract_start_date)
    ) {
      toast({
        title: "Invalid contract dates",
        description:
          "Contract end date must be after contract start date",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return; // ⛔ STOP UPDATE
    }


    if (!formData.vendor_name.trim()) {
      toast({
        title: "Vendor name is required",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Email validation
    if (!isValidEmail(formData.contact_email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        status: "error",
        duration: 3000,
      });
      return;
    }

    // Phone validation
    if (!/^[0-9]{10}$/.test(formData.contact_phone)) {
      toast({
        title: "Invalid phone number",
        description: "Phone number must be exactly 10 digits",
        status: "error",
        duration: 3000,
      });
      return;
    }
    if (!gstRegex.test(formData.gst_number)) {
      toast({
        title: "Invalid GST Number",
        description: "Please enter a valid 15-character GST number",
        status: "error",
        duration: 3000,
      });
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const url = `/organization/update_asset_vendor/${vendorId}`;
      const payload = {
        ...formData,
        organisation_id: formData.organisation_id || getOrgCode(),
      };

      await api.put(url, payload);

      toast({
        title: "Vendor updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      if (onUpdated) await onUpdated();
      onClose();
    } catch (err) {
      console.error("Failed to update vendor", err);
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update vendor"
      );
      toast({
        title: "Failed to update vendor",
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

  if (!vendorId) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size="xl">
      <ModalOverlay />
      <ModalContent fontFamily="Poppins">
        <ModalHeader fontWeight="600">Edit Vendor</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          {loading ? (
            <Flex align="center" justify="center" py={8} gap={3}>
              <Spinner />
              <Text>Loading vendor details...</Text>
            </Flex>
          ) : error ? (
            <Text color="red.500" mb={3} fontSize="sm">
              {error}
            </Text>
          ) : (
            <Box mt={2}>
              <SimpleGrid columns={2} spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Vendor ID</FormLabel>
                  <Input
                    value={formData.vendor_id}
                    // onChange={handleChange("vendor_id")}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
                      handleChange("vendor_id")({
                        target: { value }
                      });
                    }}
                    {...inputStyle}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Vendor name</FormLabel>
                  <Input
                    value={formData.vendor_name}
                    // onChange={handleChange("vendor_name")}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^[a-zA-Z\s]*$/.test(value)) {
                        handleChange("vendor_name")(e);
                      }
                    }}
                    {...inputStyle}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Contact person</FormLabel>
                  <Input
                    value={formData.contact_person}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^[a-zA-Z\s]*$/.test(value)) {
                        handleChange("contact_person")(e);
                      }
                    }}
                    {...inputStyle}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Address</FormLabel>
                  <Input
                    value={formData.address}
                    onChange={handleChange("address")}
                    {...inputStyle}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Contact email</FormLabel>
                  {/* <Input
                    type="email"
                    value={formData.contact_email}
                    onChange={handleChange("contact_email")}
                    {...inputStyle}
                  /> */}
                  <Input
                    type="email"
                    textTransform="lowercase"
                    value={formData.contact_email}
                    onChange={handleChange("contact_email")}
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    inputMode="email"
                    {...inputStyle}
                  />



                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Contact phone</FormLabel>
                  <Input
                    value={formData.contact_phone}
                    maxLength={10}
                    inputMode="numeric"
                    placeholder="10 digit phone number"
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "");
                      setFormData((prev) => ({
                        ...prev,
                        contact_phone: value,
                      }));
                    }}
                    {...inputStyle}
                  />
                </FormControl>

                <FormControl isRequired isInvalid={!!errors?.gst_number}>
                  <FormLabel>GST number</FormLabel>

                  <Input
                    value={formData.gst_number}
                    maxLength={15}
                    placeholder="Enter GST Number"
                    onChange={(e) => {
                      let value = e.target.value
                        .toUpperCase()
                        .replace(/[^A-Z0-9]/g, "");

                      if (value.length > 15) return;

                      handleChange("gst_number")({
                        target: { value },
                      });
                    }}
                    {...inputStyle}
                  />

                  {/* Error message */}
                  {formData.gst_number &&
                    !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(
                      formData.gst_number
                    ) && (
                      <FormErrorMessage>
                        Enter a valid 15-character GST number
                      </FormErrorMessage>
                    )}
                </FormControl>


                <FormControl isRequired>
                  <FormLabel>Contract start date</FormLabel>
                  <Input
                    type="date"
                    value={formData.contract_start_date}
                    onChange={handleChange("contract_start_date")}
                    {...inputStyle}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Contract end date</FormLabel>
                  {/* <Input
                    type="date"
                    value={formData.contract_end_date}
                    onChange={handleChange("contract_end_date")}
                    {...inputStyle}
                  /> */}
                  <Input
                    type="date"
                    value={formData.contract_end_date}
                    min={
                      formData.contract_start_date
                        ? new Date(
                          new Date(formData.contract_start_date).setDate(
                            new Date(formData.contract_start_date).getDate() + 1
                          )
                        )
                          .toISOString()
                          .split("T")[0]
                        : undefined
                    }
                    onChange={handleChange("contract_end_date")}
                    {...inputStyle}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Payment terms</FormLabel>
                  <Input
                    value={formData.payment_terms}
                    // onChange={handleChange("payment_terms")}
                    onChange={(e) => {
                      const value = e.target.value;
                      // if (/^[a-zA-Z\s]*$/.test(value)) {
                      //   handleChange("payment_terms")(e);
                      // }
                      if (/^[a-zA-Z0-9\s]*$/.test(value)) {
                        handleChange("payment_terms")(e);
                      }
                    }}
                    {...inputStyle}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Warranty terms</FormLabel>
                  <Textarea
                    value={formData.warranty_terms}
                    // onChange={handleChange("warranty_terms")}
                    onChange={(e) => {
                      const value = e.target.value;
                      // if (/^[a-zA-Z\s]*$/.test(value)) {
                      //   handleChange("warranty_terms")(e);
                      // }
                      if (/^[a-zA-Z0-9\s]*$/.test(value)) {
                        handleChange("warranty_terms")(e);
                      }
                    }}
                    rows={3}
                    borderWidth="1.5px"
                    borderColor="#D0D5DD"
                    borderRadius="8px"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Support contact</FormLabel>
                  <Input
                    value={formData.support_contact}
                    onChange={handleChange("support_contact")}
                    {...inputStyle}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Rating</FormLabel>
                  <Select
                    value={formData.rating}
                    onChange={handleChange("rating")}
                    {...inputStyle}
                  >
                    <option value="">Select rating</option>
                    <option value="1">1 - Poor</option>
                    <option value="2">2 - Fair</option>
                    <option value="3">3 - Average</option>
                    <option value="4">4 - Good</option>
                    <option value="5">5 - Excellent</option>
                  </Select>
                </FormControl>
              </SimpleGrid>
            </Box>
          )}
        </ModalBody>

        <Flex p={4} justify="space-between">
          <Button onClick={handleClose} size="sm" bg="white" color="#757575">
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