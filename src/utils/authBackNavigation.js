const AUTH_FLOW_LEFT_LOGIN = "auth_flow_left_login";

export const markAuthFlowLeftLogin = () => {
  sessionStorage.setItem(AUTH_FLOW_LEFT_LOGIN, "true");
};

export const hasAuthFlowLeftLogin = () => {
  return sessionStorage.getItem(AUTH_FLOW_LEFT_LOGIN) === "true";
};

export const clearAuthFlowNavigation = () => {
  sessionStorage.removeItem(AUTH_FLOW_LEFT_LOGIN);
};