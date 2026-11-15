// import React from "react";
// import {
//   Box,
//   SimpleGrid,
//   FormControl,
//   FormLabel,
//   Input,
//   Button,
//   Flex,
//   useToast,
// } from "@chakra-ui/react";
// import { useForm } from "react-hook-form";
// import { useDispatch, useSelector } from "react-redux";
// import { addAssetThunk } from "../../slices/assetsSlice";
// import { useNavigate } from "react-router-dom";

// export default function AddAssetForm() {
//   const { register, handleSubmit, reset } = useForm();
//   const dispatch = useDispatch();
//   const toast = useToast();
//   const navigate = useNavigate();
//   const loading = useSelector((state) => state.assets.loading);

//   const onSubmit = async (data) => {
//     try {
//       // normalize payload
//       const payload = {
//         name: data.name,
//         serialNumber: data.serialNumber,
//         category: data.category,
//         assetId: data.assetId,
//         brand: data.brand,
//         vendor: data.vendor,
//         location: data.location,
//         status: data.status,
//         purchasedOn: data.purchasedOn,
//         warrantyEndsOn: data.warrantyEndsOn,
//       };

//       await dispatch(addAssetThunk(payload)).unwrap();
//       toast({ title: "Asset added", status: "success", duration: 1500 });
//       reset();
//       navigate("/assets");
//     } catch (err) {
//       toast({
//         title: "Add failed",
//         description: err?.message || err,
//         status: "error",
//         duration: 3000,
//       });
//     }
//   };

//   return (
//     <Box pr={20} pl={20} bg="white" borderRadius="md">
//       <form onSubmit={handleSubmit(onSubmit)}>
//         <SimpleGrid columns={2} spacing={4}>
//           <FormControl isRequired>
//             <FormLabel>Asset Name</FormLabel>
//             <Input
//               {...register("name", { required: true })}
//               placeholder="Enter Name"
//             />
//           </FormControl>

//           <FormControl>
//             <FormLabel>Serial number</FormLabel>
//             <Input {...register("serialNumber")} placeholder="Enter Serial" />
//           </FormControl>

//           <FormControl isRequired>
//             <FormLabel>Category</FormLabel>
//             <Input
//               {...register("category", { required: true })}
//               placeholder="Enter Category"
//             />
//           </FormControl>

//           <FormControl isRequired>
//             <FormLabel>Asset Code</FormLabel>
//             <Input
//               {...register("assetId", { required: true })}
//               placeholder="Enter Asset ID"
//             />
//           </FormControl>

//           <FormControl>
//             <FormLabel>Brand</FormLabel>
//             <Input {...register("brand")} placeholder="Enter Brand" />
//           </FormControl>

//           <FormControl>
//             <FormLabel>Vendor</FormLabel>
//             <Input {...register("vendor")} placeholder="Enter Vendor" />
//           </FormControl>

//           <FormControl>
//             <FormLabel>Location</FormLabel>
//             <Input {...register("location")} placeholder="Enter location" />
//           </FormControl>

//           <FormControl>
//             <FormLabel>Status</FormLabel>
//             <Input {...register("status")} placeholder="Enter status" />
//           </FormControl>

//           <FormControl>
//             <FormLabel>Purchased on</FormLabel>
//             <Input type="date" {...register("purchasedOn")} />
//           </FormControl>

//           <FormControl>
//             <FormLabel>Warranty ends on</FormLabel>
//             <Input type="date" {...register("warrantyEndsOn")} />
//           </FormControl>
//         </SimpleGrid>

//         <Flex justify="flex-end" gap={2} mt={4}>
//           <Button variant="outline" onClick={() => navigate("/assets")}>
//             Cancel
//           </Button>
//           <Button
//             bg="#274167"
//             color="white"
//             _hover={{ bg: "#1f3143" }}
//             type="submit"
//             isLoading={loading}
//           >
//             Add
//           </Button>
//         </Flex>
//       </form>
//     </Box>
//   );
// }

import React, { useEffect, useState } from "react";
import {
  Box,
  SimpleGrid,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  Flex,
  useToast,
  Text,
  FormErrorMessage,
} from "@chakra-ui/react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { getOrgCode } from "../../utils/token";
import { DatePicker } from "../../layouts/DatePicker";

