import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Text,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Icon,
} from "@chakra-ui/react";
import { FiFileText } from "react-icons/fi";
import { useSelector } from "react-redux";
import { Upload, RefreshCw } from "lucide-react";
import moment from "moment";
import api from "../../api/axios";
import { getOrgIdFromReduxOrStorage } from "../../utils/token";
import ReportSidebar from "./ReportSideBar";
import ReportFilters from "./ReportFilters";
import ReportTable from "./ReportTable";
// import ReportPagination from "./ReportPagination";
import { reportGroups } from "./reportConfig";

const EMPTY_FILTERS = {
  start_date: "",
  end_date: "",
  department_id: "",
  employee_id: "",
};
const EMPTY_PAGINATION = { page: 1, limit: 50, total: 0, total_pages: 0 };

export default function ReportsLayout({ reportType }) {
  const { user } = useSelector((state) => state.auth);
  const toast = useToast();
  const orgId =
    getOrgIdFromReduxOrStorage(user) ||
    user?.organisation_id ||
    user?.org_id ||
    "";
  const [selectedReport, setSelectedReport] = useState(null);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  //new
  const [dateErrors, setDateErrors] = useState({
  start_date: "",
  end_date: "",
});
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [availability, setAvailability] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [pagination, setPagination] = useState(EMPTY_PAGINATION);
  //new
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const [exportTableData, setExportTableData] = useState({
    columns: [],
    data: [],
  });

  const availableGroup = useMemo(
    () => reportGroups.find((group) => group.key === reportType),
    [reportType],
  );

  useEffect(() => {
    if (!availableGroup?.reports?.length) return;

    setSelectedReport(`${availableGroup.key}/${availableGroup.reports[0].key}`);
    setFilters(EMPTY_FILTERS);
    setData([]);
    setExportTableData({ columns: [], data: [] });
    setColumns([]);
    setAvailability(null);
    setWarnings([]);
    setPagination(EMPTY_PAGINATION);
  }, [availableGroup]);

  const selectedConfig = useMemo(() => {
    if (!selectedReport || !availableGroup) return null;
    const [, report] = selectedReport.split("/");
    return availableGroup.reports.find((item) => item.key === report) || null;
  }, [selectedReport, availableGroup]);
  //new auto generated
  //   useEffect(() => {
  //   if (!selectedConfig) return;

  //   if (!selectedConfig.supportsDateRange) {
  //     generateReport({
  //       page: 1,
  //       limit: pagination.limit,
  //     });
  //   }
  // }, [selectedConfig]);
  //new auto generated

  const loadEmployeeOptions = useCallback(async () => {
    if (!orgId) return;

    setLoadingEmployees(true);
    setLoadingDepartments(true);

    try {
      const [employeeResponse, departmentResponse] = await Promise.all([
        api.get(
          `/employee/get_employees_list?org_id=${encodeURIComponent(
            orgId,
          )}&employee_id=${encodeURIComponent(
            user?.employee_id || "",
          )}&search=&offset=0&limit=200`,
        ),
        api.get(`/organization/get_departments/${orgId}`),
      ]);

      const employeeRows = Array.isArray(employeeResponse?.data?.data)
        ? employeeResponse.data.data
        : [];

      const departmentRows = Array.isArray(departmentResponse?.data)
        ? departmentResponse.data
        : Array.isArray(departmentResponse?.data?.departments)
          ? departmentResponse.data.departments
          : Array.isArray(departmentResponse?.data?.data)
            ? departmentResponse.data.data
            : [];

      setEmployees(
        employeeRows
          .map((item) => {
            const value =
              item.employee_id || item.employee_code || item.id || item._id;

            const label =
              item.full_name ||
              item.name ||
              item.employee_name ||
              item.employee_id;

            return value && label ? { value, label } : null;
          })
          .filter(Boolean),
      );

      setDepartments(
        departmentRows
          .map((item) => {
            const value = item._id || item.id || item.department_id;

            const label =
              item.department_name ||
              item.name ||
              item.department ||
              item.description;

            return value && label ? { value, label: String(label) } : null;
          })
          .filter(Boolean),
      );
    } catch (error) {
      setEmployees([]);
      setDepartments([]);

      toast({
        title: "Failed to load report filters",
        description:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Unable to load employees and departments.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoadingEmployees(false);
      setLoadingDepartments(false);
    }
  }, [orgId, user?.employee_id, toast]);

  useEffect(() => {
    loadEmployeeOptions();
  }, [loadEmployeeOptions]);

  // const handleReportSelect = (key) => {
  //   setSelectedReport(key);
  //   setFilters(EMPTY_FILTERS);
  //   setData([]);
  //   setColumns([]);
  //   setAvailability(null);
  //   setWarnings([]);
  //   setPagination(EMPTY_PAGINATION);
  // };

  const handleReportSelect = (key) => {
    setSelectedReport(key);
    setFilters(EMPTY_FILTERS);
    setData([]);
    setExportTableData({ columns: [], data: [] });
    setColumns([]);
    setAvailability(null);
    setWarnings([]);
    setPagination(EMPTY_PAGINATION);
  };

  // const validateFilters = () => {
  //   if (!selectedConfig) {
  //     toast({
  //       title: "Select a report",
  //       status: "warning",
  //       duration: 3000,
  //       isClosable: true,
  //     });
  //     return false;
  //   }
  //   const { start_date, end_date } = filters;
  //   if ((start_date && !end_date) || (!start_date && end_date)) {
  //     toast({
  //       title: "Both dates are required",
  //       description: "Select both From Date and To Date, or leave both empty.",
  //       status: "warning",
  //       duration: 3000,
  //       isClosable: true,
  //     });
  //     return false;
  //   }
  //   if (start_date && end_date) {
  //     if (moment(end_date).isBefore(moment(start_date), "day")) {
  //       toast({
  //         title: "Invalid date range",
  //         description: "To Date cannot be before From Date.",
  //         status: "warning",
  //         duration: 3000,
  //         isClosable: true,
  //       });
  //       return false;
  //     }
  //     if (
  //       moment(end_date)
  //         .startOf("day")
  //         .diff(moment(start_date).startOf("day"), "days") +
  //         1 >
  //       366
  //     ) {
  //       toast({
  //         title: "Date range too large",
  //         description: "The maximum supported date range is 366 days.",
  //         status: "warning",
  //         duration: 3000,
  //         isClosable: true,
  //       });
  //       return false;
  //     }
  //   }
  //   return true;
  // };

  const validateFilters = () => {
    if (!selectedConfig) {
      toast({
        title: "Select a report",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }
    const { start_date, end_date } = filters;
    if (selectedConfig?.supportsDateRange && (!start_date || !end_date)) {
      toast({
        // title: "Both dates are required",
        description: "Please select From Date and To Date.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }
    if (
      !selectedConfig?.supportsDateRange &&
      ((start_date && !end_date) || (!start_date && end_date))
    ) {
      toast({
        title: "Both dates are required",
        description: "Select both From Date and To Date, or leave both empty.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    if (start_date && end_date) {
      if (moment(end_date).isBefore(moment(start_date), "day")) {
        toast({
          title: "Invalid date range",
          description: "To Date cannot be before From Date.",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        return false;
      }

      if (
        moment(end_date)
          .startOf("day")
          .diff(moment(start_date).startOf("day"), "days") +
          1 >
        366
      ) {
        toast({
          title: "Date range too large",
          description: "The maximum supported date range is 366 days.",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        return false;
      }
    }

    return true;
  };

  const generateReport = async ({
    page = 1,
    limit = pagination.limit,
  } = {}) => {
    if (!validateFilters()) return;
    if (!orgId) {
      toast({
        title: "Organisation ID is missing",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    const [module, report] = selectedReport.split("/");
    const params = new URLSearchParams();
    params.append("organisation_id", orgId);
    if (filters.employee_id) params.append("employee_id", filters.employee_id);
    if (filters.department_id)
      params.append("department_id", filters.department_id);
    if (
      selectedConfig?.supportsDateRange &&
      filters.start_date &&
      filters.end_date
    ) {
      params.append(
        "start_date",
        moment(filters.start_date).format("YYYY-MM-DD"),
      );
      params.append("end_date", moment(filters.end_date).format("YYYY-MM-DD"));
    }
    params.append("page", String(page));
    params.append("limit", String(limit));
    setLoading(true);
    try {
      const response = await api.get(
        `/reports/${module}/${report}?${params.toString()}`,
      );
      if (response.status < 200 || response.status >= 300)
        throw new Error(`Unexpected API response: ${response.status}`);
      //old
      // const result = response.data || {};
      // setData(Array.isArray(result.data) ? result.data : []);
      // setColumns(Array.isArray(result.columns) ? result.columns : []);
      //old

      //new
      const result = response.data || {};
      let reportData = Array.isArray(result.data) ? result.data : [];
      let reportColumns = Array.isArray(result.columns) ? result.columns : [];

      if (
        // selectedReport === "asset/register" && reportData.length > 0
        ["asset/register", "asset/unallocated"].includes(selectedReport) &&
        reportData.length > 0
      ) {
        try {
          const locationResponse = await api.get(
            `/settings/get_company_location_list?org_id=${encodeURIComponent(orgId)}`,
          );

          const locationRows = Array.isArray(locationResponse?.data?.locations)
            ? locationResponse.data.locations
            : [];

          const locationNameById = new Map(
            locationRows
              .filter((location) => location?._id && location?.location_name)
              .map((location) => [
                String(location._id),
                String(location.location_name),
              ]),
          );

          reportData = reportData.map((row) => ({
            ...row,
            asset_location_id:
              locationNameById.get(String(row.asset_location_id)) ||
              row.asset_location_id ||
              "-",
          }));

          reportColumns = reportColumns.map((column) => {
            const key =
              typeof column === "string"
                ? column
                : column?.key || column?.field || column?.name;

            return key === "asset_location_id"
              ? { key, label: "Location" }
              : column;
          });
        } catch (locationError) {
          toast({
            title: "Unable to load office location names",
            description:
              "The Asset Directory was loaded, but some locations may still show their IDs.",
            status: "warning",
            duration: 4000,
            isClosable: true,
          });
        }
      }

      setData(reportData);
      setColumns(reportColumns);
      //new

      setAvailability(result.availability ?? null);
      const apiWarnings = Array.isArray(result.warnings) ? result.warnings : [];
      setWarnings(apiWarnings);

      if (
        Array.isArray(result.data) &&
        result.data.length === 0 &&
        apiWarnings.length > 0
      ) {
        toast({
          title: "Report Warning",
          description:
            apiWarnings[0].length > 100
              ? `${apiWarnings[0].slice(0, 100)}...`
              : apiWarnings[0],
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
      }

      setPagination({
        page: result.pagination?.page ?? page,
        limit: result.pagination?.limit ?? limit,
        total: result.pagination?.total ?? 0,
        total_pages: result.pagination?.total_pages ?? 0,
      });
    } catch (error) {
      setData([]);
      setExportTableData({ columns: [], data: [] });
      setColumns([]);
      setAvailability(null);
      setWarnings([]);
      toast({
        title: "Failed to generate report",
        description:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Unexpected server response.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  //new
  // const exportReportAsCsv = async () => {
  //   if (!selectedReport || !data.length || !orgId) return;

  //   const [module, report] = selectedReport.split("/");
  //   const params = new URLSearchParams();

  //   params.append("organisation_id", orgId);

  //   if (filters.employee_id) {
  //     params.append("employee_id", filters.employee_id);
  //   }

  //   if (filters.department_id) {
  //     params.append("department_id", filters.department_id);
  //   }

  //   if (
  //     selectedConfig?.supportsDateRange &&
  //     filters.start_date &&
  //     filters.end_date
  //   ) {
  //     params.append(
  //       "start_date",
  //       moment(filters.start_date).format("YYYY-MM-DD"),
  //     );
  //     params.append("end_date", moment(filters.end_date).format("YYYY-MM-DD"));
  //   }

  //   params.append("format", "csv");

  //   setExportLoading(true);

  //   try {
  //     const response = await api.get(
  //       `/reports/${module}/${report}?${params.toString()}`,
  //       {
  //         responseType: "blob",
  //       },
  //     );

  //     const blob = new Blob([response.data], {
  //       type: "text/csv;charset=utf-8;",
  //     });

  //     const url = window.URL.createObjectURL(blob);
  //     const link = document.createElement("a");

  //     const fileName = `${selectedReport
  //       .replace("/", "_")
  //       .replace(/\s+/g, "_")}.csv`;

  //     link.href = url;
  //     link.setAttribute("download", fileName);
  //     document.body.appendChild(link);
  //     link.click();
  //     link.remove();

  //     window.URL.revokeObjectURL(url);

  //     setIsExportModalOpen(false);

  //     toast({
  //       title: "Report exported successfully",
  //       status: "success",
  //       duration: 3000,
  //       isClosable: true,
  //     });
  //   } catch (error) {
  //     toast({
  //       title: "Failed to export report",
  //       description:
  //         error?.response?.data?.message ||
  //         error?.message ||
  //         "Unable to export the report as CSV.",
  //       status: "error",
  //       duration: 4000,
  //       isClosable: true,
  //     });
  //   } finally {
  //     setExportLoading(false);
  //   }
  // };

  const exportReportAsCsv = async () => {
    if (!selectedReport || !orgId) {
      toast({
        title: "Unable to export report",
        description: "The selected report or organisation ID is missing.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const { columns: visibleColumns, data: filteredRows } = exportTableData;

    if (!visibleColumns.length || !filteredRows.length) {
      toast({
        title: "No data to export",
        description: "There are no matching rows to include in the CSV.",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setExportLoading(true);

    try {
      // Allow the loading indicator to render before creating the file.
      await new Promise((resolve) => setTimeout(resolve, 0));

      const escapeCsv = (value) => {
        const text =
          value == null
            ? ""
            : typeof value === "object"
              ? JSON.stringify(value)
              : String(value);

        return `"${text.replace(/"/g, '""')}"`;
      };

      const csvRows = [
        visibleColumns.map((column) => escapeCsv(column.label)).join(","),
        ...filteredRows.map((row) =>
          visibleColumns
            .map((column) => escapeCsv(row?.[column.key]))
            .join(","),
        ),
      ];

      const blob = new Blob(["\uFEFF" + csvRows.join("\r\n")], {
        type: "text/csv;charset=utf-8;",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const fileName = `${selectedReport.replace("/", "_")}.csv`;

      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);

      setIsExportModalOpen(false);

      toast({
        title: "Report exported successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Failed to export report",
        description: error?.message || "Unable to export the report as CSV.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setExportLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters(EMPTY_FILTERS);
    setData([]);
    setExportTableData({ columns: [], data: [] });
    setColumns([]);
    setAvailability(null);
    setWarnings([]);
    setPagination(EMPTY_PAGINATION);
  };

  const tableColumns = columns;

  const hiddenColumns =
    selectedReport &&
    (selectedReport.startsWith("employee/") ||
      selectedReport.startsWith("leave/") ||
      selectedReport.startsWith("attendance/") ||
      selectedReport.startsWith("asset/"))
      ? [
          "employee_id",
          "department_id",
          "location_id",
          ...(selectedReport === "employee/master"
            ? [
                "employee_id",
                "mobile",
                "location",
                "joining_date_source",
                "manager_id",
              ]
            : selectedReport === "employee/directory"
              ? ["employee_id", "location", "joining_date_source", "manager_id"]
              : selectedReport === "employee/document-status"
                ? ["location"]
                : selectedReport === "employee/new-joiners"
                  ? [
                      "employee_id",
                      "department_id",
                      "location_id",
                      "location",
                      "employee_code",
                      "email",
                      "mobile",
                      "joining_date_source",
                      "manager_id",
                    ]
                  : selectedReport === "employee/exits"
                    ? [
                        "employee_id",
                        "department_id",
                        "location_id",
                        "location",
                        "notice_period_start",
                        "reason_of_exit",
                      ]
                    : selectedReport === "leave/balance"
                      ? [
                          "employee_id",
                          "department_id",
                          "department",
                          "location_id",
                          "location",
                          "employee_code",
                          "leave_type_id",
                          "opening_days",
                          "allocated_days",
                          "carry_forward_days",
                          "adjusted_days",
                          "expired_days",
                          "utilization_percent",
                        ]
                      : selectedReport === "leave/transaction"
                        ? [
                            "employee_id",
                            "department_id",
                            "location_id",
                            "application_id",
                            "leave_type_id",
                            "leave_name",
                            "status",
                            "reason",
                            "requested_at",
                            "approved_by",
                            "approved_at",
                            "rejection_reason",
                            "event_type",
                            "event_date",
                            "adjustment_days",
                          ]
                        : selectedReport === "leave/history" ||
                            selectedReport === "leave/pending-approval"
                          ? [
                              "employee_id",
                              "department_id",
                              "location_id",
                              "application_id",
                              "leave_type_id",
                              "status",
                              "reason",
                              "requested_at",
                              "approved_by",
                              "approved_at",
                              "rejection_reason",
                            ]
                          : selectedReport === "leave/calendar"
                            ? [
                                "employee_id",
                                "department_id",
                                "location_id",
                                "application_id",
                                "leave_type_id",
                                "status",
                                "reason",
                                "requested_at",
                                "approved_by",
                                "approved_at",
                                "rejection_reason",
                                "date",
                              ]
                            : selectedReport === "leave/utilization"
                              ? [
                                  "employee_id",
                                  "department_id",
                                  "department",
                                  "location_id",
                                  "location",
                                  "leave_type_id",
                                  "opening_days",
                                  "allocated_days",
                                  "carry_forward_days",
                                  "adjusted_days",
                                  "expired_days",
                                ]
                              : selectedReport === "attendance/daily" ||
                                  selectedReport === "attendance/register"
                                ? [
                                    "employee_id",
                                    "department_id",
                                    "location_id",
                                    "check_in_time",
                                    "check_out_time",
                                    "total_work_minutes",
                                    "required_minutes",
                                    "late_minutes",
                                    "early_leaving_minutes",
                                    "overtime_minutes",
                                    "missing_punch",
                                    "is_checked_in",
                                  ]
                                : selectedReport === "attendance/monthly"
                                  ? [
                                      "employee_id",
                                      "department_id",
                                      "location_id",
                                      "location",
                                      "recorded_days",
                                      "not_recorded_days",
                                      "holiday_days",
                                      "week_off_days",
                                      "other_days",
                                      "late_days",
                                      "missing_punch_days",
                                    ]
                                  : selectedReport === "attendance/in-out-punch"
                                    ? [
                                        "employee_id",
                                        "department_id",
                                        "location_id",
                                        "session_id",
                                        "auto_checkout",
                                      ]
                                    : selectedReport === "attendance/summary"
                                      ? [
                                          "employee_id",
                                          "department_id",
                                          "department",
                                          "location_id",
                                          "location",
                                          "recorded_days",
                                          "not_recorded_days",
                                          "half_days",
                                          "holiday_days",
                                          "week_off_days",
                                          "other_days",
                                          "missing_punch_days",
                                        ]
                                      : selectedReport ===
                                            "asset/employee-wise" ||
                                          selectedReport === "asset/allocation"
                                        ? [
                                            "asset_location_id",
                                            "employee_id",
                                            "department_id",
                                            "department",
                                            "location_id",
                                            "location",
                                            "assignment_id",
                                            "assignment_date",
                                            "return_date",
                                            "assigned_by",
                                            "returned_to",
                                            "last_working",
                                          ]
                                        : []),
        ]
      : [];

  return (
    <Box
      // bg="#ed480d"
      minH="calc(100vh - 100px)"
      px={{ base: 2, md: 4, lg: 0 }}
      // pt={{ base: 3, md: 4 }}
      fontFamily="Poppins, sans-serif"
      width="100%"
    >
      <Flex
        // gap={{ base: 3, xl: 5 }}
        // align="flex-start"
        // direction={{ base: "column", lg: "row" }}
        gap={{ base: 3, xl: 3 }}
        align="flex-start"
        direction={{ base: "column", lg: "row" }}
        w="100%"
        minW={0}
        overflow="hidden"
      >
        {/* ================= STICKY REPORT SIDEBAR ================= */}
        <Box
          w={{ base: "100%", lg: "235px" }}
          flex="0 0 235px"
          position={{ base: "static", xl: "sticky" }}
          top={{ xl: "16px" }}
          // maxH={{ xl: "calc(100vh - 32px)" }}
          overflowY={{ xl: "auto" }}
          sx={{
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": {
              display: "none",
            },
          }}
        >
          <ReportSidebar
            groups={availableGroup ? [availableGroup] : []}
            selectedReport={selectedReport}
            onSelect={handleReportSelect}
          />
        </Box>

        {/* ================= MAIN REPORT AREA ================= */}
        <Box
          // flex="1"
          // minW={0}
          // w="100%"
          // flex="1 1 calc(100% - 235px)"
          border="1px solid #cccccc"
          flex="1 1 0%"
          minW={0}
          w="100%"
          maxW="100%"
          bg="#FFFFFF"
          h="76vh"
          borderRadius="12px"
          overflowY="auto"
          overflowX="hidden"
          sx={{
            "&::-webkit-scrollbar": {
              display: "none",
            },
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {!selectedConfig ? (
            <Box
              bg="#FFFFFF"
              // border="1px solid #E4E7EC"
              // borderRadius="18px"
              minH="520px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              // boxShadow="0 4px 18px rgba(15, 23, 42, 0.04)"
            >
              <Box textAlign="center" px={6}>
                <Box
                  mx="auto"
                  mb={4}
                  w="48px"
                  h="48px"
                  borderRadius="14px"
                  bg="#EEF3F9"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text fontSize="20px" fontWeight="700" color="#274167">
                    R
                  </Text>
                </Box>

                <Text
                  fontSize={{ base: "18px", md: "20px" }}
                  fontWeight="700"
                  color="#172033"
                >
                  Select a report
                </Text>

                <Text
                  mt={2}
                  maxW="420px"
                  fontSize="13px"
                  lineHeight="1.7"
                  color="#7A7F87"
                >
                  Choose a report from the Report Library to view its filters
                  and generate the report.
                </Text>
              </Box>
            </Box>
          ) : (
            <>
              {/* ================= REPORT HEADER ================= */}
              <Box
                bg="#FFFFFF"
                // border="1px solid #E4E7EC"
                // borderRadius="18px"
                px={{ base: 3.5, md: 3.5 }}
                py={{ base: 3.5, md: 3.5 }}
                // mb={4}
                // boxShadow="0 4px 18px rgba(15, 23, 42, 0.04)"
                position="relative"
                _after={{
                  content: '""',
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: "2px",
                  backgroundImage:
                    "repeating-linear-gradient(to right, #C7C7C7 0 6px, transparent 6px 14px)",
                }}
              >
                <Flex
                  justify="space-between"
                  align={{ base: "flex-start", md: "flex-start" }}
                  gap={4}
                  wrap="wrap"
                >
                  <Box>
                    <Flex align="start" gap={2.5} mb={1.5}>
                      <Box w="8px" h="30px" borderRadius="full" bg="#274167" />

                      <Text
                        fontSize={{ base: "20px", md: "22px" }}
                        fontWeight="700"
                        color="#000000"
                        lineHeight="1.2"
                      >
                        {selectedConfig.label}
                      </Text>
                    </Flex>

                    <Text
                      fontSize="13px"
                      color="#7A7F87"
                      ml="18px"
                      maxW="700px"
                    >
                      {selectedConfig.description}
                    </Text>

                    <Flex mt={3} ml="18px" gap={2} wrap="wrap">
                      <Box
                        px={3}
                        py={1.5}
                        borderRadius="full"
                        bg="#F1F5F9"
                        color="#274167"
                        fontSize="11px"
                        fontWeight="600"
                      >
                        {availableGroup?.label || "Reports"}
                      </Box>

                      {availability && (
                        <Box
                          px={3}
                          py={1.5}
                          borderRadius="full"
                          bg="#EEF8F1"
                          color="#28734D"
                          fontSize="11px"
                          fontWeight="600"
                        >
                          {/* {availability} */}
                          {data.length > 0 ? availability : "No Record"}
                        </Box>
                      )}
                    </Flex>
                  </Box>

                  <Button
                    variant="outline"
                    borderColor="#D0D5DD"
                    bg="#FFFFFF"
                    color="#274167"
                    borderRadius="10px"
                    h="42px"
                    px={5}
                    fontFamily="Poppins, sans-serif"
                    fontSize="13px"
                    fontWeight="500"
                    isDisabled={!data.length}
                    leftIcon={<Upload size={16} />}
                    onClick={() => setIsExportModalOpen(true)}
                    _hover={{
                      bg: "#F7F9FC",
                      borderColor: "#274167",
                    }}
                  >
                    Export Report
                  </Button>
                </Flex>
              </Box>

              {/* ================= FILTER SECTION ================= */}
              <Box>
                {/* <ReportFilters
                  filters={filters}
                  onChange={setFilters}
                  onReset={resetFilters}
                  onGenerate={() =>
                    generateReport({
                      page: 1,
                      limit: pagination.limit,
                    })
                  }
                  generating={loading}
                  departments={departments}
                  employees={employees}
                  loadingDepartments={loadingDepartments}
                  loadingEmployees={loadingEmployees}
                /> */}
                <ReportFilters
                  filters={filters}
                  onChange={setFilters}
                  onReset={resetFilters}
                  onGenerate={() =>
                    generateReport({
                      page: 1,
                      limit: pagination.limit,
                    })
                  }
                  generating={loading}
                  departments={departments}
                  employees={employees}
                  loadingDepartments={loadingDepartments}
                  loadingEmployees={loadingEmployees}
                  showDateRange={selectedConfig?.supportsDateRange} // ADD HERE
                />
              </Box>

              {/* ================= WARNINGS ================= */}
              {/* {warnings.length > 0 && (
                <Box
                  mb={4}
                  px={4}
                  py={3}
                  bg="#FFF9EB"
                  border="1px solid #F0DFA7"
                  borderRadius="12px"
                >
                  {warnings.map((warning, index) => (
                    <Text
                      key={index}
                      fontSize="12px"
                      color="#7B5E18"
                      lineHeight="1.6"
                    >
                      {warning}
                    </Text>
                  ))}
                </Box>
              )} */}

              {/* ================= RESULTS ================= */}
              <Box>
                {(data.length > 0 || loading) && (
                  <>
                    <ReportTable
                      columns={columns}
                      data={data}
                      loading={loading}
                      hiddenColumns={hiddenColumns}
                      onExportDataChange={setExportTableData}
                      // hiddenColumns={
                      //   selectedReport.startsWith("employee/") ||
                      //   selectedReport.startsWith("leave/") ||
                      //   selectedReport.startsWith("attendance/") ||
                      //   selectedReport.startsWith("asset/")
                      //     ? [
                      //         "employee_id",
                      //         "department_id",
                      //         "location_id",
                      //         ...(selectedReport === "employee/master"
                      //           ? [
                      //               "employee_id",
                      //               "mobile",
                      //               "location",
                      //               "joining_date_source",
                      //               "manager_id",
                      //             ]
                      //           : selectedReport === "employee/directory"
                      //             ? [
                      //                 "employee_id",
                      //                 "location",
                      //                 "joining_date_source",
                      //                 "manager_id",
                      //               ]
                      //             : selectedReport ===
                      //                 "employee/document-status"
                      //               ? ["location"]
                      //               : selectedReport === "employee/new-joiners"
                      //                 ? [
                      //                     "employee_id",
                      //                     "department_id",
                      //                     "location_id",
                      //                     "location",
                      //                     "employee_code",
                      //                     "email",
                      //                     "mobile",
                      //                     "joining_date_source",
                      //                     "manager_id",
                      //                   ]
                      //                 : selectedReport === "employee/exits"
                      //                   ? [
                      //                       "employee_id",
                      //                       "department_id",
                      //                       "location_id",
                      //                       "location",
                      //                       "notice_period_start",
                      //                       "reason_of_exit",
                      //                     ]
                      //                   : selectedReport === "leave/balance"
                      //                     ? [
                      //                         "employee_id",
                      //                         "department_id",
                      //                         "department",
                      //                         "location_id",
                      //                         "location",
                      //                         "employee_code",
                      //                         "leave_type_id",
                      //                         "opening_days",
                      //                         "allocated_days",
                      //                         "carry_forward_days",
                      //                         "adjusted_days",
                      //                         "expired_days",
                      //                         "utilization_percent",
                      //                       ]
                      //                     : selectedReport ===
                      //                         "leave/transaction"
                      //                       ? [
                      //                           "employee_id",
                      //                           "department_id",
                      //                           "location_id",
                      //                           "application_id",
                      //                           "leave_type_id",
                      //                           "leave_name",
                      //                           "status",
                      //                           "reason",
                      //                           "requested_at",
                      //                           "approved_by",
                      //                           "approved_at",
                      //                           "rejection_reason",
                      //                           "event_type",
                      //                           "event_date",
                      //                           "adjustment_days",
                      //                         ]
                      //                       : selectedReport === "leave/history"
                      //                         ? [
                      //                             "employee_id",
                      //                             "department_id",
                      //                             "location_id",
                      //                             "application_id",
                      //                             "leave_type_id",
                      //                             "status",
                      //                             "reason",
                      //                             "requested_at",
                      //                             "approved_by",
                      //                             "approved_at",
                      //                             "rejection_reason",
                      //                           ]
                      //                         : selectedReport ===
                      //                             "leave/pending-approval"
                      //                           ? [
                      //                               "employee_id",
                      //                               "department_id",
                      //                               "location_id",
                      //                               "application_id",
                      //                               "leave_type_id",
                      //                               "status",
                      //                               "reason",
                      //                               "requested_at",
                      //                               "approved_by",
                      //                               "approved_at",
                      //                               "rejection_reason",
                      //                             ]
                      //                           : selectedReport ===
                      //                               "leave/calendar"
                      //                             ? [
                      //                                 "employee_id",
                      //                                 "department_id",
                      //                                 "location_id",
                      //                                 "application_id",
                      //                                 "leave_type_id",
                      //                                 "status",
                      //                                 "reason",
                      //                                 "requested_at",
                      //                                 "approved_by",
                      //                                 "approved_at",
                      //                                 "rejection_reason",
                      //                                 "date",
                      //                               ]
                      //                             : selectedReport ===
                      //                                 "leave/utilization"
                      //                               ? [
                      //                                   "employee_id",
                      //                                   "department_id",
                      //                                   "department",
                      //                                   "location_id",
                      //                                   "location",
                      //                                   "leave_type_id",
                      //                                   "opening_days",
                      //                                   "allocated_days",
                      //                                   "carry_forward_days",
                      //                                   "adjusted_days",
                      //                                   "expired_days",
                      //                                 ]
                      //                               : selectedReport ===
                      //                                   "attendance/daily"
                      //                                 ? [
                      //                                     "employee_id",
                      //                                     "department_id",
                      //                                     "location_id",
                      //                                     "check_in_time",
                      //                                     "check_out_time",
                      //                                     "total_work_minutes",
                      //                                     "required_minutes",
                      //                                     "late_minutes",
                      //                                     "early_leaving_minutes",
                      //                                     "overtime_minutes",
                      //                                     "missing_punch",
                      //                                     "is_checked_in",
                      //                                   ]
                      //                                 : selectedReport ===
                      //                                     "attendance/monthly"
                      //                                   ? [
                      //                                       "employee_id",
                      //                                       "department_id",
                      //                                       "location_id",
                      //                                       "location",
                      //                                       "recorded_days",
                      //                                       "not_recorded_days",
                      //                                       "holiday_days",
                      //                                       "week_off_days",
                      //                                       "other_days",
                      //                                       "late_days",
                      //                                       "missing_punch_days",
                      //                                     ]
                      //                                   : selectedReport ===
                      //                                       "attendance/register"
                      //                                     ? [
                      //                                         "employee_id",
                      //                                         "department_id",
                      //                                         "location_id",
                      //                                         "check_in_time",
                      //                                         "check_out_time",
                      //                                         "total_work_minutes",
                      //                                         "required_minutes",
                      //                                         "late_minutes",
                      //                                         "early_leaving_minutes",
                      //                                         "overtime_minutes",
                      //                                         "missing_punch",
                      //                                         "is_checked_in",
                      //                                       ]
                      //                                     : selectedReport ===
                      //                                         "attendance/in-out-punch"
                      //                                       ? [
                      //                                           "employee_id",
                      //                                           "department_id",
                      //                                           "location_id",
                      //                                           "session_id",
                      //                                           "auto_checkout",
                      //                                         ]
                      //                                       : selectedReport ===
                      //                                           "attendance/summary"
                      //                                         ? [
                      //                                             "employee_id",
                      //                                             "department_id",
                      //                                             "department",
                      //                                             "location_id",
                      //                                             "location",
                      //                                             "recorded_days",
                      //                                             "not_recorded_days",
                      //                                             "half_days",
                      //                                             "holiday_days",
                      //                                             "week_off_days",
                      //                                             "other_days",
                      //                                             "missing_punch_days",
                      //                                           ]
                      //                                         : selectedReport ===
                      //                                             "asset/employee-wise"
                      //                                           ? [
                      //                                               "asset_location_id",
                      //                                               "employee_id",
                      //                                               "department_id",
                      //                                               "department",
                      //                                               "location_id",
                      //                                               "location",
                      //                                               "assignment_id",
                      //                                               "assignment_date",
                      //                                               "return_date",
                      //                                               "assigned_by",
                      //                                               "returned_to",
                      //                                               "last_working",
                      //                                             ]
                      //                                           : selectedReport ===
                      //                                               "asset/allocation"
                      //                                             ? [
                      //                                                 "asset_location_id",
                      //                                                 "employee_id",
                      //                                                 "department_id",
                      //                                                 "department",
                      //                                                 "location_id",
                      //                                                 "location",
                      //                                                 "assignment_id",
                      //                                                 "assignment_date",
                      //                                                 "return_date",
                      //                                                 "assigned_by",
                      //                                                 "returned_to",
                      //                                                 "last_working",
                      //                                               ]
                      //                                             : []),
                      //       ]
                      //     : []
                      // }
                    />

                    {/* <ReportPagination
                    page={pagination.page}
                    limit={pagination.limit}
                    total={pagination.total}
                    totalPages={pagination.total_pages}
                    onPageChange={(nextPage) =>
                      generateReport({
                        page: nextPage,
                        limit: pagination.limit,
                      })
                    }
                    onLimitChange={(nextLimit) =>
                      generateReport({
                        page: 1,
                        limit: nextLimit,
                      })
                    }
                  /> */}
                  </>
                )}
              </Box>
            </>
          )}
        </Box>
      </Flex>

      {/* ================= EXPORT MODAL ================= */}
      <Modal
        isOpen={isExportModalOpen}
        onClose={() => !exportLoading && setIsExportModalOpen(false)}
        isCentered
        size="md"
      >
        <ModalOverlay bg="rgba(23, 32, 51, 0.48)" />

        <ModalContent
          borderRadius="16px"
          fontFamily="Poppins, sans-serif"
          overflow="hidden"
          boxShadow="0 20px 50px rgba(15, 23, 42, 0.18)"
        >
          <ModalHeader
            px={6}
            pt={6}
            pb={1}
            fontSize="18px"
            fontWeight="700"
            color="#172033"
          >
            Export Report
          </ModalHeader>

          <ModalCloseButton
            color="#667085"
            top="18px"
            right="18px"
            isDisabled={exportLoading}
          />

          <ModalBody px={6} pb={6}>
            <Text fontSize="12px" color="#98A2B3" mb={4}>
              {selectedConfig?.label || "Selected Report"}
            </Text>

            <Button
              w="100%"
              h="64px"
              justifyContent="flex-start"
              variant="outline"
              borderColor="#D9DEE7"
              borderRadius="12px"
              px={4}
              bg="#FFFFFF"
              onClick={exportReportAsCsv}
              isLoading={exportLoading}
              loadingText="Exporting CSV..."
              _hover={{
                bg: "#F7F9FC",
                borderColor: "#274167",
              }}
            >
              <Flex align="center" gap={3.5}>
                <Box
                  w="38px"
                  h="38px"
                  borderRadius="10px"
                  bg="#EEF3F9"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon as={FiFileText} boxSize={18} color="#274167" />
                </Box>

                <Box textAlign="left">
                  <Text fontSize="13px" fontWeight="600" color="#344054">
                    CSV spreadsheet
                  </Text>

                  <Text mt={0.5} fontSize="11px" color="#98A2B3">
                    Download this report as a CSV file
                  </Text>
                </Box>
              </Flex>
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
