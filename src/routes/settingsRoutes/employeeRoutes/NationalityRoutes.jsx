import { Routes, Route } from "react-router-dom";

import NationalityStatusList from "../../../components/Settings/OrganizationSettings/EmployeeFields/Nationality/NationalityList";
import AddNationalityStatusForm from "../../../components/Settings/OrganizationSettings/EmployeeFields/Nationality/AddNationalityForm";

export default function NationalityRoutes() {
  return (
    <Routes>
      <Route path="/" element={<NationalityStatusList />} />
      <Route path="add-nationality" element={<AddNationalityStatusForm/>} />
    </Routes>
  );
}