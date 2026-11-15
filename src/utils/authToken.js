export const STAGE_TOKEN_KEY = "auth_stage_token";
export const SESSION_TOKEN_KEY = "auth_session_token";

export const saveAuthToken = (token, nextStep) => {
  if (!token) return;

  if (nextStep === "full") {
    localStorage.setItem(SESSION_TOKEN_KEY, token);
    sessionStorage.removeItem(STAGE_TOKEN_KEY);
  } else {
    sessionStorage.setItem(STAGE_TOKEN_KEY, token);
  }
};

export const getAuthToken = () => {
  return (
    sessionStorage.getItem(STAGE_TOKEN_KEY) ||
    localStorage.getItem(SESSION_TOKEN_KEY)
  );
};

export const clearAuthToken = () => {
  sessionStorage.removeItem(STAGE_TOKEN_KEY);
  localStorage.removeItem(SESSION_TOKEN_KEY);
};