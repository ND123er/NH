import { Routes, Route } from "react-router-dom";

import DependencyList from "../../../components/Settings/OrganizationSettings/EmployeeFields/DependencyRelationship/DependecyList";
import AddDependencyStatusForm from "../../../components/Settings/OrganizationSettings/EmployeeFields/DependencyRelationship/AddDependencyForm";

export default function DependencyDetailsRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DependencyList />} />
      <Route path="add-dependency-relationship" element={<AddDependencyStatusForm/>} />
    </Routes>
  );
}