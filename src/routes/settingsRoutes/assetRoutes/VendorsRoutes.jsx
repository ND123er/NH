import { Routes, Route } from "react-router-dom";
import VendorsList from "../../../components/Settings/OrganizationSettings/AssetFields/Vendors/VendorsList";
import AddAssetVendorsForm from "../../../components/Settings/OrganizationSettings/AssetFields/Vendors/AddVendorsForm";


export default function VendorsRoutes() {
  return (
    <Routes>
      <Route path="/" element={<VendorsList />} />
      <Route path="add-vendors" element={<AddAssetVendorsForm/>} />
    </Routes>
  );
}