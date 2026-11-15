import React, { useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Button,
  VStack,
  Flex,
  useToast,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import api from "../../api/axios";
import { getOrgCode } from "../../utils/token";

export default function EditAssetModal({ isOpen, onClose, asset, onAssign }) {
  const toast = useToast();

  const orgId = getOrgCode();

  const [categories, setCategories] = React.useState([]);
  const [vendors, setVendors] = React.useState([]);
  const [locations, setLocations] = React.useState([]);
  const [statuses, setStatuses] = React.useState([]);

  const inputStyle = {
    fontFamily: "Poppins",
    fontSize: "15px",
    _placeholder: {
      color: "gray.400",
      fontFamily: "Poppins",
      fontSize: "14px",
    },
    h: "55px",
    borderWidth: "1.5px",
    borderColor: "#D0D5DD",
    borderRadius: "8px",
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get(`/organization/get_asset_categories/${orgId}`);
      const items = res?.data?.asset_categories || res?.data?.data || [];
      setCategories(items);
    } catch (err) {
      setCategories([]);
    }
  };

  const fetchVendors = async () => {
    try {
      const res = await api.get(`/organization/get_asset_vendors/${orgId}`);
      const items = res?.data?.vendors || res?.data?.data || [];
      setVendors(items);
    } catch (err) {
      setVendors([]);
    }
  };

  const fetchStatuses = async () => {
    try {
      const res = await api.get(`/organization/get_asset_status`);
      const items = res?.data?.statuses || res?.data?.data || [];
      setStatuses(items);
    } catch (err) {
      setStatuses([]);
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await api.get(`/organization/get_locations/${orgId}`);
      const items = res?.data?.locations || res?.data?.data || [];
      setLocations(items);
    } catch (err) {
      setLocations([]);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchVendors();
    fetchStatuses();
    fetchLocations();
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      assetName: "",
      assetId: "",
      serialNumber: "",
      category: "",
      brand_name: "",
      vendor: "",
      location: "",
      status: "",
      note: "",
    },
  });

  // Reset form whenever asset changes or modal opens
  useEffect(() => {
    if (isOpen) {
      const findStatusId =
        asset?.raw?.status_id ||
        statuses.find((s) => {
          const name = s.name || s.status || "";
          return (
            String(name).toLowerCase() ===
            String(asset?.status || "").toLowerCase()
          );
        })?._id ||
        "";

      reset({
        assetName: asset?.name || asset?.asset_name || "",
        assetId:
          asset?.raw?.asset_id || asset?.assetId || asset?.asset_id || "",
        assetCode: asset?.raw?.asset_code || asset?.code || "",
        serialNumber: asset?.serialNumber || asset?.serial_number || "",
        category: asset?.category || asset?.category_name || "",
        brand_name: asset?.brand || asset?.brand_name || "",
        vendor: asset?.vendor || asset?.vendor_id || "",
        location: asset?.location || asset?.location_id || "",
        status: findStatusId || "",
        note: "",
      });
    }
  }, [asset, isOpen]);

  const submit = async (data) => {
    if (!asset) {
      toast({
        status: "error",
        title: "Asset not found",
        description: "Cannot update because asset data is missing.",
      });
      return;
    }

    const assetId =
      asset?.raw?.asset_id ||
      asset?.asset_id ||
      asset?.assetId ||
      asset?.asset_code ||
      asset?.assetCode ||
      "";
    if (!assetId) {
      toast({
        status: "error",
        title: "Asset ID missing",
        description: "Cannot update because asset_id is not available.",
      });
      return;
    }

    // resolve category/vendor/status ids
    const resolveCategoryId = () => {
      if (asset?.raw?.category_id) return asset.raw.category_id;
      const found = categories.find((c) => {
        const name = c.category_name || c.name || "";
        return (
          String(name).toLowerCase() ===
          String(asset?.category || asset?.category_name || "").toLowerCase()
        );
      });
      return found?._id || "";
    };

    const resolveVendorId = () => {
      if (asset?.raw?.vendor_id) return asset.raw.vendor_id;
      const found = vendors.find((v) => {
        const name = v.vendor_name || v.name || "";
        return (
          String(name).toLowerCase() ===
          String(asset?.vendor || "").toLowerCase()
        );
      });
      return found?._id || "";
    };

    const resolveLocationId = () => {
      if (asset?.raw?.location_id) return asset.raw.location_id;
      const found = locations.find((l) => {
        const name = l.location_name || l.location || "";
        return (
          String(name).toLowerCase() ===
          String(asset?.location || asset?.location_name || "").toLowerCase()
        );
      });
      return found?._id || "";
    };

    const resolveStatusId = () => {
      if (data?.status) return data.status;
      if (asset?.raw?.status_id) return asset.raw.status_id;
      const found = statuses.find((s) => {
        const name = s.name || s.status || "";
        return (
          String(name).toLowerCase() ===
          String(asset?.status || "").toLowerCase()
        );
      });
      return found?._id || "";
    };

    const categoryId = resolveCategoryId();
    const vendorId = resolveVendorId();
    const locationId = resolveLocationId();
    const statusId = resolveStatusId();

    //request body
    const body = {
      organisation_id: asset.organisation_id,
      asset_name: asset.asset_name,
      serial_number: asset.serial_number,
      category: categoryId || asset.category,
      asset_code: asset.asset_code,
      asset_id: assetId,
      brand_name: asset.brand_name,
      vendor: vendorId || asset.vendor,
      location: locationId || asset.location,
      status: statusId || asset.status,
      purchase_date: asset.purchase_date,
      warranty_end: asset.warranty_end,
    };

    try {
      await api.put(
        `/assets/update_asset?asset_id=${encodeURIComponent(assetId)}`,
        body
      );

      //notify parent with updated data
      if (onAssign) {
        await onAssign({
          ...body,
          asset_id: assetId,
          note: data.note,
        });
      }

      // toast({ status: "success", title: "Asset details updated" });
      onClose();
    } catch (err) {
      console.error("Failed to update asset", err);
      toast({
        status: "error",
        title: "Failed to update",
        description:
          err?.response?.data?.message ||
          err?.message ||
          "Something went wrong",
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontFamily={"Poppins"} fontWeight={600}>
          Edit asset status
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel fontFamily={"Poppins"}>Asset name</FormLabel>
              <Input
                {...register("assetName", { required: true })}
                {...inputStyle}
                isReadOnly
                disabled
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontFamily={"Poppins"}>Asset Code</FormLabel>
              {/* <Input {...register("assetId", { required: true })} isReadOnly disabled /> */}
              <Input
                {...register("assetCode", { required: true })}
                {...inputStyle}
                isReadOnly
                disabled
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontFamily={"Poppins"}>Serial number</FormLabel>
              <Input
                {...register("serialNumber", { required: true })}
                {...inputStyle}
                isReadOnly
                disabled
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontFamily={"Poppins"}>Category</FormLabel>
              <Input
                {...register("category", { required: true })}
                {...inputStyle}
                isReadOnly
                disabled
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontFamily={"Poppins"}>Brand</FormLabel>
              <Input
                {...register("brand_name", { required: true })}
                {...inputStyle}
                isReadOnly
                disabled
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontFamily={"Poppins"}>Vendor</FormLabel>
              <Input
                {...register("vendor", { required: true })}
                {...inputStyle}
                isReadOnly
                disabled
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontFamily={"Poppins"}>Location</FormLabel>
              <Input
                {...register("location", { required: true })}
                {...inputStyle}
                isReadOnly
                disabled
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontFamily={"Poppins"}>Status</FormLabel>
              <Select
                placeholder="Select status"
                {...inputStyle}
                {...register("status", { required: true })}
              >
                {statuses.length === 0 ? (
                  <>
                    <option value="in-use">In-use</option>
                    <option value="under-maintenance">Under maintenance</option>
                    <option value="in-stock">In-stock</option>
                    {/* <option value="in-transit">In-transit</option> */}
                    <option value="missing">Missing</option>
                    <option value="retired">Retired</option>
                  </>
                ) : (
                  statuses.map((s) => (
                    <option key={s._id || s.id} value={s._id || s.id}>
                      {s.name || s.status || String(s._id || s.id)}
                    </option>
                  ))
                )}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Note</FormLabel>
              <Textarea
                {...register("note")}
                placeholder="Write your note..."
                {...inputStyle}
              />
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Flex justifyContent="space-between" gap={2} width={"100%"}>
            <Button
              variant="ghost"
              onClick={onClose}
              isDisabled={isSubmitting}
              bg={"white"}
              color={"#757575"}
            >
              Cancel
            </Button>
            <Button
              bg="#274167"
              color="white"
              _hover={{ bg: "#1f3143" }}
              onClick={handleSubmit(submit)}
              isLoading={isSubmitting}
            >
              Save
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
