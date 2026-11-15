// export a plain array of cards describing sections/fields for 'settings' tab
export const settingsCards = [
  {
    title: "Company Profile",
    fields: [
      { name: "settings.editCompany", label: "Edit company profile", defaultValue: false },
      { name: "settings.viewCompany", label: "View company profile", defaultValue: false },
      { name: "settings.viewSettingsMenu", label: "View settings menu", defaultValue: false },
    ],
  },
  {
    title: "Office location",
    fields: [
      { name: "settings.addOffice", label: "Add office location", defaultValue: false },
      { name: "settings.editOffice", label: "Edit office location", defaultValue: false },
      { name: "settings.deleteOffice", label: "Delete office location", defaultValue: false },
      { name: "settings.viewOffice", label: "View office location", defaultValue: false },
      { name: "settings.searchOffice", label: "Search office location", defaultValue: false },
    ],
  },
  {
    title: "Billing Notification",
    fields: [
      { name: "settings.addBilling", label: "Add billing notification", defaultValue: false },
      { name: "settings.editBilling", label: "Edit billing notification", defaultValue: false },
      { name: "settings.deleteBilling", label: "Delete billing notification", defaultValue: false },
      { name: "settings.viewBilling", label: "View billing notification", defaultValue: false },
      { name: "settings.searchBilling", label: "Search billing notification", defaultValue: false },
    ],
  },
  {
    title: "Role",
    fields: [
      { name: "settings.addRole", label: "Add role", defaultValue: false },
      { name: "settings.editRole", label: "Edit role", defaultValue: false },
      { name: "settings.deleteRole", label: "Delete role", defaultValue: false },
      { name: "settings.viewRole", label: "View role", defaultValue: false },
      { name: "settings.searchRole", label: "Search role", defaultValue: false },
    ],
  },
  {
    title: "Email notifications",
    fields: [
      { name: "settings.editEmail", label: "Edit Email notifications", defaultValue: false },
      { name: "settings.viewEmail", label: "View Email notifications", defaultValue: false },
    ],
  },
];
