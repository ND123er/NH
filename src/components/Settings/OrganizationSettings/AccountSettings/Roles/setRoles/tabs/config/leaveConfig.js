export const leaveCards = [
  {
    title: "Leave Type",
    fields: [
      {
        name: "asset.addLeaveType",
        label: "Add Leave Type",
        defaultValue: false,
      },
      {
        name: "asset.editLeaveType",
        label: "Edit Leave Type",
        defaultValue: false,
      },
      {
        name: "asset.viewLeaveType",
        label: "View Leave Type",
        defaultValue: false,
      },
      {
        name: "asset.searchLeaveType",
        label: "Search Leave Type",
        defaultValue: false,
      },
      {
        name: "asset.deleteLeaveType",
        label: "Delete Leave Type",
        defaultValue: false,
      },
    ],
  },
  {
    title: "Calender Settings",
    fields: [
      { name: "asset.addCalender", label: "Add Calender", defaultValue: false },
      {
        name: "asset.editCalender",
        label: "Edit Calender",
        defaultValue: false,
      },
      {
        name: "asset.viewCalender",
        label: "View Calender",
        defaultValue: false,
      },
      {
        name: "asset.searchCalender",
        label: "Search Calender",
        defaultValue: false,
      },
      {
        name: "asset.deleteCalender",
        label: "Delete Calender",
        defaultValue: false,
      },
    ],
  },
  {
    title: "My team leaves",
    description:
      "Select the same privilege in the ‘add comp-off’ to match ‘my team leaves’ access.",
    fields: [
      {
        name: "leave.myTeamLeaves",
        label: "My team leaves",
        type: "toggle+select",
        privilegeOptions: [
          { label: "Full Access", value: "full" },
          { label: "View Only", value: "view" },
          { label: "Limited", value: "limited" },
        ],
      },
      {
        name: "leave.cancelApproveLeave",
        label: "Cancel approved leave (Past & current)",
        type: "toggle+select",
        privilegeOptions: [
          { label: "Full Access", value: "full" },
          { label: "View Only", value: "view" },
          { label: "Limited", value: "limited" },
        ],
      },
      {
        name: "leave.resetLeaveAccrual",
        label: "Reset leave accrual",
        type: "toggle+select",
        privilegeOptions: [
          { label: "Full Access", value: "full" },
          { label: "View Only", value: "view" },
          { label: "Limited", value: "limited" },
        ],
      },
      {
        name: "leave.overrideRestrictions",
        label: "Override restrictions of leave application settings",
        type: "toggle+select",
        privilegeOptions: [
          { label: "Full Access", value: "full" },
          { label: "View Only", value: "view" },
          { label: "Limited", value: "limited" },
        ],
      },
      {
        name: "leave.overrideLeaveRollover",
        label: "Override leave rollover",
        type: "toggle",
      },
    ],
  },
  {
    title: "Holiday",
    fields: [
      { name: "asset.addHoliday", label: "Add Holiday", defaultValue: false },
      { name: "asset.editHoliday", label: "Edit Holiday", defaultValue: false },
      { name: "asset.viewHoliday", label: "View Holiday", defaultValue: false },
      {
        name: "asset.searchHoliday",
        label: "Search Holiday",
        defaultValue: false,
      },
      {
        name: "asset.deleteHoliday",
        label: "Delete Holiday",
        defaultValue: false,
      },
    ],
  },
  {
    title: "Customize balance",
    fields: [
      {
        name: "leave.searchCustomizeBalance",
        label: "Search customize balance",
        type: "toggle+select",
        privilegeOptions: [
          { label: "Full Access", value: "full" },
          { label: "View Only", value: "view" },
          { label: "Limited", value: "limited" },
        ],
      },
      {
        name: "leave.searchHoliday",
        label: "Search holiday",
        type: "toggle",
      },
    ],
  },
  {
    title: "Reports",
    fields: [
      {
        name: "leave.appliedLeaveSummary",
        label: "Applied leave summary",
        type: "toggle",
      },
      {
        name: "leave.availableLeaveSummary",
        label: "Available leave summary",
        type: "toggle",
      },
      {
        name: "leave.myLeaveSummary",
        label: "My leave summary",
        type: "toggle",
      },
      {
        name: "leave.appliedLeaveRolloverSummary",
        label: "Applied leave rollover summary",
        type: "toggle+select",
        privilegeOptions: [
          { label: "Full Access", value: "full" },
          { label: "View Only", value: "view" },
          { label: "Limited", value: "limited" },
        ],
      },
      {
        name: "leave.appliedCompOffSummary",
        label: "Applied comp-off summary",
        type: "toggle+select",
        privilegeOptions: [
          { label: "Full Access", value: "full" },
          { label: "View Only", value: "view" },
          { label: "Limited", value: "limited" },
        ],
      },
    ],
  },
  {
    title: "Comp-off",
    fields: [
      {
        name: "leave.addCompOff",
        label: "Add comp-off",
        type: "toggle+select",
        privilegeOptions: [
          { label: "Full Access", value: "full" },
          { label: "View Only", value: "view" },
          { label: "Limited", value: "limited" },
        ],
      },
      {
        name: "leave.applyCompOffLeave",
        label: "Apply comp-off leave",
        type: "toggle+select",
        privilegeOptions: [
          { label: "Full Access", value: "full" },
          { label: "View Only", value: "view" },
          { label: "Limited", value: "limited" },
        ],
      },
    ],
  },
];
