export const attendanceCards = [
  {
    title: "My team attendance",
    description:
      "Select the same privilege in the 'manual entry report' to match 'my team attendance' access.",
    fields: [
      {
        name: "attendance.searchMyTeamAttendance",
        label: "Search my team attendance",
        type: "toggle+select",
        privilegeOptions: [
          { label: "Own data", value: "ownData" },
          { label: "Own and direct reportees data", value: "directData" },
          { label: "Own, direct and indirect reportees data", value: "inDirectData" },
          { label: "Everyone's data", value: "everyoneData" }
        ],
      },
      {
        name: "attendance.manualEntryRequest",
        label: "Manual entry request",
        type: "toggle+select",
        privilegeOptions: [
          { label: "Own data", value: "ownData" },
          { label: "Own and direct reportees data", value: "directData" },
          { label: "Own, direct and indirect reportees data", value: "inDirectData" },
          { label: "Everyone's data", value: "everyoneData" }
        ],
      },
    ],
  },
  {
    title: "Check-in/Check-out settings",
    fields: [
      {
        name: "attendance.editCheckInOutSettings1",
        label: "Edit check-in/check-out settings",
        type: "toggle",
      },
      {
        name: "attendance.editCheckInOutSettings2",
        label: "Edit check-in/check-out settings",
        type: "toggle",
      },
    ],
  },
  {
    title: "Employee override check-in/check-out settings",
    fields: [
      {
        name: "attendance.editOverrideCheckInOut",
        label: "Edit employee override check-in/check-out settings",
        type: "toggle",
      },
      {
        name: "attendance.searchOverrideCheckInOut",
        label: "Search employee override check-in/check-out settings",
        type: "toggle",
      },
    ],
  },
  {
    title: "My team attendance",
    description:
      "Select the same privilege in the 'manual entry report' to match 'my team attendance' access.",
    fields: [
      {
        name: "attendance.checkInOutReport",
        label: "Check-in/Check-out report",
        type: "toggle+select",
        privilegeOptions: [
          { label: "Own data", value: "ownData" },
          { label: "Own and direct reportees data", value: "directData" },
          { label: "Own, direct and indirect reportees data", value: "inDirectData" },
          { label: "Everyone's data", value: "everyoneData" }
        ],
      },
      {
        name: "attendance.selectEarlyOrLateReport",
        label: "Select early or late report",
        type: "toggle+select",
        privilegeOptions: [
          { label: "Own data", value: "ownData" },
          { label: "Own and direct reportees data", value: "directData" },
          { label: "Own, direct and indirect reportees data", value: "inDirectData" },
          { label: "Everyone's data", value: "everyoneData" }
        ],
      },
      {
        name: "attendance.employeeAttendance",
        label: "Employee attendance",
        type: "toggle+select",
        privilegeOptions: [
          { label: "Own data", value: "ownData" },
          { label: "Own and direct reportees data", value: "directData" },
          { label: "Own, direct and indirect reportees data", value: "inDirectData" },
          { label: "Everyone's data", value: "everyoneData" }
        ],
      },
      {
        name: "attendance.gracePeriodNonComplianceReport",
        label: "Grace period non-compliance report",
        type: "toggle+select",
        privilegeOptions: [
          { label: "Own data", value: "ownData" },
          { label: "Own and direct reportees data", value: "directData" },
          { label: "Own, direct and indirect reportees data", value: "inDirectData" },
          { label: "Everyone's data", value: "everyoneData" }
        ],
      },
      {
        name: "attendance.manualEntryReport",
        label: "Manual entry report",
        type: "toggle+select",
        privilegeOptions: [
          { label: "Own data", value: "ownData" },
          { label: "Own and direct reportees data", value: "directData" },
          { label: "Own, direct and indirect reportees data", value: "inDirectData" },
          { label: "Everyone's data", value: "everyoneData" }
        ],
      },
    ],
  },
];