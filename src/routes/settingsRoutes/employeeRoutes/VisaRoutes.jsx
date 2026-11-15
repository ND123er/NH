import { Routes, Route } from "react-router-dom";

import VisaStatusList from "../../../components/Settings/OrganizationSettings/EmployeeFields/Visas/VisaList";
import AddVisaStatusForm from "../../../components/Settings/OrganizationSettings/EmployeeFields/Visas/AddVisaForm";

export default function VisaRoutes() {
  return (
    <Routes>
      <Route path="/" element={<VisaStatusList />} />
      <Route path="add-visa" element={<AddVisaStatusForm/>} />
    </Routes>
  );
}