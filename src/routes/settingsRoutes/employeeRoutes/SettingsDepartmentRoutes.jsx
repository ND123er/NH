import { Routes, Route } from "react-router-dom";

import DepartmentsList from "../../../components/Settings/OrganizationSettings/EmployeeFields/Departments/DepartmentList";
import AddDepartmentForm from "../../../components/Settings/OrganizationSettings/EmployeeFields/Departments/AddDepartmentForm";

export default function DepartmentRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DepartmentsList />} />
      <Route path="add" element={<AddDepartmentForm />} />
    </Routes>
  );
}