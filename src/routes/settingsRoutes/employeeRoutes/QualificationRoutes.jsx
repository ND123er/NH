import { Routes, Route } from "react-router-dom";

import QualificationList from "../../../components/Settings/OrganizationSettings/EmployeeFields/Qualification/QualificationList";
import AddQualificationForm from "../../../components/Settings/OrganizationSettings/EmployeeFields/Qualification/AddQualificationForm";

export default function QualificationRoutes() {
  return (
    <Routes>
      <Route path="/" element={<QualificationList />} />
      <Route path="add-qualification" element={<AddQualificationForm/>} />
    </Routes>
  );
}