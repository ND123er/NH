import {
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
  useNavigationType,
} from "react-router-dom";
// import { Center, Spinner } from "@chakra-ui/react";
import {
  Center,
  Spinner,
  Box,
  Heading,
  Text,
  Input,
  Button,
  VStack,
} from "@chakra-ui/react";
import Cookies from "js-cookie";
import { useSelector } from "react-redux";
// import { useEffect } from "react";
import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { logout } from "../slices/authSlice";
import {
  markAuthFlowLeftLogin,
  hasAuthFlowLeftLogin,
  clearAuthFlowNavigation,
} from "../utils/authBackNavigation";

const PublicRoute = () => {
  const location = useLocation();
  const navigationType = useNavigationType();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const previousHistoryIndex = useRef(window.history.state?.idx ?? 0);
  const previousPath = useRef(location.pathname);

  const restrictedBackStages = ["/enrollment", "/mfa", "/recovery-codes"];

  const currentHistoryIndex = window.history.state?.idx ?? 0;

  const {
    token: reduxToken,
    nextStep,
    sessionLoading,
    authReady,
  } = useSelector((state) => state.auth);

  const backFromRestrictedStage =
    authReady &&
    !sessionLoading &&
    navigationType === "POP" &&
    currentHistoryIndex < previousHistoryIndex.current &&
    restrictedBackStages.includes(previousPath.current) &&
    location.pathname !== previousPath.current;

  useEffect(() => {
    if (backFromRestrictedStage) {
      clearAuthFlowNavigation();
      dispatch(logout());
      navigate("/", { replace: true });
    }

    previousHistoryIndex.current = currentHistoryIndex;
    previousPath.current = location.pathname;
  }, [
    backFromRestrictedStage,
    currentHistoryIndex,
    location.pathname,
    dispatch,
    navigate,
  ]);

  const isAuthenticationStage = [
    "/password",
    "/mfa",
    "/enrollment",
    "/recovery-codes",
    "/orgRegister",
  ].includes(location.pathname);

  // useEffect(() => {
  //   if (isAuthenticationStage) {
  //     markAuthFlowLeftLogin();
  //   }
  // }, [isAuthenticationStage]);

  useEffect(() => {
    if (authReady && !sessionLoading && reduxToken && isAuthenticationStage) {
      markAuthFlowLeftLogin();
    }
  }, [authReady, sessionLoading, reduxToken, isAuthenticationStage]);

  const returningToLogin =
    navigationType === "POP" &&
    location.pathname === "/" &&
    hasAuthFlowLeftLogin() &&
    [
      "organization_setup",
      "enrollment",
      "recovery_codes",
      "mfa",
      "password_setup",
      "password_reset",
    ].includes(nextStep);

  // useEffect(() => {
  //   if (!authReady || sessionLoading) return;

  //   if (returningToLogin) {
  //     dispatch(logout());
  //   }
  // }, [authReady, sessionLoading, returningToLogin, dispatch]);

  useEffect(() => {
    if (!authReady || sessionLoading) return;

    if (returningToLogin) {
      clearAuthFlowNavigation();
      dispatch(logout());
    }
  }, [authReady, sessionLoading, returningToLogin, dispatch]);

  const cookieToken = Cookies.get("auth_token");
  const token = reduxToken || cookieToken;

  // Password reset links must remain accessible even when an old session exists.
  if (
    location.pathname === "/forgot-password" ||
    location.pathname === "/account/recovery"
  )
    return <Outlet />;

  // Wait for the initial /auth/session response before routing.
  // if (!authReady || sessionLoading)
  // if (!authReady || sessionLoading || returningToLogin)
  if (
    !authReady ||
    sessionLoading ||
    returningToLogin ||
    backFromRestrictedStage
  ) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  // if (!token) {
  //   if (location.pathname === "/orgRegister") {
  //     return <Navigate to="/" replace />;
  //   }

  //   return <Outlet />;
  // }

  if (!token) {
    const protectedAuthStages = [
      "/orgRegister",
      "/password",
      "/enrollment",
      "/mfa",
      "/recovery-codes",
      "/recovery-options",
    ];

    if (protectedAuthStages.includes(location.pathname)) {
      return <Navigate to="/" replace />;
    }

    return <Outlet />;
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
  if (location.pathname === "/recovery-options" && nextStep === "mfa")
    return <Outlet />;

  // Allow the current authentication-stage page to render.
  if (location.pathname === destination) {
    return <Outlet />;
  }

  if (
    location.pathname === "/" &&
    !hasAuthFlowLeftLogin() &&
    [
      "organization_setup",
      "password_setup",
      "password_reset",
      "enrollment",
      "mfa",
      "recovery_codes",
    ].includes(nextStep)
  ) {
    return <Outlet />;
  }

  const completedPath = location.state?.completedAuthPage;
  const completedStage = location.state?.completedAuthStage;

  //   if (
  //   location.pathname === "/register" &&
  //   ["organization_setup", "enrollment", "recovery_codes"].includes(nextStep) &&
  //   (
  //     (completedPath === "/register" &&
  //       completedStage === "registration") ||
  //     (
  //       navigationType === "POP" &&
  //       hasAuthFlowLeftLogin() &&
  //       window.history.state?.usr?.completedAuthPage === "/register" &&
  //       window.history.state?.usr?.completedAuthStage === "registration"
  //     )
  //   )
  // ) {
  //   return <Outlet />;
  // }

  const registerHistoryState = window.history.state?.usr;

  const isCompletedRegistration =
    (completedPath === "/register" && completedStage === "registration") ||
    (registerHistoryState?.completedAuthPage === "/register" &&
      registerHistoryState?.completedAuthStage === "registration");

  if (
    location.pathname === "/register" &&
    ["organization_setup", "enrollment", "recovery_codes"].includes(nextStep) &&
    isCompletedRegistration
  ) {
    return <Outlet />;
  }

  if (
    location.pathname === "/orgRegister" &&
    ["enrollment", "recovery_codes"].includes(nextStep) &&
    Number.isInteger(location.state?.orgStep) &&
    location.state.orgStep >= 1 &&
    location.state.orgStep <= 4
  ) {
    return <Outlet />;
  }

  const completedRoutes = {
    "/": ["login"],
    "/register": ["registration"],
    "/orgRegister": ["organization_setup"],
    "/password": ["password_setup", "password_reset"],
    "/enrollment": ["enrollment"],
    "/mfa": ["mfa"],
    "/recovery-codes": ["recovery_codes"],
  };

  if (
    token &&
    completedPath === location.pathname &&
    completedRoutes[location.pathname]?.includes(completedStage) &&
    destination !== location.pathname &&
    !(
      completedStage === "organization_setup" &&
      nextStep === "organization_setup"
    ) &&
    !(completedStage === "login" && nextStep === "mfa")
  ) {
    if (completedStage === "enrollment") {
      return (
        // <Center minH="100vh" p={6}>
        //   <VStack spacing={5} maxW="500px" w="100%" align="stretch">
        //     <Heading size="lg">Set up your authenticator</Heading>

        //     <Text>
        //       Enrollment completed. The previous QR code and secret are no
        //       longer displayed.
        //     </Text>

        //     <Box p={8} bg="gray.100" textAlign="center">
        //       QR code hidden for security
        //     </Box>

        //     <Input placeholder="6-digit verification code" isDisabled />

        //     <Button onClick={() => window.history.forward()}>Continue</Button>
        //   </VStack>
        // </Center>
        <Outlet />
      );
    }

    // Reuse the original component in read-only mode.
    return (
      <Outlet
        context={{
          authReadOnly: true,
          completedStage,
          destination,
        }}
      />
    );
  }

  return <Navigate to={destination} replace />;
  //   return (
  //   <Navigate
  //     to={destination}
  //     replace={location.pathname !== "/orgRegister"}
  //   />
  // );
};

export default PublicRoute;
