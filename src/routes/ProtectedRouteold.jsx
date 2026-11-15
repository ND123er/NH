// import React, { useEffect } from "react";
// import { Navigate, Outlet, useNavigate } from "react-router-dom";
// import Cookies from "js-cookie";
// import { useDispatch, useSelector } from "react-redux";
// import { logout } from "../slices/authSlice";
// // import { useToast } from "@chakra-ui/react";
// import { useToast, Center, Spinner } from "@chakra-ui/react";

// const ProtectedRoute = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const toast = useToast();

//   useEffect(() => {
//     const interval = setInterval(() => {
//       const token = Cookies.get("auth_token");

//       if (!token) {
//         dispatch(logout());
//         toast({
//           title: "Session Expired",
//           description: "Your login session has expired. Please login again.",
//           status: "warning",
//           duration: 3000,
//           isClosable: true,
//           position: "bottom",
//         });
//         // logout() already clears only HRMSnap session keys.
//         Cookies.remove("auth_token");

//         navigate("/", { replace: true });
//       }
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [dispatch]);
//   // Check multiple sources: cookie, localStorage, and redux store
//   const cookieToken = Cookies.get("auth_token");

//   // const reduxToken = useSelector((state) => state.auth?.token);
//   const { token: reduxToken, nextStep, sessionLoading } = useSelector(
//   (state) => state.auth
// );

//   const token = cookieToken;

//   // ❌ not logged in
//   if (sessionLoading) {
//   return (
//     <Center h="100vh">
//       <Spinner size="xl" />
//     </Center>
//   );
// }
//   if (!token) {
//     return <Navigate to="/" replace />;
//   }

//   // ✅ logged in
//   if (nextStep !== "full") {
//   return <Navigate to="/" replace />;
// }

//   return <Outlet />;
// };

// export default ProtectedRoute;



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

  const { nextStep, sessionLoading } = useSelector(
    (state) => state.auth
  );

  const token = Cookies.get("auth_token");

  useEffect(() => {
    if (!token && !sessionLoading) {
      dispatch(logout());
    }
  }, [token, sessionLoading, dispatch]);

  if (sessionLoading) {
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

