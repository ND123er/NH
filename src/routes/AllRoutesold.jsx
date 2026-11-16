import React, { Suspense, lazy, useEffect, useState } from "react";
import { Route, Routes, Navigate, useNavigate } from "react-router-dom";
import { Center, Spinner } from "@chakra-ui/react";
import Cookies from "js-cookie";
import PublicRoute from "./PublicRoute";
import NotFound from "../pages/NotFound";
/* ---------- Lazy Pages ---------- */
const LoginPage = lazy(() => import("../pages/LoginPanel"));
const Dashboard = lazy(() =>
  import("../pages/Dashboard").then((mod) => ({ default: mod.Dashboard })),
);
const Employee = lazy(() =>
  import("../pages/Employee").then((mod) => ({ default: mod.Employee })),
);

const RegistrationPage = lazy(() => import("../pages/Registration"));
const Enrollment = lazy(() => import("../pages/Enrollment"));
const PasswordSetup = lazy(() => import("../pages/PasswordSetup"));
const RecoveryCodes = lazy(() => import("../pages/RecoveryCodes"));
const Mfa = lazy(() => import("../pages/Mfa"));
const RecoveryOptions = lazy(() => import("../pages/RecoveryOptions"));
const AccountSecurity = lazy(() => import("../pages/AccountSecurity"));
const AddEmployee = lazy(() => import("../pages/AddEmployee"));
const OrganizationRegister = lazy(
  () => import("../pages/OrganizationRegister"),
);
const Settings = lazy(() => import("../pages/settings/OrganisationSettings"));
const Assets = lazy(() => import("../pages/Assets"));
const AddAsset = lazy(() => import("../pages/AddAsset"));
const LeaveTracker = lazy(() => import("../pages/LeaveTracker"));
const AttendanceTracker = lazy(() => import("../pages/AttendanceTracker"));
const AdminView = lazy(
  () => import("../components/Attendance_Tracker/AdminView"),
);
const ReportsView = lazy(() => import("../pages/Reports"));
const ForgotPassword = lazy(() => import("../pages/ForgotPassword"));
const AccountRecovery = lazy(() => import("../pages/AccountRecovery"));
/* ---------- Attendance Settings ---------- */
const AttendanceTrackerSetting = lazy(
  () => import("../components/Attendance_Tracker/AttendanceTrackerSetting"),
);
const ShiftSettingsSection = lazy(
  () => import("../components/Attendance_Tracker/ShiftSettingsSection"),
);

const AttendanceShiftSetting = lazy(
  () => import("../components/Attendance_Tracker/AttendanceSiftSetting"),
);

const EmployeecheckInCheckOutSettings = lazy(
  () =>
    import(
      "../components/Settings/AttendanceSettings/EmployeecheckInCheckOutSettings"
    ),
);

/* ---------- Employee Settings Routes ---------- */
const DepartmentRoutes = lazy(
  () => import("./settingsRoutes/employeeRoutes/SettingsDepartmentRoutes"),
);
const MaritalStatusRoutes = lazy(
  () => import("./settingsRoutes/employeeRoutes/MaritalStatusRoutes"),
);
const VisaRoutes = lazy(
  () => import("./settingsRoutes/employeeRoutes/VisaRoutes"),
);
const QualificationRoutes = lazy(
  () => import("./settingsRoutes/employeeRoutes/QualificationRoutes"),
);
const DivisionRoutes = lazy(
  () => import("./settingsRoutes/employeeRoutes/DivisionRoutes"),
);
const EmergencyContactRoutes = lazy(
  () => import("./settingsRoutes/employeeRoutes/EmergencyContactRoutes"),
);
const JobTitleRoutes = lazy(
  () => import("./settingsRoutes/employeeRoutes/JobTitleRoutes"),
);
const NationalityRoutes = lazy(
  () => import("./settingsRoutes/employeeRoutes/NationalityRoutes"),
);
const ExitRoutes = lazy(
  () => import("./settingsRoutes/employeeRoutes/ReasonsForExitRoutes"),
);
const EmploymentTypeRoutes = lazy(
  () => import("./settingsRoutes/employeeRoutes/EmploymentTypeRoutes"),
);
const DependencyDetailsRoutes = lazy(
  () => import("./settingsRoutes/employeeRoutes/DependencyDetailsRoutes"),
);
const BandRoutes = lazy(
  () => import("./settingsRoutes/employeeRoutes/BandsRoutes"),
);
const CompensationRoutes = lazy(
  () => import("./settingsRoutes/employeeRoutes/CompensationRoutes"),
);
const EmpDocsRoutes = lazy(
  () => import("./settingsRoutes/employeeRoutes/EmpDocsRoutes"),
);

