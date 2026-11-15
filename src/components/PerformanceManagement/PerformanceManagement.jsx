import { useSelector } from "react-redux";
import PerformanceManagementDashboard from "./pmcomponents/PerformanceManagement";
import EmployeePerformanceManagement from "./employee/EmployeePerformanceManagement";

const PerformanceManagement = () => {
  const user = useSelector((state) => state.auth?.user);
  const isAdmin = ["owner", "admin"].includes(String(user?.role || "").toLowerCase()) || user?.is_admin === true;
  return isAdmin ? <PerformanceManagementDashboard /> : <EmployeePerformanceManagement />;
};

export default PerformanceManagement;

