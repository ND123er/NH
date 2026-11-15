import { Routes, Route } from "react-router-dom";
import CompensationChangeList from "../../../components/Settings/OrganizationSettings/EmployeeFields/CompensationChange/CompensationList";
import AddCompensationChangeForm from "../../../components/Settings/OrganizationSettings/EmployeeFields/CompensationChange/AddCompensationForm";


export default function CompensationRoutes() {
  return (
    <Routes>
      <Route path="/" element={<CompensationChangeList />} />
      <Route path="add-compensation-change" element={<AddCompensationChangeForm/>} />
    </Routes>
  );
}