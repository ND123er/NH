// Session identity helpers. The API uses auth_token/auth_user cookies.
import Cookies from "js-cookie";
export const TOKEN_KEY = "token"; // legacy compatibility only
export const ORG_CODE_KEY = "org_code";
export const EMP_CODE_KEY = "employee_emp_code";

export function setToken(token) {
  if (token) Cookies.set("auth_token", token, { secure: typeof window !== "undefined" && window.location.protocol === "https:", sameSite: "lax" });
}
export function getToken() {
  return Cookies.get("auth_token") || null;
}
export function decodeTokenPayload(token) {
  try {
    const value = token || getToken();
    if (!value) return null;
    const part = value.split(".")[1];
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(decodeURIComponent(Array.from(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "=")), c => "%" + c.charCodeAt(0).toString(16).padStart(2, "0")).join("")));
  } catch { return null; }
}
function sessionUser() {
  try { return JSON.parse(Cookies.get("auth_user") || "null"); } catch { return null; }
}
export function getEmpCode() {
  const user = sessionUser();
  const payload = decodeTokenPayload();
  return user?.employee_id || user?.emp_code || payload?.employee_id || payload?.emp_code || null;
}
export function getOrgCode() {
  // Identity is taken only from the current session, never a previous tenant's storage.
  const user = sessionUser();
  const payload = decodeTokenPayload();
  const id = user?.organisation_id || user?.org_id || payload?.organisation_id || payload?.org_id;
  return typeof id === "string" && id.trim() && !["null", "undefined"].includes(id.trim())
    ? id.trim() : null;
}

export function persistSessionIdentity(data) {
  // A stage transition may return a new token without repeating the user object.
  // Preserve the current account identity only when the new token belongs to it.
  const payload = decodeTokenPayload(data?.token);
  const user = data?.user || sessionUser();
  const id = user?.organisation_id || data?.org_id || payload?.organisation_id || payload?.org_id;
  const employeeId = user?.employee_id || data?.employee_id || payload?.employee_id;
  if (id && id !== "null") persistOrgCode(String(id));
  if (employeeId) persistEmpCode(String(employeeId));
}

export function clearSessionIdentity() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ORG_CODE_KEY);
  localStorage.removeItem(EMP_CODE_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

export function persistEmpCode(empCode) {
  try {
    if (typeof window !== 'undefined' && empCode) localStorage.setItem(EMP_CODE_KEY, empCode);
  } catch (e) { }
}

export function persistOrgCode(orgCode) {
  try {
    if (typeof window !== 'undefined' && orgCode) localStorage.setItem(ORG_CODE_KEY, orgCode);
  } catch (e) { }
}

// Get org_id from Redux user object or fallback to localStorage
// This handles the case where Redux user doesn't have org_id after page refresh
export function getOrgIdFromReduxOrStorage(reduxUser) {
  // First check Redux user (updated by setOrgId action)
  if (reduxUser?.organisation_id && reduxUser.organisation_id === getOrgCode()) return reduxUser.organisation_id;
  // Fallback to localStorage (persisted by setOrgId or getOrgCode)
  return getOrgCode();
}

