import axios from "axios";
// import Cookies from "js-cookie";
import { getAuthToken } from "../utils/authToken";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Keep original HRMS Bearer authentication; prefer the current MFA session token.
// Public auth requests explicitly set skipAuth in src/api/auth.js.
api.interceptors.request.use((config) => {
  if (config.skipAuth) {
    config._skipSessionExpiry = true;
    delete config.headers.Authorization;
    delete config.skipAuth;
    return config;
  }
  // const token = Cookies.get("auth_token") || localStorage.getItem("token");
  const token = getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  else delete config.headers.Authorization;
  return config;
}, (error) => Promise.reject(error));


const INVALID_SESSION_CODES = new Set([
  "SESSION_EXPIRED",
  "SESSION_REVOKED",
  "TOKEN_EXPIRED",
  "INVALID_TOKEN",
]);

api.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error?.response?.status;
    const code = error?.response?.data?.code;
    const request = error?.config;

    // if (
    //   status === 401 &&
    //   INVALID_SESSION_CODES.has(code) &&
    //   !request?._skipSessionExpiry
    // )
    const requestAuth = request?.headers?.Authorization;
    const currentToken = getAuthToken();
    const currentAuth = currentToken
      ? `Bearer ${currentToken}`
      : null;
    if (
      status === 401 &&
      INVALID_SESSION_CODES.has(code) &&
      !request?._skipSessionExpiry &&
      currentAuth !== null &&
      requestAuth === currentAuth
    ) {
      window.dispatchEvent(
        new CustomEvent("hrmsnap:session-expired", {
          detail: { code },
        })
      );
    }

    return Promise.reject(error);
  }
);

export default api;
