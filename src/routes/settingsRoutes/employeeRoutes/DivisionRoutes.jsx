import { Routes, Route } from "react-router-dom";

import DivisionList from "../../../components/Settings/OrganizationSettings/EmployeeFields/Divisions/DivisionList";
import AddDivisionsForm from "../../../components/Settings/OrganizationSettings/EmployeeFields/Divisions/AddDivisionForm";

export default function DivisionRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DivisionList />} />
      <Route path="add-division" element={<AddDivisionsForm />} />
    </Routes>
  );
}