/* ---------- Asset Settings Routes ---------- */
const CategoriesRoutes = lazy(
  () => import("./settingsRoutes/assetRoutes/CategoriesRoutes"),
);
const VendorsRoutes = lazy(
  () => import("./settingsRoutes/assetRoutes/VendorsRoutes"),
);
const BrandsRoutes = lazy(
  () => import("./settingsRoutes/assetRoutes/BrandsRoutes"),
);

/* ---------- Account Settings Routes ---------- */
const OfficeLocationRoutes = lazy(
  () => import("./settingsRoutes/accountRoutes/OfficeLocationRoutes"),
);
const BillingNotificationRoutes = lazy(
  () => import("./settingsRoutes/accountRoutes/BillingNotificationRoutes"),
);
const CompanyProfileRoutes = lazy(
  () => import("./settingsRoutes/accountRoutes/CompanyProfileRoutes"),
);
const RolesRoutes = lazy(
  () => import("./settingsRoutes/accountRoutes/RolesRoutes"),
);
const ThemesRoutes = lazy(
  () => import("./settingsRoutes/accountRoutes/ThemeRoutes"),
);
const EmailsRoutes = lazy(
  () => import("./settingsRoutes/accountRoutes/EmailRoutes"),
);

/* ---------- Leave Settings ---------- */
const LeavesRoutes = lazy(
  () => import("./settingsRoutes/leaveRoutes/LeavesRoutes"),
);

/* ---------- Layout & Guards ---------- */
import AppLayout from "../layouts/AppLayout";
import ProtectedRoute from "./ProtectedRoute";
import { decodeTokenPayload } from "../utils/token";
import Inbox from "../components/Inbox/Inbox";
import PerformanceManagement from "../components/PerformanceManagement/PerformanceManagement";
import Payroll from "../components/Payroll/Payroll";
import Help from "../components/Dashboard/Help";
import Reports from "../components/Asset/Reports";
import ReportSideBar from "../components/Reports/ReportSideBar";
import CheckInCheckOutSettings from "../components/Settings/AttendanceSettings/CheckOutCheckInSettings";
import PerformanceManagementRoutes from "./settingsRoutes/performanceManagementRoutes/PerformanceManagementRoutes";
import HrRoutes from "./settingsRoutes/hrRoutes/HrRoutes";
import HrPolicies from "./settingsRoutes/hrPolicies/HrPolicies";
import TeamAttendanceTable from "../components/Attendance_Tracker/TeamAttendanceTable";
import AttendanceTabsNavbar from "../components/Attendance_Tracker/AttendanceTabsNavbar";
import SettingsAnnouncements from "../components/Announcements/SettingsAnnouncements";
import HrPoliciesEmployee from "../components/HrPoliciesEmployee/HrPoliciesEmployee";
import EditHrPolicy from "./settingsRoutes/hrPolicies/EditHrPolicy";
import EditHrPoliciesEmployee from "../components/HrPoliciesEmployee/EditHrPoliciesEmployee";
import ResignedEmployee from "../components/Employees/ResignedEmployee";
import PerformanceManagementMain from "../pages/dashboard/PerformanceManagementMain";
import ReviewerFeedbackDetails from "../components/PerformanceManagement/pmcomponents/ReviewerFeedbackDetails";
// import {  Spinner } from "@chakra-ui/react";

