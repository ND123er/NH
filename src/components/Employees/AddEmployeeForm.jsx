import React, { useState, useEffect } from "react";
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Flex,
  IconButton,
} from "@chakra-ui/react";
import { useForm, FormProvider } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import EmployeeTabsNavbar from "./EmployeeTabsNavbar";
// import BasicInfoSection from "./sections/components/BasicInfoSection";
import WorkInfoSection from "./sections/WorkInfoSection";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import PrimaryInfoSection from "./sections/PrimaryInfoSection";
import EducationDetailSection from "./sections/EducationDetailSection";
import EmergencyContactSection from "./sections/EmergencyContactSection";
import CompensationSection from "./sections/CompensationSection";
import EmployeeExitSection from "./sections/EmployeeExitSection";
import DocumentsSection from "./sections/DocumentsSection";
import api from "../../api/axios";
import { getOrgCode } from "../../utils/token";

export default function AddEmployeeForm() {
  const [activeTab, setActiveTab] = useState("basic");
  const methods = useForm({ mode: "onChange", reValidateMode: "onChange" });
  const navigate = useNavigate();
  // determine whether we are in "view/edit" mode (navigated from EmployeeTable LuEye)
  // Freeze the initial detection (read once on mount) so later writes to
  // localStorage (for example when BasicInfo saves and sets the emp_code)
  // do not flip the page into view-mode while the user is creating a new
  // employee. We keep the initial value in state and derive `isViewMode`
  // from it.
  const initialStoredEmpCode =
    typeof window !== "undefined"
      ? localStorage.getItem("employee_emp_code")
      : null;
  const [initialEmpCode] = useState(initialStoredEmpCode);
  const isViewMode = Boolean(initialEmpCode);

  // per-section editing state: when creating a new employee, sections start editable; when viewing, sections start locked
  const initialEditingState = isViewMode
    ? { basic: false, work: false, education: false, emergency: false, exit: false }
    : { basic: true, work: true, education: true, emergency: true, exit: true };
  const [isEditing, setIsEditing] = useState(initialEditingState);

  // If the user opened Add Employee WITHOUT an emp code (create flow), ensure
  // we don't accidentally keep stale employee identifiers in localStorage.
  // Only run this on mount and only when there was no initial emp code.
  useEffect(() => {
    try {
      if (!initialEmpCode && typeof window !== "undefined") {
        localStorage.removeItem("employee_emp_code");
        localStorage.removeItem("employee_db_id");
      }
    } catch (e) {
      console.error("Failed to clear stale employee identifiers", e);
    }
    // run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = (data) => {
    console.log("Employee Form Data:", data);
    // TODO: API call here
  };

  // If employee_emp_code is present in localStorage (set by EmployeeTable view), fetch all section data
  useEffect(() => {
    const empCode =
      typeof window !== "undefined" &&
      localStorage.getItem("employee_emp_code");
    const orgFromStorage =
      typeof window !== "undefined" && localStorage.getItem("org_code");
    const orgFromToken = getOrgCode && getOrgCode();
    const orgId = orgFromToken || orgFromStorage || null;
    if (!empCode) return;

    const fetchAll = async () => {
      try {
        const formatDateForInput = (val) => {
          if (!val) return "";
          try {
            const d = new Date(val);
            if (isNaN(d)) return "";
            return d.toISOString().slice(0, 10);
          } catch (e) {
            return "";
          }
        };
        // 1. Basic information
        const basicRes = await api.get(
          `/employee/get_employee_basic_information?employee_id=${encodeURIComponent(
            empCode
          )}${orgId ? `&org_id=${encodeURIComponent(orgId)}` : ""}`
        );
        let basic = basicRes?.data?.data ?? basicRes?.data ?? {};
        if (Array.isArray(basic)) basic = basic[0] || {};
        // Map common fields if present
        methods.setValue(
          "firstName",
          basic.first_name || basic.firstName || ""
        );
        methods.setValue(
          "middleName",
          basic.middle_name || basic.middleName || ""
        );
        methods.setValue("lastName", basic.last_name || basic.lastName || "");
        methods.setValue("gender", basic.gender || "");
        methods.setValue(
          "dob",
          formatDateForInput(basic.dob || basic.date_of_birth || "")
        );
        methods.setValue(
          "employeeId",
          basic.employee_code || ""
        );
        methods.setValue("employee_emp_code", empCode);
        if (basic._id || basic.id)
          methods.setValue("employee_db_id", basic._id || basic.id);
        methods.setValue("bloodGroup", basic.blood_group || "");
        methods.setValue("maritalStatus", basic.marital_status || "");
        methods.setValue("nationality", basic.nationality || "");
        methods.setValue("designation", basic.designation || "");
        methods.setValue("personalEmail", basic.personal_email || "");
        methods.setValue("email", basic.email || "");
        methods.setValue("roles", basic.role || "");
        methods.setValue("phoneNumber", basic.mobile || basic.phone || "");
        // Set password length and masked password for display (do not expose actual hash)
        if (basic.password_length) {
          methods.setValue("password_length", basic.password_length);
          methods.setValue("password", "*".repeat(basic.password_length));
        } else {
          // If server returned a cleartext password unexpectedly, mask it as fallback
          if (basic.password && typeof basic.password === "string") {
            methods.setValue("password_length", basic.password.length);
            methods.setValue("password", "*".repeat(basic.password.length));
          }
        }

        // 2. Contact information
        try {
          const contactRes = await api.get(
            `/employee/get_employee_contact_information?employee_id=${encodeURIComponent(
              empCode
            )}${orgId ? `&org_id=${encodeURIComponent(orgId)}` : ""}`
          );
          const raw = contactRes?.data?.data ?? contactRes?.data ?? [];
          let perm = {};
          let comm = {};

          if (Array.isArray(raw)) {
            raw.forEach((c) => {
              const at = c.address_type || c.addressType || c.type;
              if (Number(at) === 1) {
                perm = c;
              } else if (Number(at) === 2) {
                comm = c;
              }
            });
          } else if (raw && typeof raw === "object") {
            perm =
              raw.permanent_address ||
              raw.permanent ||
              raw.permanentAddress ||
              {};
            comm =
              raw.communication_address ||
              raw.communication ||
              raw.communicationAddress ||
              {};
          }

          methods.setValue(
            "permAddressLine1",
            perm.address_line1 || perm.address_line_1 || ""
          );
          methods.setValue(
            "permAddressLine2",
            perm.address_line2 || perm.address_line_2 || ""
          );
          methods.setValue("permCity", perm.city || "");
          methods.setValue("permDistrict", perm.district || "");
          methods.setValue("permState", perm.state || "");
          methods.setValue("permCountry", perm.country || "");
          methods.setValue(
            "permPostalCode",
            perm.postal_code || perm.postalCode || ""
          );

          methods.setValue(
            "commAddressLine1",
            comm.address_line1 || comm.address_line_1 || ""
          );
          methods.setValue(
            "commAddressLine2",
            comm.address_line2 || comm.address_line_2 || ""
          );
          methods.setValue("commCity", comm.city || "");
          methods.setValue("commDistrict", comm.district || "");
          methods.setValue("commState", comm.state || "");
          methods.setValue("commCountry", comm.country || "");
          methods.setValue(
            "commPostalCode",
            comm.postal_code || comm.postalCode || ""
          );

          // store normalized contact for section-local initialization
          const stored = {
            permanent_address: perm,
            communication_address: comm,
          };
          if (typeof window !== "undefined")
            localStorage.setItem("employee_contact", JSON.stringify(stored));
        } catch (e) {
          console.warn("Failed to fetch contact information", e);
        }

        // 3. Work details
        try {
          const workRes = await api.get(
            `/employee/get_employee_work_details?employee_id=${encodeURIComponent(
              empCode
            )}${orgId ? `&org_id=${encodeURIComponent(orgId)}` : ""}`
          );
          let work = workRes?.data?.data ?? workRes?.data ?? {};
          if (Array.isArray(work)) work = work[0] || {};
          methods.setValue(
            "has_existing_default_shift",
            Boolean(work.shift || work.fallback_shift_id)
          );
          // set primitive/display fields
          methods.setValue("employment_type", work.employment_type || "");
          methods.setValue(
            "department_name",
            work.department_name || work.department || ""
          );
          methods.setValue(
            "division_name",
            work.division_name || work.division || ""
          );
          methods.setValue("band_name", work.band_name || work.band || "");
          methods.setValue(
            "position_name",
            work.position_name || work.position || ""
          );
          methods.setValue(
            "location_name",
            work.location_name || work.location || ""
          );
          // Normalize employment_status into the select's expected string values
          try {
            let empStatus = "";
            // Prefer explicit is_active flag from API when present
            if (work.is_active !== undefined && work.is_active !== null) {
              empStatus = work.is_active ? "active" : "inactive";
            } else if (work.employment_status !== undefined && work.employment_status !== null) {
              const val = work.employment_status;
              if (typeof val === "boolean") empStatus = val ? "active" : "inactive";
              else if (typeof val === "number") empStatus = val === 1 ? "active" : "inactive";
              else if (typeof val === "string") {
                const s = String(val).toLowerCase();
                empStatus = s === "true" || s === "active" ? "active" : s === "false" || s === "inactive" ? "inactive" : "";
              }
            }
            methods.setValue("employment_status", empStatus);
          } catch (e) {
            methods.setValue("employment_status", "");
          }

          // also set the *_id fields if available (preferred by WorkInfoSection selects)
          if (work.department_id || work.department) {
            methods.setValue(
              "department_id",
              work.department_id || work.department
            );
          }
          if (work.band_id || work.band) {
            methods.setValue("band_id", work.band_id || work.band);
          }
          if (work.position_id || work.position) {
            methods.setValue("position_id", work.position_id || work.position);
          }
          if (work.location_id || work.location) {
            methods.setValue("location_id", work.location_id || work.location);
          }
          methods.setValue(
            "probation_start_date",
            formatDateForInput(work.probation_start_date || "")
          );
          methods.setValue(
            "probation_end_date",
            formatDateForInput(work.probation_end_date || "")
          );
          if (typeof window !== "undefined")
            localStorage.setItem("employee_work", JSON.stringify(work));
        } catch (e) {
          console.warn("Failed to fetch work details", e);
        }

        // 4. Previous experience
        try {
          const prevRes = await api.get(
            `/employee/get_employee_previous_experience?employee_id=${encodeURIComponent(
              empCode
            )}${orgId ? `&org_id=${encodeURIComponent(orgId)}` : ""}`
          );
          const prevRaw = prevRes?.data?.data ?? prevRes?.data ?? [];
          // normalize each entry into the shape PrevExperience expects
          const prev = Array.isArray(prevRaw)
            ? prevRaw.map((p) => ({
              name: p.company_name || p.company || p.name || "",
              title: p.job_title || p.title || "",
              description: p.job_description || p.description || "",
              // keep ISO or formatted date; components currently display raw value
              start: p.start_date || p.start || "",
              end: p.end_date || p.end || "",
              _id: p._id || p.id || null,
            }))
            : [];
          if (typeof window !== "undefined")
            localStorage.setItem(
              "employee_prev_experience",
              JSON.stringify(prev)
            );
        } catch (e) {
          console.warn("Failed to fetch previous experience", e);
        }

        // 5. Education
        try {
          const eduRes = await api.get(
            `/employee/get_employee_education_details?employee_id=${encodeURIComponent(
              empCode
            )}${orgId ? `&org_id=${encodeURIComponent(orgId)}` : ""}`
          );
          const edu = eduRes?.data?.data ?? eduRes?.data ?? [];
          if (typeof window !== "undefined")
            localStorage.setItem("employee_education", JSON.stringify(edu));
        } catch (e) {
          console.warn("Failed to fetch education details", e);
        }

        // 6. Emergency contacts
        try {
          const emRes = await api.get(
            `/employee/get_employee_emergency_contacts?employee_id=${encodeURIComponent(
              empCode
            )}${orgId ? `&org_id=${encodeURIComponent(orgId)}` : ""}`
          );
          const ems = emRes?.data?.data ?? emRes?.data ?? [];
          if (typeof window !== "undefined")
            localStorage.setItem(
              "employee_emergency_contacts",
              JSON.stringify(ems)
            );
        } catch (e) {
          console.warn("Failed to fetch emergency contacts", e);
        }
      } catch (err) {
        console.error("Preload employee data failed", err);
      }
    };

    fetchAll();
  }, []);

  // Map tab key to section component
  const renderSection = () => {
    switch (activeTab) {
      case "basic":
        return (
          <PrimaryInfoSection
            isViewMode={isViewMode}
            isEditing={isEditing.basic}
            setIsEditing={(val) =>
              setIsEditing((prev) => ({ ...prev, basic: val }))
            }
          />
        );
      case "work":
        return (
          <WorkInfoSection
            isViewMode={isViewMode}
            isEditing={isEditing.work}
            setIsEditing={(val) =>
              setIsEditing((prev) => ({ ...prev, work: val }))
            }
          />
        );
      case "education":
        return <EducationDetailSection />;
      case "emergency":
        return <EmergencyContactSection />;
      // case "documents":
      //   return <DocumentsSection />;
      // case "compensation":
      //   return <CompensationSection />;
      case "exit":
        return (
          <EmployeeExitSection
            isViewMode={isViewMode}
            isEditing={isEditing.exit}
            setIsEditing={(val) =>
              setIsEditing((prev) => ({ ...prev, exit: val }))
            }
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box
      //  mt={2} 
      // p={{ base: 2, sm: 2, md: 3, lg: 6 }}
      h={{ base: "78vh", sm: "79vh", md: "80vh", lg: "85.5vh" }}
      mt={{ base: "9.1vh", sm: "7.5vh", md: "6.3vh", lg: 2 }}
      w={{ base: "96vw", sm: "96vw", md: "96vw", lg: "100%" }}
      ml={{ base: "2.0vw", sm: "2.0vw", md: "2.0vw", lg: "0vw" }}
      mr={{ base: "2.0vw", sm: "2.0vw", md: "2.0vw", lg: "0vw" }}
    // mr={-1}
    >
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Box borderRadius="lg" pt={1} w={"100%"}>
            <Flex align="center" mb={4} gap={4}>
              <IconButton
                icon={<ChevronLeftIcon />}
                aria-label="Go Back"
                onClick={() => navigate("/employee")}
                bg="blue.900"
                color="white"
                borderRadius="full"
                _hover={{ bg: "blue.800" }}
                size="md"
              />
              {/* Breadcrumb */}
              <Breadcrumb
                spacing="4px"
                separator={<ChevronRightIcon color="gray.500" />}
              >
                <BreadcrumbItem>
                  <BreadcrumbLink onClick={() => navigate("/employee")} color={'#757575'}>
                    Employees
                  </BreadcrumbLink>
                </BreadcrumbItem>

                <BreadcrumbItem isCurrentPage>
                  <BreadcrumbLink color={'#000'}>Employee information</BreadcrumbLink>
                </BreadcrumbItem>
              </Breadcrumb>
            </Flex>

            {/* Navbar */}
            <Box>
              <EmployeeTabsNavbar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            </Box>

            {/* Section Content */}
            <Box mt={4}>{renderSection()}</Box>
          </Box>
        </form>
      </FormProvider>
    </Box>
  );
}
