import { Routes, Route } from "react-router-dom";
import BrandsList from "../../../components/Settings/OrganizationSettings/AssetFields/Brands/BrandsList";
import AddBrandsForm from "../../../components/Settings/OrganizationSettings/AssetFields/Brands/AddBrandsForm";


export default function BrandsRoutes() {
  return (
    <Routes>
      <Route path="/" element={<BrandsList />} />
      <Route path="add-brands" element={<AddBrandsForm/>} />
    </Routes>
  );
}