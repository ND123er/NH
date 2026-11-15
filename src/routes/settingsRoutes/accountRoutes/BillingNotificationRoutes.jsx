import { Routes, Route } from "react-router-dom";
import BillingNotificationList from "../../../components/Settings/OrganizationSettings/AccountSettings/BillingNotification/BillingNotificationList";
import AddBillingNotificationForm from "../../../components/Settings/OrganizationSettings/AccountSettings/BillingNotification/AddBillingNotificationForm";


export default function BillingNotificationRoutes() {
  return (
    <Routes>
      <Route path="/" element={<BillingNotificationList />} />
      <Route path="add-billing-notification" element={<AddBillingNotificationForm/>} />
    </Routes>
  );
}