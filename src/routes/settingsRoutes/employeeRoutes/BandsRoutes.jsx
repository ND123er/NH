import { Routes, Route } from "react-router-dom";

import BandsList from "../../../components/Settings/OrganizationSettings/EmployeeFields/Bands/BandsList";
import AddBandsForm from "../../../components/Settings/OrganizationSettings/EmployeeFields/Bands/AddBandsForm";

export default function BandRoutes() {
  return (
    <Routes>
      <Route path="/" element={<BandsList />} />
      <Route path="add-band" element={<AddBandsForm/>} />
    </Routes>
  );
}