import React, { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import Cookies from "js-cookie";
import { useDispatch, useSelector } from "react-redux";
import { Center, Spinner } from "@chakra-ui/react";
import { logout } from "../slices/authSlice";

const STEP_ROUTES = {
  organization_setup: "/orgRegister",
  password_setup: "/password",
  password_reset: "/password",
  enrollment: "/enrollment",
  mfa: "/mfa",
  recovery_codes: "/recovery-codes",
  recovery_link: "/",
};

const ProtectedRoute = () => {
  const dispatch = useDispatch();

  const { nextStep, sessionLoading, authReady } = useSelector(
    (state) => state.auth
  );

  const token = Cookies.get("auth_token");

  useEffect(() => {
    if (!token && authReady && !sessionLoading) {
      dispatch(logout());
    }
  }, [token, authReady, sessionLoading, dispatch]);

  if (!authReady || sessionLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (nextStep !== "full") {
    return (
      <Navigate
        to={STEP_ROUTES[nextStep] || "/"}
        replace
      />
    );
  }

  return <Outlet />;
};
export default ProtectedRoute;

