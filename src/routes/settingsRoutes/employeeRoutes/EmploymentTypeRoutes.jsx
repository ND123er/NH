import { Routes, Route } from "react-router-dom";

import EmploymentTypeList from "../../../components/Settings/OrganizationSettings/EmployeeFields/EmploymentTypes/EmploymentTypeList";
import AddEmploymentTypeForm from "../../../components/Settings/OrganizationSettings/EmployeeFields/EmploymentTypes/EmploymentTypeForm";

export default function EmploymentTypeRoutes() {
  return (
    <Routes>
      <Route path="/" element={<EmploymentTypeList />} />
      <Route path="add-employment-type" element={<AddEmploymentTypeForm/>} />
    </Routes>
  );
}