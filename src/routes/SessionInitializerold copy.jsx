// import { useEffect } from "react";
// import { useDispatch } from "react-redux";
// import Cookies from "js-cookie";
// import { getSessionThunk } from "../slices/authSlice";

// export default function SessionInitializer({ children }) {
//   const dispatch = useDispatch();
//   useEffect(() => {
//     if (Cookies.get("auth_token")) dispatch(getSessionThunk());
//   }, [dispatch]);
//   return children;
// }


import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Cookies from "js-cookie";

import {
  getSessionThunk,
  logout,
} from "../slices/authSlice";

export default function SessionInitializer({ children }) {
  const dispatch = useDispatch();

  const { token, nextStep } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    const savedToken = Cookies.get("auth_token");

    // No saved token: clear stale authentication state.
    if (!savedToken) {
      dispatch(logout());
      return;
    }

    // MFA or another incomplete authentication step:
    // do not request a full HRMS session.
    if (nextStep && nextStep !== "full") {
      return;
    }

    // Restore an existing full session after refresh.
    // Do not validate every time the user changes pages.
    if (nextStep === "full") {
      dispatch(getSessionThunk());
    }
  }, [dispatch]); // Intentionally run on mount only.

  return children;
}