import api from "./axios";

export const registerAdmin = async (data) => {
  try {
    const response = await api.post("/auth/register_admin", data, { skipAuth: true });
    return response.data;
  } catch (error) {
    // console.log(error);
    throw error;
  }
};

// export const registerOrg = async (data) => {
//   try {
//     const response = await api.post("/auth/register_org", data);
//     return response.data;
//   } catch (error) {
//     console.log(error);
//     throw error;
//   }
// };


export const registerOrg = async (data) => {
  try {
    const response = await api.post(
      "/organization/register_org",
      data
    );
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const loginUser = async (data) => {
  // const response = await api.post("/auth/login_user", data);
  const response = await api.post("/auth/login", data, { skipAuth: true });
  return response.data;
};


export const getSession = async () => {
  const response = await api.get("/auth/session");
  return response.data;
};

export const startEnrollment = async () => {
  const response = await api.post("/auth/enrollment", {});
  return response.data;
};

export const verifyEnrollment = async (code) => {
  const response = await api.post("/auth/enrollment/verify", {
    code,
  });
  return response.data;
};

export const acknowledgeRecoveryCodes = async () => {
  const response = await api.post(
    "/auth/recovery/codes/acknowledge",
    { saved: true }
  );

  return response.data;
};


export const reissueRecoveryCodes = async () => {
  const response = await api.post(
    "/auth/recovery/codes/reissue",
    {}
  );

  return response.data;
};


export const submitPassword = async (data) => {
  const response = await api.post("/auth/password", data);
  return response.data;
};


export const requestPasswordReset = async (email) => {
  const response = await api.post(
    "/auth/password/reset/request",
    { email },
    { skipAuth: true }
  );

  return response.data;
};


export const redeemAuthLink = async (token) => {
  const response = await api.post("/auth/links/redeem", {
    token,
  }, { skipAuth: true });

  return response.data;
};



// export const verifyMfa = async (code) => {
//   const response = await api.post("/auth/mfa/verify", {
//     code,
//   });

//   return response.data;
// };


export const verifyMfa = async (code) => {
  const response = await api.post("/auth/mfa/verify", {
    code,
  });

  return response.data;
};

// Additional authentication/security endpoints from the provided API contract.
export const recoverWithCode = async (code) => (await api.post("/auth/recovery/code", { code })).data;
export const reauthenticate = async (password, code) => (await api.post("/auth/reauthenticate", { password, code })).data;
export const beginReplacement = async () => (await api.post("/auth/replacement", {})).data;
export const cancelReplacement = async () => (await api.delete("/auth/replacement")).data;
export const verifyReplacement = async (code) => (await api.post("/auth/replacement/verify", { code })).data;
export const signOut = async (all_sessions = false) => (await api.post("/auth/logout", all_sessions ? { all_sessions: true } : {})).data;
export const resetEmployeeMfa = async (body) => (await api.post("/auth/admin/mfa-reset", body)).data;
export const updateAdminPermissions = async (body) => (await api.post("/auth/admin/permissions", body)).data;
export const redeemRecoveryLink = async (token, password) => (await api.post("/auth/links/redeem", { token, password }, { skipAuth: true })).data;