export default function AddAssetForm() {
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm();
  const toast = useToast();
  const navigate = useNavigate();
  const orgId = getOrgCode();

  // options state
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [brands, setBrands] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [locations, setLocations] = useState([]);

  // loading state
  const [loadingCat, setLoadingCat] = useState(false);
  const [loadingVen, setLoadingVen] = useState(false);
  const [loadingBr, setLoadingBr] = useState(false);
  const [loadingSta, setLoadingSta] = useState(false);
  const [loadingLoc, setLoadingLoc] = useState(false);

  const purchasedOn = watch("purchasedOn");
  const purchasedOnDateObj = purchasedOn ? new Date(purchasedOn) : null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Fetchers (no typing/search — get the whole list)
  const fetchCategories = async () => {
    try {
      setLoadingCat(true);
      const res = await api.get(`/organization/get_asset_categories/${orgId}`);
      // backend returns asset_categories
      const items = res?.data?.asset_categories || res?.data?.data || [];
      setCategories(items);
    } catch (err) {
      console.error("fetchCategories", err);
      setCategories([]);
    } finally {
      setLoadingCat(false);
    }
  };

  const fetchVendors = async () => {
    try {
      setLoadingVen(true);
      const res = await api.get(`/organization/get_asset_vendors/${orgId}`);
      const items = res?.data?.vendors || res?.data?.data || [];
      setVendors(items);
    } catch (err) {
      console.error("fetchVendors", err);
      setVendors([]);
    } finally {
      setLoadingVen(false);
    }
  };

  const fetchBrands = async () => {
    try {
      setLoadingBr(true);
      const res = await api.get(`/organization/get_asset_brands/${orgId}`);
      const items = res?.data?.brands || res?.data?.data || [];
      setBrands(items);
    } catch (err) {
      console.error("fetchBrands", err);
      setBrands([]);
    } finally {
      setLoadingBr(false);
    }
  };

  const fetchStatuses = async () => {
    try {
      setLoadingSta(true);
      // this endpoint per your earlier message may not require orgId
      // but if it does, change to /organization/get_asset_status/${orgId}
      const res = await api.get(`/organization/get_asset_status`);
      const items = res?.data?.statuses || res?.data?.data || [];
      setStatuses(items);
    } catch (err) {
      console.error("fetchStatuses", err);
      setStatuses([]);
    } finally {
      setLoadingSta(false);
    }
  };

  const fetchLocations = async () => {
    try {
      setLoadingLoc(true);
      const res = await api.get(`/organization/get_locations/${orgId}`);
      const items = res?.data?.locations || res?.data?.data || [];
      setLocations(items);
    } catch (err) {
      console.error("fetchLocations", err);
      setLocations([]);
    } finally {
      setLoadingLoc(false);
    }
  };

  useEffect(() => {
    // initial fetch
    fetchCategories();
    fetchVendors();
    fetchBrands();
    fetchStatuses();
    fetchLocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // submit: send Mongo _id for the select fields
  const onSubmit = async (data) => {
    // data.category, data.brand, data.vendor, data.location, data.status will contain selected _id
    const payload = {
      organisation_id: orgId,
      asset_name: data.name || "",
      serial_number: data.serialNumber || "",
      category: data.category || "",
      asset_code: data.assetId || "",
      brand_name: data.brand || "",
      vendor: data.vendor || "",
      location: data.location || "",
      status: data.status || "",
      purchase_date: data.purchasedOn || "",
      warranty_end: data.warrantyEndsOn || "",
    };

    try {
      // const res = await api.post(/assets/add_asset, payload);
      const res = await api.post("/assets/add_asset", payload);
      toast({
        title: "Asset added",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      reset();
      navigate("/asset-management");
    } catch (err) {
      console.error("add asset error", err);
      toast({
        title: "Failed to add asset",
        description: err?.response?.data?.message || err.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  // helper to render Select with fallback when no options
  const RenderSelect = ({
    label,
    name,
    control,
    options,
    isLoading,
    optionLabelKey,
  }) => (
    <FormControl isRequired>
      <FormLabel fontWeight="500" letterSpacing={'-0.04em'}>{label}</FormLabel>
      <Controller
        name={name}
        control={control}
        rules={{ required: true }}
        render={({ field }) => (
          <Select
            {...field}
            placeholder={
              isLoading
                ? "Loading..."
                : options.length
                ? `Select ${label}`
                : `No ${label} available`
            }
            {...inputStyle}
          >
            {options.length === 0
              ? null
              : options.map((opt) => (
                  <option key={opt._id || opt.id} value={opt._id || opt.id}>
                    {optionLabelKey
                      ? opt[optionLabelKey] ??
                        opt.name ??
                        String(opt._id || opt.id)
                      : opt.name ??
                        opt.category_name ??
                        opt.vendor_name ??
                        opt.brand_name ??
                        opt.city ??
                        String(opt._id || opt.id)}
                  </option>
                ))}
          </Select>
        )}
      />
      {!isLoading && options.length === 0 && (
        <Text fontSize="xs" color="gray.500" mt={1}>
          No options available.
        </Text>
      )}
    </FormControl>
  );

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

  return (
    <Box pr={20} pl={20} bg="white" borderRadius="md" mt={10} mr={50} ml={50}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <SimpleGrid columns={2} spacing={4}>
          {/* Asset Name */}
          <FormControl isRequired>
            <FormLabel fontWeight="500" letterSpacing={"-0.04em"}>
              Asset Name
            </FormLabel>
            <Input
              // {...register("name", { required: true })}
              {...register("name", {
                required: "Asset name is required",
                validate: (value) =>
                  /^[A-Za-z ]+$/.test(value.trim()) ||
                  "Only alphabets are allowed",
              })}
              placeholder="Enter Name"
              onChange={(e) => {
                e.target.value = e.target.value.replace(/[^A-Za-z ]/g, "");
              }}
              {...inputStyle}
            />
          </FormControl>

          {/* Serial Number */}
          <FormControl isRequired>
            <FormLabel fontWeight="500" letterSpacing={"-0.04em"}>
              Serial number
            </FormLabel>
            <Input
              {...register("serialNumber", { required: true })}
              placeholder="Enter Serial"
              onChange={(e) => {
                e.target.value = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
              }}
              {...inputStyle}
            />
          </FormControl>

          {/* Category (select-only) */}
          <RenderSelect
            label="Category"
            name="category"
            control={control}
            options={categories}
            isLoading={loadingCat}
            optionLabelKey="category_name"
          />

          {/* Asset Code */}
          <FormControl isRequired>
            <FormLabel fontWeight="500" letterSpacing={'-0.04em'}>Asset Category Code</FormLabel>
            <Input
              {...register("assetId", { required: true })}
              placeholder="Enter Asset ID"
              onChange={(e) => {
                e.target.value = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
              }}
              {...inputStyle}
            />
          </FormControl>

          {/* Brand (select-only) */}
          <RenderSelect
            label="Brand"
            name="brand"
            control={control}
            options={brands}
            isLoading={loadingBr}
            optionLabelKey="brand_name"
          />

          {/* Vendor (select-only) */}
          <RenderSelect
            label="Vendor"
            name="vendor"
            control={control}
            options={vendors}
            isLoading={loadingVen}
            optionLabelKey="vendor_name"
          />

          {/* Location (select-only) */}
          <RenderSelect
            label="Location"
            name="location"
            control={control}
            options={locations}
            isLoading={loadingLoc}
            // display city + state if available
            optionLabelKey={null}
          />

          {/* Status (select-only) */}
          <RenderSelect
            label="Status"
            name="status"
            control={control}
            options={statuses}
            isLoading={loadingSta}
            optionLabelKey="name"
          />

          {/* Purchase Date */}
          {/* <FormControl>
            <FormLabel>Purchased on</FormLabel>
            <Input type="date" {...register("purchasedOn")} />
          </FormControl> */}
          {/* Purchased on */}
          <FormControl mb={3} isInvalid={!!errors?.purchasedOn} isRequired>
            <FormLabel fontFamily="Poppins" fontSize="15px" fontWeight="500" letterSpacing={'-0.04em'}>
              Purchased on
            </FormLabel>
            <Controller
              name="purchasedOn"
              control={control}
              rules={{
                required: "Purchase date is required",
                validate: {
                  notFuture: (value) => {
                    if (!value) return true;
                    const d = new Date(value);
                    d.setHours(0, 0, 0, 0);
                    return (
                      d <= today || "Purchase date cannot be in the future"
                    );
                  },
                },
              }}
              render={({ field }) => (
                <DatePicker
                  // label="Purchased on"
                  placeholder="Enter Purchase date"
                  value={field.value}
                  onChange={field.onChange}
                  maxDate={today}
                  inputProps={inputStyle}
                />
              )}
            />
            <FormErrorMessage>{errors?.purchasedOn?.message}</FormErrorMessage>
          </FormControl>

          {/* Warranty end
          <FormControl>
            <FormLabel>Warranty ends on</FormLabel>
            <Input type="date" {...register("warrantyEndsOn")} />
          </FormControl> */}
          {/* Warranty ends on */}
          <FormControl mb={3} isInvalid={!!errors?.warrantyEndsOn} isRequired>
            <FormLabel fontFamily="Poppins" fontSize="15px" fontWeight="500" letterSpacing={'-0.04em'}>
              Warranty ends on
            </FormLabel>
            <Controller
              name="warrantyEndsOn"
              control={control}
              rules={{
                required: "Warranty end date is required",
                validate: {
                  notBeforePurchase: (value) => {
                    if (!value || !purchasedOn) return true;
                    const purchase = new Date(purchasedOn);
                    const warranty = new Date(value);
                    purchase.setHours(0, 0, 0, 0);
                    warranty.setHours(0, 0, 0, 0);
                    return (
                      warranty >= purchase ||
                      "Warranty end date cannot be before purchase date"
                    );
                  },
                },
              }}
              render={({ field }) => (
                <DatePicker
                  // label="Warranty ends on"
                  placeholder="Enter Warranty end date"
                  value={field.value}
                  onChange={field.onChange}
                  minDate={purchasedOnDateObj || undefined}
                  inputProps={inputStyle}
                />
              )}
            />
            <FormErrorMessage>
              {errors?.warrantyEndsOn?.message}
            </FormErrorMessage>
          </FormControl>
        </SimpleGrid>

        <Flex justify="space-between" gap={3} mt={6}>
          <Button color='#757575' bg={'white'} onClick={() => navigate("/asset-management")}>
            Cancel
          </Button>
          <Button
            bg="#274167"
            color="white"
            _hover={{ bg: "#1f3143" }}
            type="submit"
          >
            Add
          </Button>
        </Flex>
      </form>
    </Box>
  );
}
