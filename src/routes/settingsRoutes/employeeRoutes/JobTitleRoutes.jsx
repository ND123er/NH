import { Routes, Route } from "react-router-dom";

import JobTitleStatusList from "../../../components/Settings/OrganizationSettings/EmployeeFields/JobTitles/JobTitleList";
import AddJobTitleStatusForm from "../../../components/Settings/OrganizationSettings/EmployeeFields/JobTitles/AddJobTitleForm";

export default function JobTitleRoutes() {
  return (
    <Routes>
      <Route path="/" element={<JobTitleStatusList />} />
      <Route path="add-designation" element={<AddJobTitleStatusForm />} />
    </Routes>
  );
}
