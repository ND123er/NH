import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  SimpleGrid,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  InputLeftElement,
  IconButton,
  Select,
  Avatar,
  Button,
  Image,
  Text,
  Flex,
  useToast,
} from "@chakra-ui/react";
import { useFormContext, Controller, useWatch } from "react-hook-form";
import {
  addEmployee,
  updateEmployeeBasicInformation,
} from "../../../../api/employee";
import api from "../../../../api/axios";
import { getOrgCode } from "../../../../utils/token";
import { useForm } from "react-hook-form";
import { DatePicker } from "../../../../layouts/DatePicker";
import National_Flag from "../../../../assets/National_Flag.png";

function useFormContextSafe() {
  const ctx = useFormContext();
  if (!ctx) throw new Error("Used outside FormProvider");
  return ctx;
}
const FIELD_LABELS = {
  firstName: "First Name",
  middleName: "Middle Name",
  lastName: "Last Name",
  gender: "Gender",
  dob: "Date of Birth",
  employeeId: "Employee ID",
  bloodGroup: "Blood Group",
  email: "Work Email",
  maritalStatus_id: "Marital Status",
  nationality_id: "Nationality",
  phoneNumber: "Mobile Number",
  roles_id: "Role",
};

export default function BasicInfoSection({
  isViewMode = false,
  isEditing = true,
  setIsEditing = () => {},
}) {
  const {
    formState: { errors },
  } = useFormContextSafe();

  const methods = useFormContext();
  const { register, getValues, resetField, setValue, control } = methods;
  const nationality = useWatch({ control, name: "nationality" });
  const role = useWatch({ control, name: "roles" });
  const maritalStatus = useWatch({ control, name: "maritalStatus" });

  // allow user to enter their own Employee ID by default
  const [employeeIdDisabled, setEmployeeIdDisabled] = useState(false);
  const [passwordDisabled, setPasswordDisabled] = useState(true);
  const [maskedPassword, setMaskedPassword] = useState("");
  const toast = useToast();

  // watch password and password_length for masking behaviour
  const watchedPasswordLength = useWatch({ control, name: "password_length" });
  const watchedPasswordRaw = useWatch({
    control,
    name: "password",
    defaultValue: "",
  });

  useEffect(() => {
    try {
      if (watchedPasswordLength) {
        const len = Number(watchedPasswordLength) || 0;
        const stars = "*".repeat(len);
        setMaskedPassword(stars);
        try {
          setValue("password", stars);
        } catch (e) {}
        setPasswordDisabled(true);
      } else if (watchedPasswordRaw) {
        // if password is present (newly generated), mask it as well
        const len = String(watchedPasswordRaw).length || 0;
        const stars = "*".repeat(len);
        setMaskedPassword(stars);
        try {
          setValue("password", stars);
        } catch (e) {}
        setPasswordDisabled(true);
      } else {
        setMaskedPassword("");
      }
    } catch (e) {
      console.warn("Failed to compute masked password", e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedPasswordLength, watchedPasswordRaw]);

  // image state
  const [photoDataUrl, setPhotoDataUrl] = useState(null);
  const [photoName, setPhotoName] = useState(null);
  const fileInputRef = useRef(null);

  // dropdown options from org APIs
  const [rolesOptions, setRoles] = useState([]);
  const [nationalitiesOptions, setNationalities] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [nationalitiesLoading, setNationalitiesLoading] = useState(false);

  const [maritalStatusOptions, setMaritalStatusOptions] = useState([]);
  const [maritalStatusLoading, setMaritalStatusLoading] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  const today = new Date();

  // inputs only in read-only/disabled.
  const viewDisabled = isViewMode && !isEditing;

  // shared styling for form inputs/selects in this component
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

  // function for capitalize first letter
  const capitalize = (str = "") => {
    const s = String(str).trim();
    if (!s) return s;
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  };

  // normalize various possible API response shapes into an array of items
  const normalizeArrayResponse = (res) => {
    const d = res?.data;
    if (!d) return [];
    if (Array.isArray(d)) return d;
    // backend may return named arrays
    if (Array.isArray(d.roles)) return d.roles;
    if (Array.isArray(d.positions)) return d.positions;
    if (Array.isArray(d.nationalities)) return d.nationalities;
    if (Array.isArray(d.data)) return d.data;
    return [];
  };

  const sectionFields = [
    "firstName",
    "middleName",
    "lastName",
    "gender",
    "dob",
    "employeeId",
    "bloodGroup",
    "email",
    "password",
    "maritalStatus",
    "nationality",
    "personalEmail",
    "phoneNumber",
    "roles",
  ];

  const handleClear = () => {
    sectionFields.forEach((field) => resetField(field));
    // clear the id fields explicitly
    resetField("nationality_id");
    resetField("roles_id");
    resetField("maritalStatus_id");

    setPhotoDataUrl(null);
    setPhotoName(null);
    try {
      setValue("profilePhoto", null);
    } catch (e) {
      console.warn("Failed to clear profilePhoto in form values", e);
    }
  };

  useEffect(() => {
    // On mount, if employeeId already has a value (editing existing employee), enable the input
    try {
      const existing = getValues("employeeId");
      if (existing) setEmployeeIdDisabled(false);

      // If editing and password already exists in form values, determine whether it is masked by password_length
      const existingPassword = getValues("password");
      const existingPwLen = getValues("password_length");
      if (existingPwLen) {
        // Server provided a masked length; keep the input disabled (masked)
        setPasswordDisabled(true);
      } else if (existingPassword) {
        // No metadata, treat it as an editable password
        setPasswordDisabled(false);
      }

      // If editing and there is already a stored photo link/base64 in form values, load it
      const existingPhoto = getValues("profilePhoto");
      if (existingPhoto) setPhotoDataUrl(existingPhoto);
    } catch (e) {
      console.warn("Error checking existing employeeId or profilePhoto", e);
    }
  }, []);

  // get complete option lists
  useEffect(() => {
    const orgId =
      getOrgCode?.() ||
      (typeof window !== "undefined" && localStorage.getItem("org_code"));
    if (!orgId) return;

    const fetchInit = async () => {
      try {
        setRolesLoading(true);
        setNationalitiesLoading(true);
        setMaritalStatusLoading(true);
        const [rRoles, rNats, rMarital] = await Promise.all([
          api.get(`/organization/get_org_roles/${orgId}`),
          api.get(`/organization/get_nationalities/${orgId}`),
          api.get(`/organization/get_marital_status_list?org_id=${orgId}`),
        ]);
        const rolesData = normalizeArrayResponse(rRoles);
        const natsData = normalizeArrayResponse(rNats);
        const maritalData = rMarital?.data?.statuses || [];
        setRoles(rolesData);
        setNationalities(natsData);
        setMaritalStatusOptions(maritalData);
      } catch (err) {
        console.error("Failed to load organisation lists", err);
      } finally {
        setRolesLoading(false);
        setNationalitiesLoading(false);
        setMaritalStatusLoading(false);
      }
    };

    fetchInit();
  }, []);
  //old
  // useEffect(() => {
  //   try {
  //     const currentNatStr = getValues("nationality");
  //     if (currentNatStr) {
  //       const found = nationalitiesOptions.find((n) => {
  //         const labelRaw =
  //           n.nationality_name ||
  //           n.natoanality_name ||
  //           n.name ||
  //           n.country ||
  //           n;
  //         const label =
  //           typeof labelRaw === "object"
  //             ? JSON.stringify(labelRaw)
  //             : String(labelRaw || "");
  //         return (
  //           String(label).toLowerCase() ===
  //           String(currentNatStr).toLowerCase() ||
  //           (n._id && n._id === currentNatStr) ||
  //           (n.id && n.id === currentNatStr)
  //         );
  //       });
  //       if (found) {
  //         const val =
  //           found._id ||
  //           found.id ||
  //           (typeof found === "string" ? found : String(found));
  //         setValue("nationality_id", val, {
  //           shouldValidate: false,
  //           shouldDirty: false,
  //         });
  //       }
  //     }

  //     const currentRoleStr = getValues("roles") || getValues("role");
  //     if (currentRoleStr) {
  //       const foundR = rolesOptions.find((r) => {
  //         const label = r.role_name || r.name || r.role || r;
  //         return (
  //           String(label).toLowerCase() ===
  //           String(currentRoleStr).toLowerCase() ||
  //           (r._id && r._id === currentRoleStr) ||
  //           (r.id && r.id === currentRoleStr)
  //         );
  //       });
  //       if (foundR) {
  //         const val =
  //           foundR._id ||
  //           foundR.id ||
  //           foundR.role_name ||
  //           foundR.name ||
  //           foundR.role;
  //         setValue("roles_id", val, {
  //           shouldValidate: false,
  //           shouldDirty: false,
  //         });
  //       }
  //     }
  //     // Marital status: map preloaded string value to maritalStatus_id when options arrive
  //     try {
  //       const currentMSId = getValues("maritalStatus_id");
  //       const currentMSName = getValues("maritalStatus");
  //       if (
  //         (!currentMSId || currentMSId === "") &&
  //         currentMSName &&
  //         maritalStatusOptions.length
  //       ) {
  //         const found = maritalStatusOptions.find((m) => {
  //           const label = m.name || m.status || m.marital_status || m;
  //           const lbl =
  //             typeof label === "object"
  //               ? JSON.stringify(label)
  //               : String(label || "");
  //           return (
  //             String(lbl).toLowerCase() ===
  //             String(currentMSName).toLowerCase() ||
  //             (m._id && m._id === currentMSName) ||
  //             (m.id && m.id === currentMSName)
  //           );
  //         });
  //         if (found) {
  //           const val =
  //             found._id ||
  //             found.id ||
  //             (typeof found === "string" ? found : String(found));
  //           setValue("maritalStatus_id", val, {
  //             shouldValidate: false,
  //             shouldDirty: false,
  //           });
  //         }
  //       }
  //     } catch (e) {
  //       console.error("Failed to get marital status", e);
  //     }
  //   } catch (e) {
  //     console.warn(
  //       "Failed to map preloaded nationality/roles to option ids",
  //       e,
  //     );
  //   }
  // }, [nationalitiesOptions, rolesOptions, maritalStatusOptions]);

  // File selection -> convert to base64 data URL
  //new
  useEffect(() => {
    if (nationality && nationalitiesOptions.length) {
      const found = nationalitiesOptions.find(
        (n) =>
          String(n.nationality_name || n.name || "").toLowerCase() ===
          String(nationality).toLowerCase(),
      );

      if (found) {
        setValue("nationality_id", found._id || found.id);
      }
    }

    if (role && rolesOptions.length) {
      const found = rolesOptions.find(
        (r) =>
          String(r.role_name || r.name || "").toLowerCase() ===
          String(role).toLowerCase(),
      );

      if (found) {
        setValue("roles_id", found._id || found.id);
      }
    }

    if (maritalStatus && maritalStatusOptions.length) {
      const found = maritalStatusOptions.find(
        (m) =>
          String(m.name || m.status || "").toLowerCase() ===
          String(maritalStatus).toLowerCase(),
      );

      if (found) {
        setValue("maritalStatus_id", found._id || found.id);
      }
    }
  }, [
    nationality,
    role,
    maritalStatus,
    nationalitiesOptions,
    rolesOptions,
    maritalStatusOptions,
    setValue,
  ]);

  const handleFileChange = (e) => {
    if (viewDisabled) return;
    const file = e.target.files?.[0];
    if (!file) return;

    // optional validations
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      toast({
        title: "File too large",
        description: "Please choose an image smaller than 5MB.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (jpg, png, etc.).",
        status: "error",
        duration: 2500,
        isClosable: true,
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setPhotoDataUrl(dataUrl);
      setPhotoName(file.name);
      // save into react-hook-form so it will be part of getValues()
      setValue("profilePhoto", dataUrl);
    };
    reader.onerror = () => {
      toast({
        title: "File read error",
        description: "Could not read the selected file.",
        status: "error",
        duration: 2500,
        isClosable: true,
      });
    };
    reader.readAsDataURL(file);
  };

  // optional: programmatically open file chooser
  const openFileChooser = () => {
    if (viewDisabled) return;
    fileInputRef.current?.click();
  };

  const decodeJwtPayload = (t) => {
    try {
      if (!t || typeof t !== "string") return null;
      const base64Url = t.split(".")[1];
      if (!base64Url) return null;
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
      const jsonPayload = decodeURIComponent(
        atob(padded)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  // const minDate = new Date();
  // minDate.setFullYear(today.getFullYear() - 100);
  // minDate.setMonth(0);
  // minDate.setDate(1);

  const minDate = new Date();
  minDate.setFullYear(today.getFullYear() - 100);
  minDate.setMonth(0);
  minDate.setDate(1);

  const parseDateSafely = (value) => {
    if (!value) return null;
    if (value instanceof Date) return value;

    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  const handleSave = async () => {
    // avoid double submit
    if (isSaving) return;
    setIsSaving(true);

    // 🔹 Trigger full form validation
    // const isValid = await methods.trigger();
    const isValid = await methods.trigger(Object.keys(FIELD_LABELS));

    const formErrors = methods.formState.errors;
    const allowedKeys = Object.keys(FIELD_LABELS);

    // 🔹 Console: All field values
    allowedKeys.forEach((key) => {
      const value = methods.getValues(key);
    });
    console.groupEnd();

    // 🔹 Error fields (only allowed ones)
    const errorKeys = Object.keys(formErrors).filter((key) =>
      allowedKeys.includes(key),
    );

    // 🔹 Check if ANY field has value
    const hasAnyValue = allowedKeys.some((key) => {
      const value = methods.getValues(key);
      return value !== undefined && value !== null && value !== "";
    });

    // 🔹 Readable missing fields
    const readableMissingFields = errorKeys
      .filter((key) => FIELD_LABELS[key])
      .map((key) => FIELD_LABELS[key]);

    // 🔹 Console: Summary
    console.group("📊 VALIDATION SUMMARY");
    console.groupEnd();

    // ❌ CASE 1: Nothing filled at all
    if (!hasAnyValue) {
      toast({
        title: "All fields are required",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setIsSaving(false);
      return;
    }

    // ❌ CASE 2: Some required fields missing
    if (!isValid && readableMissingFields.length > 0) {
      toast({
        title: "Please fill required fields",
        description: readableMissingFields.join(", "),
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      setIsSaving(false);
      return;
    }

    // ✅ Validation passed
    const values = getValues();

    const firstName = capitalize(values.firstName);
    const middleName = capitalize(values.middleName);
    const lastName = capitalize(values.lastName);

    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    // get emp_code
    const decoded = decodeJwtPayload(token);
    const emp_code_from_token =
      decoded?.emp_code || decoded?.empCode || decoded?.employee_id || null;
    const org_id_from_token = decoded?.org_id || decoded?.orgId || null;
    const org_id_from_storage =
      typeof window !== "undefined" ? localStorage.getItem("org_code") : null;
    const org_id = org_id_from_token || org_id_from_storage || null;

    // payload for API
    const payload = {
      first_name: firstName || "",
      middle_name: middleName || "",
      last_name: lastName || "",
      gender: values.gender || "",
      dob: values.dob || "",
      ...(values.employeeId ? { employee_code: values.employeeId } : {}),
      blood_group: values.bloodGroup || "",
      marital_status: values.maritalStatus_id || "",
      nationality: values.nationality_id || "",
      personal_email: values.personalEmail || "",
      mobile: values.phoneNumber || "",
      roles: values.roles_id || "",
      email: values.email || "",
      // password: values.password || "",
      // created_by: emp_code_from_token,
      org_id,
      profilePhoto: photoDataUrl || null,
      profilePhotoName: photoName || null,
    };

    try {
      const dbId =
        getValues("employee_db_id") ||
        (typeof window !== "undefined"
          ? localStorage.getItem("employee_db_id")
          : null);
      const empCode =
        getValues("employee_emp_code") ||
        (typeof window !== "undefined"
          ? localStorage.getItem("employee_emp_code")
          : null);

      const isUpdateFlow = isViewMode && isEditing && (dbId || empCode);

      // if (isUpdateFlow) {
      //   if (dbId) payload.id = dbId;
      //   else if (empCode) payload.emp_code = empCode;

      //   await updateEmployeeBasicInformation(payload);

      //   toast({
      //     title: "Employee basic information updated",
      //     status: "success",
      //     duration: 2000,
      //     isClosable: true,
      //   });

      //   setIsEditing(false);
      //   setIsSaving(false);
      //   return;
      // }

      if (isUpdateFlow) {
        if (dbId) payload.id = dbId;
        else if (empCode) payload.emp_code = empCode;

        delete payload.email;

        await updateEmployeeBasicInformation(payload);

        toast({
          title: "Employee basic information updated",
          status: "success",
          duration: 2000,
          isClosable: true,
        });

        setIsEditing(false);
        setIsSaving(false);
        return;
      }

      // Create new employee
      const res = await addEmployee(payload);

      const newEmpCode =
        res?.employee?.emp_code || res?.emp_code || res?.data?.emp_code || null;
      const newPassword =
        res?.employee?.password || res?.password || res?.data?.password || null;

      if (newEmpCode) {
        // setValue("employeeId", newEmpCode);
        setEmployeeIdDisabled(false);
        localStorage.setItem("employee_emp_code", newEmpCode);
        setValue("employee_emp_code", newEmpCode);
      }

      if (newPassword) {
        setValue("generated_password_raw", newPassword);
        const len = String(newPassword).length;
        setValue("password_length", len);
        setValue("password", "*".repeat(len));
        setPasswordDisabled(true);
      }

      toast({
        title: "Employee added",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      console.error("Save basic info error", err);

      toast({
        title: "Save failed",
        description:
          err?.msg || err?.message || "Please fill in the mandatory fields.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateBasic = async () => {
    setIsSaving(true);

    const natValid = await methods.trigger("nationality_id");
    if (!natValid) {
      toast({
        title: "Please select Nationality",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setIsSaving(false);
      return false;
    }

    try {
      const values = getValues();

      //payload similar to handleSave
      const payload = {
        first_name: capitalize(values.firstName) || "",
        middle_name: capitalize(values.middleName) || "",
        last_name: capitalize(values.lastName) || "",
        gender: values.gender || "",
        dob: values.dob || "",
        employee_id: values.employeeId || "",
        blood_group: values.bloodGroup || "",
        marital_status: values.maritalStatus_id || "",
        nationality: values.nationality_id || "",
        personal_email: values.personalEmail || "",
        mobile: values.phoneNumber || "",
        role: values.roles_id || "",
        // email: values.email || "",
        // include profile photo if present
        profilePhoto: photoDataUrl || null,
        profilePhotoName: photoName || null,
      };
      const dbId =
        getValues("employee_db_id") ||
        (typeof window !== "undefined" &&
          localStorage.getItem("employee_db_id"));
      const empCode =
        getValues("employee_emp_code") ||
        (typeof window !== "undefined" &&
          localStorage.getItem("employee_emp_code"));
      if (dbId) payload.id = dbId;
      if (empCode) payload.emp_code = empCode;

      // update API
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await api.put(
        "/employee/update_employee_basic_information",
        payload,
        { headers },
      );

      toast({
        title: "Basic information updated",
        status: "success",
        duration: 2000,
        isClosable: true,
      });

      return true;
    } catch (err) {
      console.error("Update basic information failed", err);
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update basic information";
      toast({
        title: "Update failed",
        description: message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const onClickSaveOrUpdate = async () => {
    if (isSaving) return;
    try {
      setIsSaving(true);

      if (isViewMode && isEditing) {
        // update existing employee
        const ok = await handleUpdateBasic();
        if (ok) {
          setIsEditing(false);
        }
      } else {
        try {
          await handleSave();
        } catch (err) {
          console.error("Create employee failed", err);
        }
      }
    } finally {
      setIsSaving(false);
    }
  };

  // all common blood groups
  const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  return (
    <Box
      mt={-4}
      p={6}
      pl={{ base: 0, md: 6 }}
      pr={{ base: 0, md: 6 }}
      bg="white"
      borderBottomRadius={"10px"}
      fontFamily="'Poppins', sans-serif"
      fontWeight="500"
    >
      <Box display="flex" gap={4}>
        <Avatar size="xl" mb={2} src={photoDataUrl || undefined} />
        <Box display="flex" flexDirection="column" mt={4}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <Button
            size="sm"
            mb={2}
            w="112px"
            onClick={openFileChooser}
            isDisabled={viewDisabled}
            backgroundColor={"#fff"}
            border="1px solid"
            borderColor="#ccccc"
            color="gray.500"
            fontWeight={"400"}
            fontSize={"12px"}
            boxShadow="sm"
          >
            Upload photo
          </Button>
          <Text fontSize="10px" color="gray.500">
            At least 800 x 800 px recommended.
          </Text>
          <Text fontSize="10px" color="gray.500" mt={2}>
            Use .JPG or .PNG
          </Text>
        </Box>
      </Box>

      <Box mt={4}>
        <SimpleGrid columns={2} spacing={4}>
          <FormControl isRequired isInvalid={!!errors.firstName}>
            <FormLabel
              fontFamily="Poppins"
              fontSize="14px"
              fontWeight="600"
              letterSpacing="-0.3px"
            >
              First Name
            </FormLabel>

            <Input
              placeholder="Enter First Name"
              isDisabled={viewDisabled}
              {...register("firstName", {
                required: "First name is required",
                pattern: {
                  value: /^[A-Za-z\s]+$/,
                  message: "Only letters are allowed",
                },
              })}
              onChange={(e) => {
                // block numbers & special characters while typing / pasting
                const value = e.target.value.replace(/[^A-Za-z\s]/g, "");
                setValue("firstName", value, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
              onBlur={(e) => {
                const transformed = capitalize(e.target.value);
                setValue("firstName", transformed, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
              {...inputStyle}
            />

            {errors.firstName && (
              <Text mt={1} fontSize="12px" color="red.500">
                {errors.firstName.message}
              </Text>
            )}
          </FormControl>

          <FormControl isInvalid={!!errors.middleName}>
            <FormLabel
              fontFamily="Poppins"
              fontSize="14px"
              fontWeight="600"
              letterSpacing="-0.3px"
            >
              Middle name
            </FormLabel>

            <Input
              placeholder="Enter Middle Name"
              isDisabled={viewDisabled}
              {...register("middleName", {
                pattern: {
                  value: /^[A-Za-z\s]+$/,
                  message: "Only letters are allowed",
                },
              })}
              onChange={(e) => {
                // allow only letters & spaces
                const value = e.target.value.replace(/[^A-Za-z\s]/g, "");
                setValue("middleName", value, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
              onBlur={(e) => {
                if (!e.target.value) return;

                const transformed = capitalize(e.target.value);
                setValue("middleName", transformed, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
              {...inputStyle}
            />

            {errors.middleName && (
              <Text mt={1} fontSize="12px" color="red.500">
                {errors.middleName.message}
              </Text>
            )}
          </FormControl>

          <FormControl isRequired isInvalid={!!errors.lastName}>
            <FormLabel
              fontFamily="Poppins"
              fontSize="14px"
              fontWeight="600"
              letterSpacing="-0.3px"
            >
              Last Name
            </FormLabel>

            <Input
              placeholder="Enter Last Name"
              isDisabled={viewDisabled}
              {...register("lastName", {
                required: "Last name is required",
                pattern: {
                  value: /^[A-Za-z\s]+$/,
                  message: "Only letters are allowed",
                },
              })}
              onChange={(e) => {
                // block numbers & special characters while typing / pasting
                const value = e.target.value.replace(/[^A-Za-z\s]/g, "");
                setValue("lastName", value, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
              onBlur={(e) => {
                const transformed = capitalize(e.target.value);
                setValue("lastName", transformed, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
              {...inputStyle}
            />

            {errors.lastName && (
              <Text mt={1} fontSize="12px" color="red.500">
                {errors.lastName.message}
              </Text>
            )}
          </FormControl>

          <FormControl isRequired isInvalid={!!errors?.gender}>
            <FormLabel
              fontFamily="Poppins"
              fontSize="14px"
              fontWeight="600"
              letterSpacing="-0.3px"
            >
              Gender
            </FormLabel>
            <Select
              {...register("gender", { required: "Gender is required" })}
              placeholder="Select Gender"
              {...inputStyle}
              isDisabled={viewDisabled}
            >
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </Select>
          </FormControl>

          <FormControl isRequired isInvalid={!!errors?.dob} mb={4}>
            <FormLabel fontSize={"14px"} fontWeight={"600"}>
              Date Of Birth
            </FormLabel>

            <Controller
              name="dob"
              control={control}
              rules={{
                required: "Date of birth is required",
                validate: {
                  notFuture: (value) => {
                    if (!value) return true;

                    const picked = new Date(value);
                    const today = new Date();

                    picked.setHours(0, 0, 0, 0);
                    today.setHours(0, 0, 0, 0);

                    return (
                      picked <= today || "Date of birth cannot be in the future"
                    );
                  },

                  minAge: (value) => {
                    if (!value) return true;

                    const dob = new Date(value);
                    const today = new Date();

                    let age = today.getFullYear() - dob.getFullYear();
                    const monthDiff = today.getMonth() - dob.getMonth();
                    const dayDiff = today.getDate() - dob.getDate();

                    // If birthday hasn't occurred yet this year, subtract 1
                    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
                      age--;
                    }

                    return age >= 18 || "You must be at least 18 years old";
                  },
                  maxAge: (value) => {
                    if (!value) return true;

                    const dob = new Date(value);
                    const today = new Date();

                    let age = today.getFullYear() - dob.getFullYear();

                    const monthDiff = today.getMonth() - dob.getMonth();
                    const dayDiff = today.getDate() - dob.getDate();

                    // Birthday not reached this year
                    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
                      age--;
                    }

                    return age <= 60 || "Age cannot exceed 60 years";
                  },
                },
              }}
              render={({ field }) => (
                <DatePicker
                  value={field.value}
                  selected={parseDateSafely(field.value)}
                  onChange={(date) => {
                    if (!viewDisabled) field.onChange(date);
                  }}
                  minDate={minDate}
                  maxDate={today}
                  openToDate={
                    parseDateSafely(field.value) ||
                    new Date(today.getFullYear() - 25, 0, 1)
                  }
                  showYearDropdown
                  showMonthDropdown
                  dropdownMode="select"
                  yearDropdownItemNumber={60}
                  scrollableYearDropdown
                  placeholderText="dd/mm/yyyy"
                  disabled={viewDisabled}
                  inputProps={inputStyle}
                />
              )}
            />
            <FormErrorMessage mt={1} fontSize="12px" color="red.500">
              {errors?.dob?.message}
            </FormErrorMessage>
          </FormControl>

          <FormControl isRequired isInvalid={!!errors.employeeId}>
            <FormLabel fontFamily="Poppins" fontSize="14px" fontWeight="600">
              Employee ID
            </FormLabel>

            <Input
              placeholder="Enter Employee ID"
              isDisabled={employeeIdDisabled || viewDisabled}
              {...register("employeeId", {
                required: "Employee ID is required",
                // pattern: {
                //   value: /^[A-Za-z0-9]+$/,
                //   message: "Only letters and numbers are allowed",
                // },
                pattern: {
                  value: /^[A-Za-z0-9]{3,}$/, // ✅ minimum 3
                  message: "Atleast 3 char required",
                },
              })}
              onChange={(e) => {
                // allow only alphabets and numbers
                const value = e.target.value.replace(/[^A-Za-z0-9]/g, "");
                setValue("employeeId", value, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
              {...inputStyle}
            />

            {errors.employeeId && (
              <Text mt={1} fontSize="12px" color="red.500">
                {errors.employeeId.message}
              </Text>
            )}
          </FormControl>

          <FormControl isRequired isInvalid={!!errors?.email}>
            <FormLabel
              fontFamily="Poppins"
              fontSize="14px"
              fontWeight="600"
              letterSpacing="-0.3px"
            >
              Work Email
            </FormLabel>
            <Input
              {...register("email", {
                required: "Work email is required",
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/,
                  message: "Enter a proper email id",
                },
              })}
              placeholder="Enter Work email"
              {...inputStyle}
              isDisabled={isViewMode}
              // isDisabled={viewDisabled}
            />
            <FormErrorMessage mt={1} fontSize="12px" color="red.500">
              {errors?.email && errors.email.message}
            </FormErrorMessage>
          </FormControl>

          <FormControl isRequired>
            <FormLabel
              color={passwordDisabled ? "gray.400" : "gray.800"}
              fontFamily="Poppins"
              fontSize="14px"
              fontWeight="600"
              letterSpacing="-0.3px"
            >
              Password
            </FormLabel>
            <Input
              {...register("password", { required: true })}
              type="password"
              placeholder={
                passwordDisabled
                  ? "Auto-generated after saving"
                  : "Enter your password"
              }
              {...inputStyle}
              isDisabled={passwordDisabled || viewDisabled}
            />
          </FormControl>

          <FormControl isRequired isInvalid={!!errors?.bloodGroup}>
            <FormLabel
              fontFamily="Poppins"
              fontSize="14px"
              fontWeight="600"
              letterSpacing="-0.3px"
            >
              Blood Group
            </FormLabel>

            <Select
              {...register("bloodGroup", {
                required: "Blood Group is required",
              })}
              placeholder="Select Blood Group"
              {...inputStyle}
              isDisabled={viewDisabled}
            >
              {BLOOD_GROUPS.map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </Select>
            <FormErrorMessage mt={1} fontSize="12px" color="red.500">
              {errors?.bloodGroup && errors.bloodGroup.message}
            </FormErrorMessage>
          </FormControl>

          <FormControl isRequired isInvalid={!!errors?.maritalStatus_id}>
            <FormLabel
              fontFamily="Poppins"
              fontSize="14px"
              fontWeight="600"
              letterSpacing="-0.3px"
            >
              Marital Status
            </FormLabel>

            <Controller
              name="maritalStatus_id"
              control={control}
              rules={{ required: "Marital Status is required" }}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder={
                    maritalStatusLoading
                      ? "Loading..."
                      : "Select Marital Status"
                  }
                  {...inputStyle}
                  isDisabled={maritalStatusLoading || viewDisabled}
                >
                  {maritalStatusOptions.map((ms) => (
                    <option key={ms._id} value={ms._id}>
                      {ms.name}
                    </option>
                  ))}
                </Select>
              )}
            />
            <FormErrorMessage mt={1} fontSize="12px" color="red.500">
              {errors?.maritalStatus_id && errors.maritalStatus_id.message}
            </FormErrorMessage>
          </FormControl>

          {/* Nationality */}
          <FormControl isRequired isInvalid={!!errors?.nationality_id}>
            <FormLabel
              fontFamily="Poppins"
              fontSize="14px"
              fontWeight="600"
              letterSpacing="-0.3px"
            >
              Nationality
            </FormLabel>
            {/* store selected _id here */}
            <Controller
              name="nationality_id"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder={
                    nationalitiesLoading
                      ? "Loading..."
                      : nationalitiesOptions.length === 0
                        ? "No nationalities available"
                        : "Select Nationality"
                  }
                  {...inputStyle}
                  isDisabled={
                    nationalitiesLoading ||
                    viewDisabled ||
                    nationalitiesOptions.length === 0
                  }
                >
                  {nationalitiesOptions.map((n) => {
                    // prefer the backend's correct key 'nationality_name',
                    // fall back to other common fields. Ensure label is string.
                    const labelRaw =
                      n.nationality_name ||
                      n.natoanality_name ||
                      n.name ||
                      n.country ||
                      n;
                    const label =
                      typeof labelRaw === "object"
                        ? JSON.stringify(labelRaw)
                        : String(labelRaw || "");
                    const val =
                      n._id ||
                      n.id ||
                      (typeof labelRaw === "string"
                        ? labelRaw
                        : JSON.stringify(n));
                    return (
                      <option key={n._id || n.id || label} value={val}>
                        {label}
                      </option>
                    );
                  })}
                </Select>
              )}
            />
          </FormControl>

          {/* Designation moved to Work Details section (WorkInfoSection) */}

          <FormControl /*isInvalid={!!errors?.personalEmail}*/>
            <FormLabel
              fontFamily="Poppins"
              fontSize="14px"
              fontWeight="600"
              letterSpacing="-0.3px"
            >
              Personal Email
            </FormLabel>
            <Input
              {...register("personalEmail", {
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a proper email id",
                },
              })}
              placeholder="Enter Personal Email"
              {...inputStyle}
              isDisabled={viewDisabled}
            />
            <FormErrorMessage mt={1} fontSize="12px" color="red.500">
              {errors?.personalEmail && errors.personalEmail.message}
            </FormErrorMessage>
          </FormControl>

          {/* Phone number validation */}
          <FormControl isRequired isInvalid={!!errors?.phoneNumber}>
            <FormLabel
              fontFamily="Poppins"
              fontSize="14px"
              fontWeight="600"
              letterSpacing="-0.3px"
            >
              Phone Number
            </FormLabel>
            <InputGroup
              display="flex"
              alignItems="center"
              border="1px solid"
              borderColor="#D0D5DD"
              borderRadius="8px"
            >
              <Flex
                pointerEvents="none"
                height="100%"
                display="flex"
                alignItems="center"
                px={4}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <Image
                    src={National_Flag}
                    alt="India Flag"
                    // boxSize="22px"
                  />
                  <Text fontSize="14px" fontWeight="500" color="gray.700">
                    +91
                  </Text>
                </Box>
              </Flex>
              <Input
                border="none"
                _focus={{
                  boxShadow: "none",
                }}
                {...register("phoneNumber", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^[0-9]+$/, // Fallback validation
                    message: "Only numeric digits are allowed",
                  },
                  validate: {
                    lengthCheck: (v) =>
                      v.length === 10 ||
                      "Phone number must be exactly 10 digits",
                  },
                })}
                maxLength={10}
                placeholder="Enter Phone Number"
                {...inputStyle}
                onChange={(e) => {
                  // Remove all non-numeric characters as user types
                  const numericValue = e.target.value.replace(/[^0-9]/g, "");
                  e.target.value = numericValue.slice(0, 10); // keep max 10 digits
                  setValue("phoneNumber", e.target.value, {
                    shouldValidate: true,
                  });
                }}
                isDisabled={viewDisabled}
              />
            </InputGroup>
            {errors?.phoneNumber && (
              <Text
                fontFamily={"Poppins"}
                color="red.500"
                fontSize="14px"
                mt={1}
              >
                {errors.phoneNumber.message}
              </Text>
            )}
          </FormControl>

          {/* Roles - select only (no typing) */}
          <FormControl isRequired isInvalid={!!errors?.roles_id}>
            <FormLabel
              fontFamily="Poppins"
              fontSize="14px"
              fontWeight="600"
              letterSpacing="-0.3px"
            >
              Role
            </FormLabel>
            <Controller
              name="roles_id"
              control={control}
              rules={{ required: "Role is required" }}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder={rolesLoading ? "Loading..." : "Select Role"}
                  {...inputStyle}
                  isDisabled={rolesLoading || viewDisabled}
                >
                  {rolesOptions.map((r) => {
                    const label = r.role_name || r.name || r.role || r;
                    return (
                      <option
                        key={r._id || r.id || label}
                        value={r._id || r.id || label}
                      >
                        {label}
                      </option>
                    );
                  })}
                </Select>
              )}
            />
            <FormErrorMessage mt={1} fontSize="12px" color="red.500">
              {errors?.roles_id && errors.roles_id.message}
            </FormErrorMessage>
          </FormControl>
        </SimpleGrid>
      </Box>

      <Flex justifyContent="space-between" p={4} pl={0} pr={0} mt={3}>
        <Button
          variant="outline"
          onClick={handleClear}
          fontWeight="600"
          color="#757575"
          border="white"
          isDisabled={viewDisabled || isSaving}
        >
          Clear form
        </Button>

        <Flex gap={3}>
          {isViewMode ? (
            isEditing ? (
              // Only show when editing
              <>
                <Button
                  color="white"
                  backgroundColor="#1A365D"
                  fontWeight="500"
                  _hover={{ bg: "#153e75" }}
                  onClick={onClickSaveOrUpdate}
                  isLoading={isSaving}
                  loadingText="Updating"
                  isDisabled={isSaving}
                >
                  Update
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  isDisabled={isSaving}
                >
                  Cancel
                </Button>
              </>
            ) : null // ← No button when not editing
          ) : (
            // Creating new employee - only Save
            <Button
              color="white"
              backgroundColor="#1A365D"
              fontWeight="500"
              _hover={{ bg: "#153e75" }}
              onClick={onClickSaveOrUpdate}
              isLoading={isSaving}
              loadingText="Saving"
              isDisabled={isSaving}
              w={121}
              borderRadius={10}
            >
              Save
            </Button>
          )}
        </Flex>
      </Flex>
    </Box>
  );
}
