import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  IconButton,
} from "@chakra-ui/react";
import { ChevronRightIcon, ChevronLeftIcon } from "@chakra-ui/icons";
import { useNavigate, useLocation } from "react-router-dom";
import HrPolicies from "../../routes/settingsRoutes/hrPolicies/HrPolicies";

export default function BreadcrumbsNav({ extraSegments = [] }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isMongoId = (seg) => /^[a-f\d]{24}$/i.test(seg);

  const ignoreSegments = new Set([
    "CheckInCheckOutSettings",
    "SiftSetting",
    // "shiftSetting",  // DO NOT IGNORE
    // "Settings",      // DO NOT IGNORE

    "adminview",
    "Attendances",
    "calendar",
    "add",
    "HrPolicies",
    "edit",
  ]);

  const segments = location.pathname
    .split("/")
    .filter(Boolean)
    .filter(
      (seg) =>
        !ignoreSegments.has(seg) &&
        seg.toLowerCase() !== "settings-to-ignore" &&
        !isMongoId(seg),
    )
    .concat(
      extraSegments.filter(
        (seg) =>
          !ignoreSegments.has(seg) &&
          seg.toLowerCase() !== "settings-to-ignore",
      ),
    );

  // Map segment -> human readable label
  const labelMap = {
    profile: "My Profile",
    settings: "Settings",
    "hr-policy": "HR Policies",
    organization: "Organization settings",
    account: "Account Settings",
    employee: "Employee Fields",
    "leave-tracker": "Leave Tracker Settings",
    "leave-types": "Leave Types",
    "add-leaves": "Add Leaves",
    "calendar-settings": "Calendar Settings",
    calenderSettings: "Settings",
    department: "Departments",
    assets: "Assets",
    "asset-fields": "Asset Fields",
    add: "Add",

    "add-marital-status": "Add Marital Status",
    "add-visa": "Add Visa",
    "add-qualification": "Add Qualification",
    "add-division": "Add Division",
    "add-emergency-contact": "Add Emergency Contact",
    "add-designation": "Add Designation",
    "add-nationality": "Add Nationality",
    "add-reason-for-exit": "Add Reason for Exit",
    "add-employment-type": "Add Employment Type",
    "add-dependency-relationship": "Add Dependency Relationship",
    "add-band": "Add Band",
    "add-compensation-change": "Add Compensation Change",
    "add-document": "Add Document",
    "add-asset-category": "Add Asset Category",
    "add-vendors": "Add Vendors",
    "add-brands": "Add Brands",
    "add-office-locations": "Add Office Locations",
    "add-billing-notification": "Add Billing Notification",
    "add-general-details": "Add General Details",
    "add-subscription-details": "Add Subscription Details",
    "add-address-details": "Add Address Details",
    "add-roles": "Add Roles",
    "set-roles": "Set Roles",
    "update-password": "Update Password",

    "EmployeecheckInCheckOutSettings": "Attendance Tracker settings",
    "employee-check-in-check-out": "Employee check-in / Check-out",

    // IMPORTANT
    AttendanceTrackerSetting: "Attendance Tracker settings",

    checkInCheckOutSettings: "Attendance Tracker settings",

    "check-in_Check-out": "Check-in / Check-out settings",

    "shift-setting": "Shift Settings",
    shiftSetting: "Shift Settings",

    employeeVew: "Employee Details",
    "team-attendance": "Team Attendance",

    "Hr-Settings": "Settings",
    settings1: "Settings",

    HR_Policies_emp: "HR Policies",
  };

  /*
   * Remove duplicate breadcrumb labels.
   *
   * Example:
   * Settings
   * Attendance Tracker settings
   * Attendance Tracker settings
   * Employee check-in / Check-out
   *
   * becomes:
   * Settings
   * Attendance Tracker settings
   * Employee check-in / Check-out
   */
  const uniqueSegments = segments.filter((seg, index, arr) => {
    const label =
      labelMap[seg] || (seg ? seg.charAt(0).toUpperCase() + seg.slice(1) : "");

    return (
      arr.findIndex((item) => {
        const itemLabel =
          labelMap[item] ||
          (item ? item.charAt(0).toUpperCase() + item.slice(1) : "");

        return itemLabel === label;
      }) === index
    );
  });

  // Segments for which we don't want to deep-link into
  const forceToSettings = new Set([
    "organization",
    "account",
    "employee",
    "assets",
    "asset-fields",
    "departments",
  ]);

  const forceToLeavesTracker = new Set([
    "add-leaves",
    "leave-tracker",
    "leave-types",
  ]);

  const routeMap = {
    AttendanceTrackerSetting: "/settings/AttendanceTrackerSetting",
    checkInCheckOutSettings: "/settings/AttendanceTrackerSetting",
    "check-in_Check-out": "/settings/AttendanceTrackerSetting",
    EmployeecheckInCheckOutSettings: "/settings/AttendanceTrackerSetting",

    "shift-setting": "/settings/AttendanceTrackerSetting",

    employeeVew: "/attendances",
    "team-attendance": "/attendances",

    divisions: "/settings/organization/employee/divisions",
    nationalities: "/settings/organization/employee/nationalities",

    departments: "/settings",
    department: "/settings/organization/employee/department",

    "leave-types": "/settings/leave-tracker/leave-types",

    designation: "/settings/organization/employee/designation",

    "reason-for-exit": "/settings/organization/employee/reason-for-exit",

    bands: "/settings/organization/employee/bands",

    employmenttypes: "/settings/organization/employee/employment-types",

    maritalstatus: "/settings/organization/employee/marital-status",

    roles: "/settings/organization/account/roles",

    "add-roles": "/settings/organization/account/roles/add-roles",

    "office-locations": "/settings/organization/account/office-locations",

    "company-profile": "/settings/organization/account/company-profile",

    categories: "/settings/organization/asset-fields/categories",

    vendors: "/settings/organization/asset-fields/vendors",

    brands: "/settings/organization/asset-fields/brands",

    qualifications: "/settings/organization/employee/qualifications",

    "hr-policies": "/settings/HrPolicies",

    HR_Policies_emp: "/hrpolicies",
  };

  const handleCrumbClick = (idx, seg) => {
    if (routeMap[seg]) {
      navigate(routeMap[seg]);
      return;
    }

    // Special case: Calendar Settings should go back to previous page
    if (seg === "calendar-settings") {
      navigate(-1);
      return;
    }

    if (seg === "team-attendance") {
      navigate("/attendances", {
        state: { activeTab: "team_attendance" },
      });
      return;
    }

    if (forceToSettings.has(seg)) {
      navigate("/settings");
      return;
    }

    if (forceToLeavesTracker.has(seg)) {
      console.log("Clicked segment:", seg);
      navigate("/settings/leave-tracker");
      return;
    }

    if (
      seg === "HR Policies" ||
      seg === "Details" ||
      seg === "settings1" ||
      seg === "Edit" ||
      seg === "HrPolicies" ||
      seg === "hr-policies" ||
      /^[a-f\d]{24}$/i.test(seg)
    ) {
      navigate("/settings/HrPolicies");
      return;
    }

    if (seg === "HR_Policies_emp" || /^[a-f\d]{24}$/i.test(seg)) {
      navigate("/hrpolicies");
      return;
    }

    const path = "/" + uniqueSegments.slice(0, idx + 1).join("/");

    navigate(path);
  };
  const isDependencyRelationshipPage = location.pathname
    .toLowerCase()
    .includes("dependency-relationship");

  return (
    <Box display="flex" alignItems="center" mb={4}>
      <IconButton
        icon={<ChevronLeftIcon boxSize={6} />}
        aria-label="Go Back"
        onClick={() => navigate(-1)}
        bg="blue.900"
        color="white"
        borderRadius="full"
        _hover={{ bg: "blue.800" }}
        size="md"
        marginRight={4}
      />

      <Breadcrumb
        spacing="8px"
        separator={<ChevronRightIcon color="gray.500" />}
      >
        {uniqueSegments.map((seg, idx) => {
          const isCurrent = idx === uniqueSegments.length - 1;

          const label =
            labelMap[seg] ||
            (seg ? seg.charAt(0).toUpperCase() + seg.slice(1) : "");

          const clickable = routeMap[seg] || !isCurrent;

          const title =
            forceToSettings.has(seg) && clickable
              ? "Return to Settings"
              : clickable
                ? `Go to ${label}`
                : undefined;

          return (
            <BreadcrumbItem key={seg + idx} isCurrentPage={isCurrent}>
              <BreadcrumbLink
                onClick={() => clickable && handleCrumbClick(idx, seg)}
                fontWeight="500"
                cursor={clickable ? "pointer" : "default"}
                title={title}
                tabIndex={clickable ? 0 : -1}
                fontFamily="poppins"
                color={isCurrent ? "#000" : "#757575"}
                fontSize={{
                  base: "8px",
                  sm: "11px",
                  md: "13px",
                  lg: "16px",
                }}
                // fontSize={
                //   isDependencyRelationshipPage
                //     ? {
                //         base: "8px",
                //         sm: "9px",
                //         md: "10px",
                //         lg: "12px",
                //       }
                //     : {
                //         base: "8px",
                //         sm: "11px",
                //         md: "13px",
                //         lg: "16px",
                //       }
                // }
              >
                {label}
              </BreadcrumbLink>
            </BreadcrumbItem>
          );
        })}
      </Breadcrumb>
    </Box>
  );
}
