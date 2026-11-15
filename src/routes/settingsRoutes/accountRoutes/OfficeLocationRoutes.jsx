import { Routes, Route } from "react-router-dom";
import OfficeLocationList from "../../../components/Settings/OrganizationSettings/AccountSettings/OfficeLocations/OfficeLocationList";
import AddOfficeLocationForm from "../../../components/Settings/OrganizationSettings/AccountSettings/OfficeLocations/AddOfficeLocationForm";


export default function OfficeLocationRoutes() {
  return (
    <Routes>
      <Route path="/" element={<OfficeLocationList />} />
      <Route path="add-office-location" element={<AddOfficeLocationForm/>} />
    </Routes>
  );
}