/* ---------- ROUTES ---------- */
export const AllRoutes = () => {
  const cookieToken = Cookies.get("auth_token");
  // Prefer decoding token from cookie (set on login); fallback to localStorage token.
  const payload =
    decodeTokenPayload(cookieToken) || decodeTokenPayload?.() || {};
  const isAdmin = payload?.is_admin;
  //  const isAdmin = payload?.role;
  const isOrgPresent =
    payload?.is_org_present ?? payload?.isOrgPresent ?? false;
  const token = cookieToken || Cookies.get("auth_token");
  // const navigate = useNavigate();
  // const [initialChecked, setInitialChecked] = useState(false);

  // useEffect(() => {
  //   const token = Cookies.get("auth_token");

  //   if (token) {
  //     navigate("/dashboard", { replace: true });
  //   } else {
  //     navigate("/", { replace: true });
  //   }
  //   setInitialChecked(true);
  // }, []);

  // if (!initialChecked) {
  //   return (
  //     <Center h="100vh">
  //       <Spinner size="xl" />
  //     </Center>
  //   );
  // }

  return (
    <Routes>
      {/* ---------- Public Routes ---------- */}
      <Route element={<PublicRoute />}>
        <Route
          path="/"
          element={
            <Suspense
              fallback={
                <Center h="100vh">
                  <Spinner size="xl" />
                </Center>
              }
            >
              <LoginPage />
            </Suspense>
          }
        />
        {/* <Route
        path="/"
        element={
          token ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Suspense
              fallback={
                <Center h="100vh">
                  <Spinner size="xl" />
                </Center>
              }
            >
              <LoginPage />
            </Suspense>
          )
        }
      /> */}
        <Route
          path="/register"
          element={
            <Suspense
              fallback={
                <Center h="60vh">
                  <Spinner size="lg" />
                </Center>
              }
            >
              <RegistrationPage />
            </Suspense>
          }
        />

        <Route
          path="/forgot-password"
          element={
            <Suspense
              fallback={
                <Center h="60vh">
                  <Spinner size="lg" />
                </Center>
              }
            >
              <ForgotPassword />
            </Suspense>
          }
        />

        <Route
          path="/account/recovery"
          element={<Suspense fallback={<Center h="60vh"><Spinner size="lg" /></Center>}><AccountRecovery /></Suspense>}
        />
        <Route
          path="/password"
          element={
            <Suspense
              fallback={
                <Center h="60vh">
                  <Spinner size="lg" />
                </Center>
              }
            >
              <PasswordSetup />
            </Suspense>
          }
        />
        <Route
          path="/enrollment"
          element={
            <Suspense
              fallback={
                <Center h="60vh">
                  <Spinner size="lg" />
                </Center>
              }
            >
              <Enrollment />
            </Suspense>
          }
        />
        <Route path="/recovery-options" element={<RecoveryOptions />} />
        <Route
          path="/mfa"
          element={
            <Suspense
              fallback={
                <Center h="60vh">
                  <Spinner size="lg" />
                </Center>
              }
            >
              <Mfa />
            </Suspense>
          }
        />
        <Route
          path="/recovery-codes"
          element={
            <Suspense
              fallback={
                <Center h="60vh">
                  <Spinner size="lg" />
                </Center>
              }
            >
              <RecoveryCodes />
            </Suspense>
          }
        />
      </Route>

      <Route element={<PublicRoute />}>
        <Route
          path="/orgRegister"
          element={
            <Suspense
              fallback={
                <Center h="60vh">
                  <Spinner size="lg" />
                </Center>
              }
            >
              <OrganizationRegister />
            </Suspense>
          }
        />
      </Route>

      {/* ---------- Protected Routes ---------- */}
      <Route element={<ProtectedRoute />}>
        <Route path="/account/security" element={<AccountSecurity />} />
        <Route element={<AppLayout />}>
          <Route
            path="/dashboard"
            element={
              <Suspense
                fallback={
                  <Center h="40vh">
                    <Spinner size="md" />
                  </Center>
                }
              >
                <Dashboard />
              </Suspense>
            }
          />
          {/* new */}
          {/* <Route
            path="/dashboardnew"
            element={
              <Suspense
                fallback={
                  <Center h="40vh">
                    <Spinner size="md" />
                  </Center>
                }
              >
                <DashboardNavNew />
              </Suspense>
            }
          /> */}

          <Route
            path="/employee"
            element={
              <Suspense
                fallback={
                  <Center h="40vh">
                    <Spinner size="md" />
                  </Center>
                }
              >
                <Employee />
              </Suspense>
            }
          />
          <Route
            path="/employee/resigned"
            element={
              <Suspense
                fallback={
                  <Center h="40vh">
                    <Spinner size="md" />
                  </Center>
                }
              >
                <ResignedEmployee />
              </Suspense>
            }
          />

          <Route
            path="/employee/add"
            element={
              <Suspense
                fallback={
                  <Center h="40vh">
                    <Spinner size="md" />
                  </Center>
                }
              >
                <AddEmployee />
              </Suspense>
            }
          />

          <Route
            path="/settings"
            element={
              <Suspense
                fallback={
                  <Center h="40vh">
                    <Spinner size="md" />
                  </Center>
                }
              >
                <Settings />
              </Suspense>
            }
          />

          <Route
            path="/asset-management"
            element={
              <Suspense
                fallback={
                  <Center h="40vh">
                    <Spinner size="md" />
                  </Center>
                }
              >
                <Assets />
              </Suspense>
            }
          />

          <Route
            path="/asset-management/add"
            element={
              <Suspense
                fallback={
                  <Center h="40vh">
                    <Spinner size="md" />
                  </Center>
                }
              >
                <AddAsset />
              </Suspense>
            }
          />

          <Route
            path="/leaves"
            element={
              <Suspense
                fallback={
                  <Center h="40vh">
                    <Spinner size="md" />
                  </Center>
                }
              >
                <LeaveTracker />
              </Suspense>
            }
          />

          <Route
            path="/attendances"
            element={
              <Suspense
                fallback={
                  <Center h="40vh">
                    <Spinner size="md" />
                  </Center>
                }
              >
                <AttendanceTracker />
              </Suspense>
            }
          />

          <Route
            path="/inbox"
            element={
              <Suspense
                fallback={
                  <Center h="40vh">
                    <Spinner size="md" />
                  </Center>
                }
              >
                <Inbox />
              </Suspense>
            }
          />
          <Route
            path="/performanceManagement"
            element={
              <Suspense
                fallback={
                  <Center h="40vh">
                    <Spinner size="md" />
                  </Center>
                }
              >
                {/* <PerformanceManagement /> */}

                <PerformanceManagementMain />
              </Suspense>
            }
          />
          <Route
            path="/performanceManagement/reviewer-feedback/:appraisalId/:reviewerId"
            element={
              <Suspense
                fallback={
                  <Center h="40vh">
                    <Spinner size="md" />
                  </Center>
                }
              >
                <ReviewerFeedbackDetails />
              </Suspense>
            }
          />
          <Route
            path="/payroll"
            element={
              <Suspense
                fallback={
                  <Center h="40vh">
                    <Spinner size="md" />
                  </Center>
                }
              >
                <Payroll />
              </Suspense>
            }
          />
          <Route
            path="/hrpolicies"
            element={
              <Suspense
                fallback={
                  <Center h="40vh">
                    <Spinner size="md" />
                  </Center>
                }
              >
                <HrPoliciesEmployee />
              </Suspense>
            }
          />
          <Route
            // path="/HrPolicies/edit/:id"
            path="/settings/HrPolicies/edit/:policyId"
            element={
              <Suspense
                fallback={
                  <Center h="40vh">
                    <Spinner size="md" />
                  </Center>
                }
              >
                <EditHrPolicy />
              </Suspense>
            }
          />
          <Route
            // path="/HrPolicies/edit/:id"
            path="/hrpolicies/:policyId"
            element={
              <Suspense
                fallback={
                  <Center h="40vh">
                    <Spinner size="md" />
                  </Center>
                }
              >
                <EditHrPoliciesEmployee />
              </Suspense>
            }
          />

          {/* HrPoliciesEmployee */}
          <Route
            path="/help"
            element={
              <Suspense
                fallback={
                  <Center h="40vh">
                    <Spinner size="md" />
                  </Center>
                }
              >
                <Help />
              </Suspense>
            }
          />
          <Route
            path="/reports"
            element={
              <Suspense
                fallback={
                  <Center h="40vh">
                    <Spinner size="md" />
                  </Center>
                }
              >
                <ReportsView />
              </Suspense>
            }
          />
          {/* <Route
            path="/team-attendance"
            element={<TeamAttendanceTable />}
          /> */}
          <Route
            path="/attendance-tabs-Navbar"
            element={<AttendanceTabsNavbar />}
          />

          <Route
            path="/attendances/adminview"
            element={
              <Suspense
                fallback={
                  <Center h="40vh">
                    <Spinner size="md" />
                  </Center>
                }
              >
                <AdminView />
              </Suspense>
            }
          />

          {/* ---------- Employee Settings ---------- */}
          <Route
            path="/settings/organization/employee/department/*"
            element={<DepartmentRoutes />}
          />
          <Route
            path="/settings/organization/employee/marital-status/*"
            element={<MaritalStatusRoutes />}
          />
          <Route
            path="/settings/organization/employee/visas/*"
            element={<VisaRoutes />}
          />
          <Route
            path="/settings/organization/employee/qualifications/*"
            element={<QualificationRoutes />}
          />
          <Route
            path="/settings/organization/employee/divisions/*"
            element={<DivisionRoutes />}
          />
          <Route
            path="/settings/organization/employee/emergency-contacts/*"
            element={<EmergencyContactRoutes />}
          />
          <Route
            path="/settings/organization/employee/designation/*"
            element={<JobTitleRoutes />}
          />
          <Route
            path="/settings/organization/employee/nationalities/*"
            element={<NationalityRoutes />}
          />
          <Route
            path="/settings/organization/employee/reason-for-exit/*"
            element={<ExitRoutes />}
          />
          <Route
            path="/settings/organization/employee/employment-types/*"
            element={<EmploymentTypeRoutes />}
          />
          <Route
            path="/settings/organization/employee/dependency-relationship/*"
            element={<DependencyDetailsRoutes />}
          />
          <Route
            path="/settings/organization/employee/bands/*"
            element={<BandRoutes />}
          />
          <Route
            path="/settings/organization/employee/comp-change-reasons/*"
            element={<CompensationRoutes />}
          />
          <Route
            path="/settings/organization/employee/documents/*"
            element={<EmpDocsRoutes />}
          />

          {/* ---------- Asset Settings ---------- */}
          <Route
            path="/settings/organization/asset-fields/categories/*"
            element={<CategoriesRoutes />}
          />
          <Route
            path="/settings/organization/asset-fields/vendors/*"
            element={<VendorsRoutes />}
          />
          <Route
            path="/settings/organization/asset-fields/brands/*"
            element={<BrandsRoutes />}
          />

          {/* ---------- Account Settings ---------- */}
          <Route
            path="/settings/organization/account/office-locations/*"
            element={<OfficeLocationRoutes />}
          />
          <Route
            path="/settings/organization/account/billing-notifications/*"
            element={<BillingNotificationRoutes />}
          />
          <Route
            path="/settings/organization/account/company-profile/*"
            element={<CompanyProfileRoutes />}
          />
          <Route
            path="/settings/organization/account/roles/*"
            element={<RolesRoutes />}
          />
          <Route
            path="/settings/organization/account/theme/*"
            element={<ThemesRoutes />}
          />
          <Route
            path="/settings/organization/account/email-notifications/*"
            element={<EmailsRoutes />}
          />
          {/* ---------- Leave Settings ---------- */}
          <Route path="/settings/leave-tracker/*" element={<LeavesRoutes />} />
          <Route
            path="/settings/performance-management/*"
            element={<PerformanceManagementRoutes />}
          />
          <Route path="/settings/hr-documents/*" element={<HrRoutes />} />
          <Route path="/settings/HrPolicies/*" element={<HrPolicies />} />
          {/* ---------- Attendance Settings ---------- */}
          <Route
            path="/settings/AttendanceTrackerSetting/EmployeecheckInCheckOutSettings"
            element={
              <Suspense
                fallback={
                  <Center h="40vh">
                    <Spinner size="sm" />
                  </Center>
                }
              >
                <EmployeecheckInCheckOutSettings />
              </Suspense>
            }
          />
          <Route
            path="/settings/AttendanceTrackerSetting/CheckInCheckOutSettings"
            element={
              <Suspense
                fallback={
                  <Center h="40vh">
                    <Spinner size="sm" />
                  </Center>
                }
              >
                <CheckInCheckOutSettings />
              </Suspense>
            }
          />
          <Route
            path="/settings/AttendanceTrackerSetting/shiftSetting"
            element={
              <Suspense
                fallback={
                  <Center h="40vh">
                    <Spinner size="sm" />
                  </Center>
                }
              >
                <AttendanceTrackerSetting />
              </Suspense>
            }
          />
          <Route
            path="/settings/AttendanceTrackerSetting/shiftSetting/patterns"
            element={
              <Suspense
                fallback={
                  <Center h="40vh">
                    <Spinner size="sm" />
                  </Center>
                }
              >
                <ShiftSettingsSection title="Shift Patterns" />
              </Suspense>
            }
          />

          <Route
            path="/settings/AttendanceTrackerSetting/shiftSetting/work-locations"
            element={
              <Suspense
                fallback={
                  <Center h="40vh">
                    <Spinner size="sm" />
                  </Center>
                }
              >
                <ShiftSettingsSection title="Work Locations" />
              </Suspense>
            }
          />
          <Route
            path="/settings/AttendanceTrackerSetting/shiftSetting/attendance-policies"
            element={
              <Suspense
                fallback={
                  <Center h="40vh">
                    <Spinner size="sm" />
                  </Center>
                }
              >
                <ShiftSettingsSection title="Attendance Policies" />
              </Suspense>
            }
          />

          <Route
            path="/settings/AttendanceTrackerSetting"
            element={
              <Suspense
                fallback={
                  <Center h="40vh">
                    <Spinner size="sm" />
                  </Center>
                }
              >
                <AttendanceShiftSetting />
              </Suspense>
            }
          />

          <Route
            // path="/settings/organization/account/company-profile/*"
            path="/settings/organization/announcements/announcements"
            element={<SettingsAnnouncements />}
          />
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
