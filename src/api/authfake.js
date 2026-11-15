import api from "./axios";
import Cookies from "js-cookie";
export const registerAdmin = async (data) => {
  try {
    const response = await api.post("/auth/register_admin", data);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const registerOrg = async (data) => {
  try {
    const response = await api.post("/auth/register_org", data);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// export const loginUser = async (data) => {
//   const response = await api.post("/auth/login_user", data);
//   return response.data;
// };
// export const loginUser = async (data) => {
//   // TEMPORARY FRONTEND-ONLY LOGIN
//   const mockToken = "frontend-demo-token";

//   const mockResponse = {
//     token: mockToken,
//     auth_token: mockToken,
//     user: {
//       id: "EMP000056",
//       name: "Demo User",
//       email: data?.email || "demo@example.com",
//     },
//     is_admin: true,
//     is_org_present: true,
//   };

//   localStorage.setItem("token", mockToken);
//   document.cookie = `auth_token=${mockToken}; path=/`;

//   return mockResponse;
// };
export const loginUser = async (data) => {
  // TEMPORARY FRONTEND-ONLY ADMIN LOGIN
  const header = btoa(JSON.stringify({ alg: "none", typ: "JWT" }));

  const payload = btoa(
    JSON.stringify({
      id: "EMP000056",
      name: "Admin User",
      email: data?.email || "admin@example.com",
      is_admin: true,
      is_org_present: true,
    })
  );

  const mockToken = `${header}.${payload}.frontend`;

  localStorage.setItem("token", mockToken);
  Cookies.set("auth_token", mockToken);

  return {
    token: mockToken,
    auth_token: mockToken,
    is_admin: true,
    is_org_present: true,
    user: {
      id: "EMP000056",
      name: "Admin User",
      email: data?.email || "admin@example.com",
    },
  };
};