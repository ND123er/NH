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
    "shiftSetting",
    "Settings",
    'settings',
    "adminview",
    "Attendances",
    "calendar",
    "add",
    "HrPolicies",
    "edit"
  ]);

  const segments = location.pathname
    .split("/")
    .filter(Boolean)
    .filter(
      seg =>
        !ignoreSegments.has(seg) &&
        seg.toLowerCase() !== "Settings" &&
        !isMongoId(seg)
    )
    .concat(
      extraSegments.filter(
        seg =>
          !ignoreSegments.has(seg) &&
          seg.toLowerCase() !== "Settings"
      )
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
    'calenderSettings': 'Settings',
    department: "Departments",
    assets: "Assets",
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
    AttendanceTrackerSetting: 'Settings',
    "checkInCheckOutSettings": "Attendance Tracker settings",
    'check-in_Check-out': 'Check-in / Check-out settings',
    "shift-setting": "Shift Settings",
    // TeamAttendanceTable: 'TeamAttendanceTable',
    // employeeVew: 'Employee Details'
    employeeVew: "Employee Details",
    "team-attendance": "Team Attendance",
    // TeamAttendanceTable: 'TeamAttendanceTable',
    // employeeVew: 'Employee Details'
    "Hr-Settings": 'Settings',
    settings1: 'Settings',
    HR_Policies_emp: 'HR Policies',
    // "hrpolicies":'Settings'

  };

  // Segments for which we don't want to deep-link into (instead return to /settings)

  const forceToSettings = new Set([
    "organization",
    "account",
    "employee",
    "assets",
    "departments",
    // "department"
  ]);

  const forceToLeavesTracker = new Set([
    "add-leaves",
    "leave-tracker",
    "leave-types"
  ]);
  const routeMap = {
    AttendanceTrackerSetting: "/settings/AttendanceTrackerSetting",
    checkInCheckOutSettings: "/settings/AttendanceTrackerSetting",
    "check-in_Check-out": "/settings/AttendanceTrackerSetting",
    "EmployeecheckInCheckOutSettings": "/settings/AttendanceTrackerSetting",
    "shift-setting": '/settings/AttendanceTrackerSetting',
    // employeeVew: "/team-attendance",
    // "team-attendance": "/team-attendance",
    employeeVew: "/attendances",
    "team-attendance": "/attendances",
    divisions: "/settings/organization/employee/divisions",
    nationalities: "/settings/organization/employee/nationalities",
    // departments: "/settings/organization/employee/departments",
    departments: "/settings",
    department: "/settings/organization/employee/department",
    "leave-types" : "/settings/leave-tracker/leave-types",
    designation: "/settings/organization/employee/designation",
    "reason-for-exit": "/settings/organization/employee/reason-for-exit",
    bands: "/settings/organization/employee/bands",
    employmenttypes: "/settings/organization/employee/employment-types",
    maritalstatus: "/settings/organization/employee/marital-status",
    roles: "/settings/organization/account/roles",
    "add-roles": "/settings/organization/account/roles/add-roles",
    "office-locations": "/settings/organization/account/office-locations",
    "company-profile": "/settings/organization/account/company-profile",
    categories: "/settings/organization/assets/categories",
    vendors: "/settings/organization/assets/vendors",
    brands: "/settings/organization/assets/brands",
    qualifications: "/settings/organization/employee/qualifications",
    // HrPolicies: '/settings/HrPolicies'
    "hr-policies": "/settings/HrPolicies",
    "HR_Policies_emp": '/hrpolicies'
  };

  // const handleCrumbClick = (idx, seg) => {
  //   if (idx === segments.length - 1) return;

  //   if (routeMap[seg]) {
  //     navigate(routeMap[seg]);
  //     return;
  //   }
  //   if (forceToSettings.has(seg)) {
  //     navigate("/settings");
  //     return;
  //   }

  //   if (forceToLeavesTracker.has(seg)) {
  //     navigate("/settings/leave-tracker");
  //     return;
  //   }

  //   const path = "/" + segments.slice(0, idx + 1).join("/");
  //   navigate(path);
  // };

  const handleCrumbClick = (idx, seg) => {
    // console.log("Clicked segment:", seg);
    if (routeMap[seg]) {
      // console.log("Navigating to:", routeMap[seg]);
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
        state: { activeTab: "team_attendance" }
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
    //    if (
    //   seg === "HR Policies" ||
    //   seg === "Details" ||
    //   seg === "hr-policies"
    // ) {
    //   navigate("/settings/HrPolicies");
    //   return;
    // }
    if (
      seg === "HR Policies" ||
      seg === "Details" ||
      seg === "settings1" ||
      seg === "Edit" ||
      seg === "HrPolicies" ||
      seg === "hr-policies" ||
      /^[a-f\d]{24}$/i.test(seg) // MongoDB ObjectId
    ) {
      navigate("/settings/HrPolicies");
      return;
    }
    if (
      seg === "HR_Policies_emp" ||
      /^[a-f\d]{24}$/i.test(seg) // MongoDB ObjectId
    ) {
      navigate("/hrpolicies");
      return;
    }

    const path = "/" + segments.slice(0, idx + 1).join("/");
    navigate(path);
  };


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
        // size={{ base: 'md', sm: 'sm', md: 'md', lg: 'md' }}
        marginRight={4}
      />
      <Breadcrumb
        spacing="8px"
        separator={<ChevronRightIcon color="gray.500" />}
      >
        {segments.map((seg, idx) => {
          const isCurrent = idx === segments.length - 1;
          const label =
            labelMap[seg] ||
            (seg ? seg.charAt(0).toUpperCase() + seg.slice(1) : "");
          // const clickable = !isCurrent; 
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
                // onClick={() => handleCrumbClick(idx, seg)}
                onClick={() => clickable && handleCrumbClick(idx, seg)}
                fontWeight={isCurrent ? "500" : "500"}
                cursor={clickable ? "pointer" : "default"}
                title={title}
                // visually de-emphasize current non-clickable crumbs from tab order
                tabIndex={clickable ? 0 : -1}
                fontFamily='poppins'
                color={isCurrent ? "#000" : "#757575"}
                fontSize={{ base: '8px', sm: '11px', md: '13px', lg: '16px' }}

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
