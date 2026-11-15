import { Routes, Route } from "react-router-dom";

import MaritalStatusList from "../../../components/Settings/OrganizationSettings/EmployeeFields/MaritalStatus/MaritalStatusList";
import AddMaritalStatusForm from "../../../components/Settings/OrganizationSettings/EmployeeFields/MaritalStatus/AddMaritalStatusForm";

export default function MaritalStatusRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MaritalStatusList />} />
      <Route path="add-marital-status" element={<AddMaritalStatusForm />} />
    </Routes>
  );
}