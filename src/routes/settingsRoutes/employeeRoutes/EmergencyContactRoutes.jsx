import { Routes, Route } from "react-router-dom";

import ContactStatusList from "../../../components/Settings/OrganizationSettings/EmployeeFields/EmergencyContact/ContactList";
import AddContactStatusForm from "../../../components/Settings/OrganizationSettings/EmployeeFields/EmergencyContact/AddContactForm";

export default function EmergencyContactRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ContactStatusList />} />
      <Route path="add-emergency-contact" element={<AddContactStatusForm />} />
    </Routes>
  );
}
