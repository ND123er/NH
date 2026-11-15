import { Routes, Route } from "react-router-dom";

import ExitStatusList from "../../../components/Settings/OrganizationSettings/EmployeeFields/ReasonsForExit/ExitList";
import AddExitStatusForm from "../../../components/Settings/OrganizationSettings/EmployeeFields/ReasonsForExit/AddExitForm";

export default function ExitRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ExitStatusList />} />
      <Route path="add-reason-for-exit" element={<AddExitStatusForm/>} />
    </Routes>
  );
}