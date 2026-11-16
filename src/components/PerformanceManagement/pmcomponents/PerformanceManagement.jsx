import { useCallback, useEffect, useState } from "react";
import { Box } from "@chakra-ui/react";
import PmOverview from "./PmOverview";
import EmployeeAppraisalList from "./EmployeeAppraisalList";
import ExpiredAppraisalList from "./ExpiredAppraisalList";
import { getAppraisalEmployee, getExpiredForms, PERFORMANCE_V2_ENABLED } from "../../../api/performancemanagementdashborad";
import {
  appraisalRecords,
  expiredAppraisalRecords,
} from "./data/dummyAppraisalData";

// API rows take priority; these records are only a local demo fallback.

const formatDateValue = (value) => {
  if (!value) return "";
  const stringValue = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(stringValue)) return stringValue;

  const displayDateMatch = stringValue.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (displayDateMatch) {
    const [, day, month, year] = displayDateMatch;
    return `${year}-${month}-${day}`;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDisplayDate = (value) => {
  const isoDate = formatDateValue(value);
  return isoDate ? isoDate.split("-").reverse().join("-") : "-";
};

const normalizeAppraisal = (record) => {
  const formStatus = Number(record.form_status ?? record.status);
  const appraisalStatus = Number(record.status);
  const statusLabels = PERFORMANCE_V2_ENABLED ? {
    1: "Upcoming",
    2: "Pending",
    3: "Draft",
    4: "Submitted",
    5: "Expired",
    6: "Reactivated",
  } : { 1: "Upcoming", 2: "Pending", 3: "Expired", 4: "Pending", 5: "Submitted", 6: "Completed" };
  const progress = record.reviewer_progress || {};
  const progressTotal = Number(progress.total) || 0;
  const progressSubmitted = Number(progress.submitted) || 0;

  return {
    ...record,
    id: record._id || `${record.employee_id || "employee"}-${record.appraisal_date || "cycle"}`,
    appraisalId: record._id,
    employeeCode: record.employee_code || record.employee_id || "-",
    employeeId: record.employee_code || record.employee_id || "-",
    fullName: record.name || "-",
    doj: formatDisplayDate(record.joining_date),
    doc: formatDisplayDate(record.confirmation_date),
    docDateISO: formatDateValue(record.confirmation_date),
    appraisalDate: formatDisplayDate(record.appraisal_date),
    appraisalDateISO: formatDateValue(record.appraisal_date),
    department: record.department || "-",
    selfAssessment: record.self_submitted
      ? "Submitted"
      : statusLabels[formStatus] || "Pending",
    feedback:
      progressTotal > 0
        ? `${progressSubmitted} / ${progressTotal}`
        : formStatus < 5
          ? "Locked"
          : "0 / 0",
    formStatus: statusLabels[formStatus] || "Unknown",
    isExpired: formStatus === 5 || (!PERFORMANCE_V2_ENABLED && appraisalStatus === 3),
  };
};

const normalizeDummyAppraisal = (record, index) => {
  const formStatus = record.formStatus || record.selfAssessment || "Unknown";

  return {
    ...record,
    id: record.id ?? `dummy-appraisal-${index + 1}`,
    appraisalId: record._id || record.appraisalId || null,
    employeeCode: record.employeeCode || record.employeeId || "-",
    employeeId: record.employeeId || record.employeeCode || "-",
    fullName: record.fullName || "-",
    doj: record.doj || formatDisplayDate(record.joining_date),
    doc: record.doc || formatDisplayDate(record.docDate || record.confirmation_date),
    docDateISO: formatDateValue(record.docDateISO || record.docDate || record.doc),
    appraisalDate: record.appraisalDate
      ? formatDisplayDate(record.appraisalDate)
      : formatDisplayDate(record.appraisal_date),
    appraisalDateISO: formatDateValue(record.appraisalDateISO || record.appraisalDate || record.appraisal_date),
    department: record.department || "-",
    selfAssessment: record.selfAssessment || formStatus,
    feedback: record.feedback || "0 / 0",
    formStatus,
    isExpired: record.isExpired ?? formStatus === "Expired",
    isDummy: true,
  };
};

const getDashboardCounts = (rows, expiredRows) => ({
  upcoming: rows.filter((row) => row.selfAssessment === "Upcoming").length,
  self_submitted: rows.filter((row) => row.selfAssessment === "Submitted").length,
  overdue: expiredRows.length,
});

const getDummyDashboard = () => {
  const rows = Array.isArray(appraisalRecords)
    ? appraisalRecords.map(normalizeDummyAppraisal)
    : [];
  const expiredRows = Array.isArray(expiredAppraisalRecords)
    ? expiredAppraisalRecords.map(normalizeDummyAppraisal)
    : [];

  if (!rows.length && !expiredRows.length) return null;

  return {
    counts: getDashboardCounts(rows, expiredRows),
    rows,
    expiredRows,
  };
};

const PerformanceManagement = () => {
  const [showExpiredList, setShowExpiredList] = useState(false);
  const [dashboard, setDashboard] = useState({
    counts: { upcoming: 0, self_submitted: 0, overdue: 0 },
    rows: [],
    expiredRows: [],
  });
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

  const loadDashboard = useCallback(async () => {
    const dummyDashboard = import.meta.env.DEV && import.meta.env.VITE_PERFORMANCE_DEMO !== "false" ? getDummyDashboard() : null;
    setDashboardLoading(true);
    setDashboardError("");

    try {
      const response = await getAppraisalEmployee({ page: 1, limit: 100 });
      const apiRows = Array.isArray(response?.result)
        ? response.result.map(normalizeAppraisal)
        : [];

      if (apiRows.length) {
        let apiExpiredRows = apiRows.filter((row) => row.isExpired);
        if (PERFORMANCE_V2_ENABLED) {
          try {
            const expiredResponse = await getExpiredForms({ page: 1, limit: 100 });
            apiExpiredRows = (expiredResponse?.result || []).map((form) => ({
              ...form,
              id: form.form_id,
              _id: form.form_id,
              appraisalId: form.appraisal_id,
              formId: form.form_id,
              formType: Number(form.form_type),
              employeeCode: form.employee?.employee_code || form.employee_id || '-',
              fullName: form.employee?.name || '-',
              department: form.employee?.department || '-',
              formStatus: 'Expired',
              deadline_at: form.deadline_at,
              can_reactivate: form.can_reactivate === true,
              isExpired: true,
              isDummy: false,
            }));
          } catch (error) { console.warn('Expired forms unavailable; showing legacy dashboard rows', error); }
        }
        const fallbackCounts = getDashboardCounts(apiRows, apiExpiredRows);
        const apiCounts = response?.counts || {};

        setDashboard({
          counts: {
            upcoming: apiCounts.upcoming ?? fallbackCounts.upcoming,
            self_submitted: apiCounts.self_submitted ?? fallbackCounts.self_submitted,
            overdue: apiCounts.overdue ?? fallbackCounts.overdue,
          },
          rows: dummyDashboard ? [...apiRows, ...dummyDashboard.rows] : apiRows,
          expiredRows: dummyDashboard ? [...apiExpiredRows, ...dummyDashboard.expiredRows] : apiExpiredRows,
        });
      } else if (dummyDashboard) {
        setDashboard(dummyDashboard);
      } else {
        setDashboard({
          counts: { upcoming: 0, self_submitted: 0, overdue: 0 },
          rows: [],
          expiredRows: [],
        });
        setDashboardError("No appraisal data is available.");
      }
    } catch (error) {
      if (dummyDashboard) {
        setDashboard(dummyDashboard);
      } else {
        setDashboardError(
          error?.response?.data?.msg ||
            error?.response?.data?.message ||
            error?.message ||
            "Failed to load appraisals.",
        );
        setDashboard({
          counts: { upcoming: 0, self_submitted: 0, overdue: 0 },
          rows: [],
          expiredRows: [],
        });
      }
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const expiredRows = dashboard.expiredRows;

  if (showExpiredList) {
    return (
      <ExpiredAppraisalList
        rows={expiredRows}
        loading={dashboardLoading}
        error={dashboardError}
        onBack={() => setShowExpiredList(false)}
        onRefresh={loadDashboard}
      />
    );
  }

  return (
    <Box display="flex" flexDirection="column" mt="3.5" gap={2}>
      <PmOverview
        counts={dashboard.counts}
        onViewList={() => setShowExpiredList(true)}
      />
      <EmployeeAppraisalList
        appraisals={dashboard.rows}
        loading={dashboardLoading}
        error={dashboardError}
      />
    </Box>
  );
};
export default PerformanceManagement;
