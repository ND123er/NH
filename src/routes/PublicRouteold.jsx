
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Center, Spinner } from "@chakra-ui/react";
import Cookies from "js-cookie";
import { useSelector } from "react-redux";

const PublicRoute = () => {
  const location = useLocation();

  const {
    token: reduxToken,
    nextStep,
    sessionLoading,
  } = useSelector((state) => state.auth);

  const cookieToken = Cookies.get("auth_token");
  const token = cookieToken || reduxToken;

  // Password reset links must remain accessible even when an old session exists.
  if (location.pathname === "/forgot-password" || location.pathname === "/account/recovery") return <Outlet />;

  // No authenticated session: allow public pages.
  if (!token) {
    return <Outlet />;
  }

  // Wait for the server to restore the session after refresh.
  if (sessionLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  // Follow the API's next_step, not decoded JWT claims.
  const stepRoutes = {
    organization_setup: "/orgRegister",
    password_setup: "/password",
    password_reset: "/password",
    enrollment: "/enrollment",
    mfa: "/mfa",
    recovery_codes: "/recovery-codes",
    full: "/dashboard",
  };

  const destination = stepRoutes[nextStep];

  // If the API hasn't supplied a recognized step, don't
  // incorrectly send the user to the dashboard.
  if (!destination) {
    return <Outlet />;
  }

  // Recovery-code entry is allowed only during the MFA stage.
  if (location.pathname === "/recovery-options" && nextStep === "mfa") return <Outlet />;

  // Allow the current authentication-stage page to render.
  if (location.pathname === destination) {
    return <Outlet />;
  }

  return <Navigate to={destination} replace />;
};

export default PublicRoute;