import { Routes, Route } from "react-router-dom";
import CompanyProfilePage from "../../../components/Settings/OrganizationSettings/AccountSettings/CompanyProfile/CompanyProfilePage";
import AddGeneralDetailsForm from "../../../components/Settings/OrganizationSettings/AccountSettings/CompanyProfile/AddGeneralDetailsForm";
import AddSubscriptionDetailsForm from "../../../components/Settings/OrganizationSettings/AccountSettings/CompanyProfile/AddSubscriptionDetailsForm";
import AddAddressDetailsForm from "../../../components/Settings/OrganizationSettings/AccountSettings/CompanyProfile/AddAddressDetailsForm";


export default function CompanyProfileRoutes() {
  return (
    <Routes>
      <Route path="/" element={<CompanyProfilePage />} />
      <Route path="add-general-details" element={<AddGeneralDetailsForm/>} />
      <Route path="add-subscription-details" element={<AddSubscriptionDetailsForm/>}/>
      <Route path="add-address-details" element={<AddAddressDetailsForm/>}/>
    </Routes>
  );
}