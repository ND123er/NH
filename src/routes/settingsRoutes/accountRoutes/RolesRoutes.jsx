import { Routes, Route } from "react-router-dom";
import RolesList from "../../../components/Settings/OrganizationSettings/AccountSettings/Roles/RolesList";
import AddRolesForm from "../../../components/Settings/OrganizationSettings/AccountSettings/Roles/AddRolesForm";

export default function RolesRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RolesList />} />
      <Route path="add-roles/*" element={<AddRolesForm/>} />
    </Routes>
  );
}