import { Routes, Route } from "react-router-dom";
import LeaveTrackerSettings from "../../../components/Leave_Tracker/LeaveTrackerSettings";
import LeaveTypeList from "../../../components/Settings/LeaveSettings/LeaveTypeList";
import AddLeaveForm from "../../../components/Settings/LeaveSettings/AddLeaveForm";
import CalendarSettingsList from "../../../components/Settings/CalendarSettings/CalendarSettingsList";
import CalendarSettingsForm from "../../../components/Settings/CalendarSettings/CalendarSettingsForm";

export default function LeavesRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LeaveTrackerSettings />} />
      <Route path="leave-types" element={<LeaveTypeList />} />
      <Route path="leave-types/add-leaves" element={<AddLeaveForm />} />
      <Route path="calendar-settings" element={<CalendarSettingsList />} />
      <Route path="calendar-settings/add" element={<CalendarSettingsForm />} />
    </Routes>
  );
}