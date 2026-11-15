import { Routes, Route } from "react-router-dom";
import AssetCategoriesList from "../../../components/Settings/OrganizationSettings/AssetFields/AssetCategories/CategoriesList";
import AddAssetCategoriesForm from "../../../components/Settings/OrganizationSettings/AssetFields/AssetCategories/AddCategoriesForm";

export default function CategoriesRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AssetCategoriesList />} />
      <Route path="add-asset-category" element={<AddAssetCategoriesForm/>} />
    </Routes>
  );
}