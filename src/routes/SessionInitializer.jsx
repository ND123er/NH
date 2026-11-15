// import { useEffect } from "react";
// import { useDispatch } from "react-redux";
// import { getSessionThunk, logout } from "../slices/authSlice";
// import { getAuthToken } from "../utils/authToken";

// export default function SessionInitializer({ children }) {
//   const dispatch = useDispatch();

//   useEffect(() => {
//     const token = getAuthToken();

//     if (!token) {
//       dispatch(logout());
//       return;
//     }

//     dispatch(getSessionThunk());
//   }, [dispatch]);

//   return children;
// }


import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import {
  getSessionThunk,
  logout,
} from "../slices/authSlice";

import { getAuthToken } from "../utils/authToken";

export default function SessionInitializer({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Handle confirmed session expiration from Axios.
  useEffect(() => {
    const handleSessionExpired = () => {
      dispatch(logout());

      // sessionStorage.removeItem(
      //   "hrmsnap_organization_setup_draft_v1"
      // );

      navigate("/", { replace: true });
    };

    window.addEventListener(
      "hrmsnap:session-expired",
      handleSessionExpired
    );

    return () => {
      window.removeEventListener(
        "hrmsnap:session-expired",
        handleSessionExpired
      );
    };
  }, [dispatch, navigate]);

  // Restore an existing authentication session on startup.
  useEffect(() => {
    const token = getAuthToken();

    if (!token) {
      dispatch(logout());
      return;
    }

    dispatch(getSessionThunk());
  }, [dispatch]);

  return children;
}