// components/Reports/reportConfig.js

export const reportGroups = [
  {
    key: "employee",
    label: "Employee Reports",
    reports: [
      {
        key: "master",
        label: "Employee Master",
        description: "Complete employee master report",
        supportsDateRange: false,
        filters: {
          department: true,
          employee: true,
          status: true,
        },
      },
      {
        key: "directory",
        label: "Employee Directory",
        description: "Employee directory report",
        supportsDateRange: false,
        filters: {
          department: true,
          employee: true,
          status: true,
        },
      },
      {
        key: "department-wise",
        label: "Department-wise Employee",
        description: "Employees grouped by department",
        supportsDateRange: false,
        filters: {
          department: true,
          employee: true,
          status: true,
        },
      },
      
      {
        key: "new-joiners",
        label: "New Joiners",
        description: "Employees who joined during the selected range",
        supportsDateRange: true,
        filters: {
          department: true,
          employee: true,
          status: true,
        },
      },
      {
        key: "exits",
        label: "Employee Exits",
        description: "Employees who exited during the selected range",
        supportsDateRange: true,
        filters: {
          department: true,
          employee: true,
          status: true,
        },
      },
      {
        key: "document-status",
        label: "Employee Document Status",
        description: "Employee document status report",
        supportsDateRange: false,
        filters: {
          department: true,
          employee: true,
          status: true,
        },
      },
    ],
  },
  {
  key: "leave",
  label: "Leave Reports",
  reports: [
    {
      key: "balance",
      label: "Leave Balance",
      description: "Current leave balance report",
      supportsDateRange: false,
      filters: {
        department: true,
        employee: true,
        status: false,
      },
    },
   
    {
      key: "transaction",
      label: "Leave Transaction",
      description: "Leave transaction report",
      supportsDateRange: true,
      filters: {
        department: true,
        employee: true,
        status: true,
      },
    },
    {
      key: "history",
      label: "Leave History",
      description: "Leave history report",
      supportsDateRange: true,
      filters: {
        department: true,
        employee: true,
        status: true,
      },
    },
    {
      key: "pending-approval",
      label: "Pending Approval",
      description: "Pending leave approval report",
      supportsDateRange: true,
      filters: {
        department: true,
        employee: true,
        status: true,
      },
    },
    {
      key: "calendar",
      label: "Leave Calendar",
      description: "Leave calendar report",
      supportsDateRange: true,
      filters: {
        department: true,
        employee: true,
        status: false,
      },
    },
     {
      key: "utilization",
      label: "Leave Utilization",
      description: "Leave utilization report",
      supportsDateRange: false,
      filters: {
        department: true,
        employee: true,
        status: false,
      },
    },
  ],
},
{
  key: "attendance",
  label: "Attendance Reports",
  reports: [
    {
      key: "daily",
      label: "Daily Attendance",
      description: "Daily employee attendance report",
      supportsDateRange: true,
      filters: {
        department: true,
        employee: true,
        status: true,
        
      },
    },
    {
      key: "monthly",
      label: "Monthly Attendance",
      description: "Monthly employee attendance report",
      supportsDateRange: true,
      filters: {
        department: true,
        employee: true,
        status: true,
      },
    },
    {
      key: "register",
      label: "Attendance Register",
      description: "Employee attendance register report",
      supportsDateRange: true,
      filters: {
        department: true,
        employee: true,
        status: true,
      },
    },
    {
      key: "in-out-punch",
      label: "In-Out Punch",
      description: "Employee in and out punch report",
      supportsDateRange: true,
      filters: {
        department: true,
        employee: true,
        status: true,
      },
    },
    {
      key: "late-coming",
      label: "Late Coming",
      description: "Employees with late attendance",
      supportsDateRange: true,
      filters: {
        department: true,
        employee: true,
        status: true,
      },
    },
    {
      key: "early-leaving",
      label: "Early Leaving",
      description: "Employees leaving before scheduled time",
      supportsDateRange: true,
      filters: {
        department: true,
        employee: true,
        status: true,
      },
    },
    {
      key: "missing-punch",
      label: "Missing Punch",
      description: "Employees with missing attendance punches",
      supportsDateRange: true,
      filters: {
        department: true,
        employee: true,
        status: true,
      },
    },
    {
      key: "regularization",
      label: "Regularization",
      description: "Attendance regularization report",
      supportsDateRange: true,
      filters: {
        department: true,
        employee: true,
        status: true,
      },
    },
    {
      key: "overtime",
      label: "Overtime",
      description: "Employee overtime attendance report",
      supportsDateRange: true,
      filters: {
        department: true,
        employee: true,
        status: true,
      },
    },
    {
      key: "summary",
      label: "Attendance Summary",
      description: "Attendance summary report",
      supportsDateRange: true,
      filters: {
        department: true,
        employee: true,
        status: true,
      },
    },
    
  ],
},
{
  key: "asset",
  label: "Asset Reports",
  reports: [
    {
      key: "register",
      label: "Asset Register",
      description: "Current asset register report",
      supportsDateRange: false,
      filters: {
        department: true,
        employee: true,
        status: true,
      },
    },
    {
      key: "employee-wise",
      label: "Employee-wise Assets",
      description: "Assets assigned employee-wise",
      supportsDateRange: false,
      filters: {
        department: true,
        employee: true,
        status: true,
      },
    },
    {
      key: "allocation",
      label: "Asset Allocation",
      description: "Current asset allocation report",
      supportsDateRange: false,
      filters: {
        department: true,
        employee: true,
        status: true,
      },
    },
    {
      key: "status",
      label: "Asset Status",
      description: "Asset status report",
      supportsDateRange: false,
      filters: {
        department: true,
        employee: true,
        status: true,
      },
    },
    {
      key: "return",
      label: "Asset Returns",
      description: "Assets returned during the selected date range",
      supportsDateRange: true,
      filters: {
        department: true,
        employee: true,
        status: true,
      },
    },
    {
      key: "unallocated",
      label: "Unallocated Assets",
      description: "Assets that are currently unallocated",
      supportsDateRange: false,
      filters: {
        department: true,
        employee: true,
        status: true,
      },
    },
    
    {
      key: "employee-exit",
      label: "Employee Exit Assets",
      description: "Assets associated with employee exits",
      supportsDateRange: true,
      filters: {
        department: true,
        employee: true,
        status: true,
      },
    },
  ],
},
];