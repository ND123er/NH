import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  loginUser, registerAdmin, registerOrg, getSession,
  startEnrollment,
  verifyEnrollment,
  acknowledgeRecoveryCodes,
  submitPassword,
  verifyMfa,
  redeemAuthLink,
  requestPasswordReset,
  reissueRecoveryCodes, recoverWithCode, verifyReplacement, signOut
} from "../api/auth";


import Cookies from "js-cookie";
import { persistSessionIdentity, clearSessionIdentity } from "../utils/token";
import {
  saveAuthToken,
  clearAuthToken,
} from "../utils/authToken";

const tokenFromCookie = Cookies.get("auth_token");
const tokenFromStage = sessionStorage.getItem("auth_stage_token");
const userFromCookie = Cookies.get("auth_user");

const decodeJwtPayload = (token) => {
  try {
    if (!token) return null;
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const jsonPayload = decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};


// Always use the newest bearer token. MFA responses may omit `user`.
function saveAuthTransition(data) {
  if (!data?.token) return;
  saveAuthToken(data.token, data.next_step);
  if (data.next_step !== "full") {
    // Unfinished authentication stays within this tab; do not create a full-session cookie.
    return;
  }
  const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
  const expires = data.expires_at ? new Date(data.expires_at) : undefined;
  const options = { secure: isHttps, sameSite: "lax", ...(expires && !Number.isNaN(expires.getTime()) ? { expires } : {}) };
  const prior = (() => { try { return JSON.parse(Cookies.get("auth_user") || "null"); } catch { return null; } })();
  const stageUser = (() => {
    try { return JSON.parse(sessionStorage.getItem("hrmsnap_auth_stage_state_v1") || "null")?.user; }
    catch { return null; }
  })();
  const merged = { ...(stageUser || prior || {}), ...(data.user || {}) };
  Cookies.set("auth_token", data.token, options);
  localStorage.setItem("token", data.token);
  if (Object.keys(merged).length) Cookies.set("auth_user", JSON.stringify(merged), options);
  persistSessionIdentity({ ...data, user: merged });
}
// Thunk for registering admin
export const registerAdminThunk = createAsyncThunk(
  "auth/registerAdmin",
  async (formData, { rejectWithValue }) => {
    try {
      // const data = await registerAdmin(formData);
      // return data;
      const data = await registerAdmin(formData);

      // const isHttps =
      //   typeof window !== "undefined" &&
      //   window.location.protocol === "https:";

      // if (data.token) {
      //   Cookies.set("auth_token", data.token, {
      //     expires: new Date(data.expires_at),
      //     secure: isHttps,
      //     sameSite: "lax",
      //   });
      //   localStorage.setItem("token", data.token);
      // }

      // if (data.user) {
      //   Cookies.set("auth_user", JSON.stringify(data.user), {
      //     expires: new Date(data.expires_at),
      //     secure: isHttps,
      //     sameSite: "lax",
      //   });
      // }

      // persistSessionIdentity(data);
      saveAuthTransition(data);
      return data;
    } catch (err) {
      // return rejectWithValue(err.response?.data || err.msg);
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Thunk for registering organization

export const registerOrgThunk = createAsyncThunk(
  "auth/registerOrg",
  async (formData, { rejectWithValue }) => {
    try {
      const data = await registerOrg(formData);
      // A successful transition MUST include the replacement enrollment token.
      // Do not replace the existing setup token with an incomplete response.
      if (!data?.token || data?.next_step !== "enrollment") {
        return rejectWithValue({ msg: "Unexpected organization response: enrollment token missing." });
      }
      saveAuthTransition(data);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { msg: err.message });
    }
  }
);




// export const loginUserThunk = createAsyncThunk(
//   "auth/loginUser",
//   async (formData, { rejectWithValue }) => {
//     try {
//       const data = await loginUser(formData);

//       saveAuthTransition(data);
//       return {
//         token: data.token,
//         user: data.user,
//         next_step: data.next_step,
//         expires_at: data.expires_at,
//       };
//     } catch (err) {
//       return rejectWithValue(
//         err.response?.data || err.message
//       );
//     }
//   }
// );

export const loginUserThunk = createAsyncThunk(
  "auth/loginUser",
  async (formData, { rejectWithValue }) => {
    try {
      const data = await loginUser(formData);

      // Reject API-level login failures, even when HTTP status is 200.
      if (data?.code === "INVALID_CREDENTIALS") {
        return rejectWithValue(data);
      }

      // A successful login must provide a token and next step.
      if (!data?.token || !data?.next_step) {
        return rejectWithValue({
          code: data?.code || "INVALID_LOGIN_RESPONSE",
          msg: data?.msg || "Invalid login response from server",
        });
      }

      // Preserve existing authentication and token handling.
      saveAuthTransition(data);

      return {
        token: data.token,
        user: data.user,
        next_step: data.next_step,
        expires_at: data.expires_at,
      };
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { msg: err.message }
      );
    }
  }
);


export const getSessionThunk = createAsyncThunk(
  "auth/getSession",
  async (_, { rejectWithValue }) => {
    try {
      return await getSession();
    } catch (err) {
      return rejectWithValue(
        err.response?.data || err.message
      );
    }
  }
);

export const submitPasswordThunk = createAsyncThunk(
  "auth/submitPassword",
  async (formData, { rejectWithValue }) => {
    try {
      const data = await submitPassword(formData);

      // const isHttps =
      //   typeof window !== "undefined" &&
      //   window.location.protocol === "https:";

      // if (data.token) {
      //   Cookies.set("auth_token", data.token, {
      //     expires: new Date(data.expires_at),
      //     secure: isHttps,
      //     sameSite: "lax",
      //   });
      //   localStorage.setItem("token", data.token);
      // }

      // if (data.user) {
      //   Cookies.set("auth_user", JSON.stringify(data.user), {
      //     expires: new Date(data.expires_at),
      //     secure: isHttps,
      //     sameSite: "lax",
      //   });
      // }

      // This response means the previous session is invalidated.
      // if (data.next_step === "recovery_link") {
      //   Cookies.remove("auth_token");
      //   Cookies.remove("auth_user");
      //   localStorage.removeItem("token");
      //   sessionStorage.removeItem("auth_next_step");
      //   clearSessionIdentity();
      // } else {
      //   persistSessionIdentity(data);
      // }
      if (data.next_step === "recovery_link") {
        clearAuthToken();

        Cookies.remove("auth_token");
        Cookies.remove("auth_user");
        localStorage.removeItem("token");
        sessionStorage.removeItem("auth_next_step");

        clearSessionIdentity();
      } else {
        saveAuthTransition(data);
      }
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || err.message
      );
    }
  }
);


export const requestPasswordResetThunk = createAsyncThunk(
  "auth/requestPasswordReset",
  async (email, { rejectWithValue }) => {
    try {
      return await requestPasswordReset(email);
    } catch (err) {
      return rejectWithValue(
        err.response?.data || err.message
      );
    }
  }
);


export const redeemAuthLinkThunk = createAsyncThunk(
  "auth/redeemAuthLink",
  async (token, { rejectWithValue }) => {
    try {
      const data = await redeemAuthLink(token);
      saveAuthTransition(data);
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || err.message
      );
    }
  }
);



export const startEnrollmentThunk = createAsyncThunk(
  "auth/startEnrollment",
  async (_, { rejectWithValue }) => {
    try {
      return await startEnrollment();
    } catch (err) {
      return rejectWithValue(
        err.response?.data || err.message
      );
    }
  }
);

export const verifyEnrollmentThunk = createAsyncThunk(
  "auth/verifyEnrollment",
  async (code, { rejectWithValue }) => {
    try {
      // return await verifyEnrollment(code);
      const data = await verifyEnrollment(code);

      // if (data.token) {
      //   const isHttps = window.location.protocol === "https:";

      //   Cookies.set("auth_token", data.token, {
      //     expires: new Date(data.expires_at),
      //     secure: isHttps,
      //     sameSite: "lax",
      //   });
      //   localStorage.setItem("token", data.token);
      // }

      // if (data.user) {
      //   Cookies.set("auth_user", JSON.stringify(data.user), {
      //     expires: new Date(data.expires_at),
      //     secure: window.location.protocol === "https:",
      //     sameSite: "lax",
      //   });
      // }

      // persistSessionIdentity(data);
      saveAuthTransition(data);
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || err.message
      );
    }
  }
);

export const verifyMfaThunk = createAsyncThunk(
  "auth/verifyMfa",
  async (code, { rejectWithValue }) => {
    try {
      const data = await verifyMfa(code);

      saveAuthTransition(data);
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || err.message
      );
    }
  }
);

export const acknowledgeRecoveryCodesThunk = createAsyncThunk(
  "auth/acknowledgeRecoveryCodes",
  async (_, { rejectWithValue }) => {

    try {
      const data = await acknowledgeRecoveryCodes();

      // if (data.token) {
      //   Cookies.set("auth_token", data.token, {
      //     expires: new Date(data.expires_at),
      //     secure: window.location.protocol === "https:",
      //     sameSite: "lax",
      //   });
      //   localStorage.setItem("token", data.token);
      // }

      // if (data.user) {
      //   Cookies.set("auth_user", JSON.stringify(data.user), {
      //     expires: new Date(data.expires_at),
      //     secure: window.location.protocol === "https:",
      //     sameSite: "lax",
      //   });
      // }

      // persistSessionIdentity(data);
      saveAuthTransition(data);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const reissueRecoveryCodesThunk = createAsyncThunk(
  "auth/reissueRecoveryCodes",
  async (_, { rejectWithValue }) => {
    try {
      const data = await reissueRecoveryCodes();

      if (
        !data?.token ||
        data.next_step !== "recovery_codes" ||
        !Array.isArray(data.recovery_codes) ||
        data.recovery_codes.length === 0
      ) {
        return rejectWithValue(
          "The server did not return a valid replacement token and recovery-code set."
        );
      }

      // const isHttps =
      //   typeof window !== "undefined" &&
      //   window.location.protocol === "https:";

      // Cookies.set("auth_token", data.token, {
      //   expires: new Date(data.expires_at),
      //   secure: isHttps,
      //   sameSite: "lax",
      // });
      // localStorage.setItem("token", data.token);

      // if (data.user) {
      //   Cookies.set("auth_user", JSON.stringify(data.user), {
      //     expires: new Date(data.expires_at),
      //     secure: isHttps,
      //     sameSite: "lax",
      //   });
      // }
      saveAuthTransition(data);

      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || err.message
      );
    }
  }
);


// Centralized transitions for recovery and replacement. Never keep the previous token.
export const recoverWithCodeThunk = createAsyncThunk("auth/recoverWithCode", async (code, { rejectWithValue }) => {
  try { const data = await recoverWithCode(code); saveAuthTransition(data); return data; }
  catch (err) { return rejectWithValue(err.response?.data || { msg: err.message }); }
});
export const verifyReplacementThunk = createAsyncThunk("auth/verifyReplacement", async (code, { rejectWithValue }) => {
  try { const data = await verifyReplacement(code); saveAuthTransition(data); return data; }
  catch (err) { return rejectWithValue(err.response?.data || { msg: err.message }); }
});
export const signOutThunk = createAsyncThunk("auth/signOut", async (allSessions, { dispatch }) => {
  try { await signOut(Boolean(allSessions)); } finally { dispatch(logout()); }
});
export const acceptAuthTransition = (data) => (dispatch) => {
  if (data?.next_step === "recovery_link") { dispatch(logout()); return; }
  if (!data?.token) throw new Error("Expected a replacement authentication token");
  saveAuthTransition(data);
  dispatch(setAuthTransition(data));
};

const ENROLLMENT_URI_KEY = "auth_otpauth_uri";
const ENROLLMENT_MANUAL_KEY = "auth_manual_key";

const getStoredEnrollment = () => {
  try {
    return {
      otpauthUri: sessionStorage.getItem(ENROLLMENT_URI_KEY) || "",
      manualKey: sessionStorage.getItem(ENROLLMENT_MANUAL_KEY) || "",
    };
  } catch (error) {
    return {
      otpauthUri: "",
      manualKey: "",
    };
  }
};

const persistEnrollment = (otpauthUri, manualKey) => {
  try {
    if (otpauthUri) {
      sessionStorage.setItem(ENROLLMENT_URI_KEY, otpauthUri);
    }

    if (manualKey) {
      sessionStorage.setItem(ENROLLMENT_MANUAL_KEY, manualKey);
    }
  } catch (error) {
    console.warn("Unable to persist enrollment data:", error);
  }
};

const clearStoredEnrollment = () => {
  try {
    sessionStorage.removeItem(ENROLLMENT_URI_KEY);
    sessionStorage.removeItem(ENROLLMENT_MANUAL_KEY);
  } catch (error) {
    console.warn("Unable to clear enrollment data:", error);
  }
};
// A stored step is a UI hint, not proof of a valid full session.
// A tab with an unknown/full step must confirm the shared cookie with the API.
const savedStep = sessionStorage.getItem("auth_next_step") || null;
const incompleteSteps = new Set(["organization_setup", "password_setup", "password_reset", "enrollment", "mfa", "recovery_codes", "recovery_link"]);

function updateStep(state, step) {
  state.nextStep = step || null;
  if (step && step !== "full") sessionStorage.setItem("auth_next_step", step);
  else sessionStorage.removeItem("auth_next_step");
}
const storedEnrollment = getStoredEnrollment();

const initialState = {
  loading: false,
  sessionLoading: false,
  // punchStatus: null,
  // authReady: !tokenFromCookie || incompleteSteps.has(savedStep),
  punchStatus: (() => {
    const saved = localStorage.getItem("punch_status");

    return saved === "1" || saved === "2"
      ? Number(saved)
      : null;
  })(),
  authReady: false,
  enrollmentLoading: false,
  enrollmentError: null,
  otpauthUri:
    savedStep === "enrollment"
      ? storedEnrollment.otpauthUri
      : "",

  manualKey:
    savedStep === "enrollment"
      ? storedEnrollment.manualKey
      : "",
  recoveryCodes: [],
  error: null,
  token: tokenFromStage || tokenFromCookie || null,
  // user: userFromCookie ? JSON.parse(userFromCookie) : null,
  nextStep: (tokenFromStage ? savedStep : null) || (localStorage.getItem("auth_session_token") ? "full" : null),
  user: (() => {
    try {
      if (tokenFromStage) {
        return JSON.parse(sessionStorage.getItem("hrmsnap_auth_stage_state_v1") || "null")?.user || null;
      }
      return userFromCookie ? JSON.parse(userFromCookie) : null;
    } catch {
      return null;
    }
  })(),
  // nextStep: null,
  expiresAt: null,
  registered: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthTransition: (state, action) => {
      const data = action.payload;
      state.token = data.token;
      state.user = data.user ? { ...(state.user || {}), ...data.user } : state.user;
      updateStep(state, data.next_step);
      state.expiresAt = data.expires_at || null;
      state.authReady = true;
      state.recoveryCodes = data.recovery_codes || [];
    },
    // setPunchStatus: (state, action) => {
    //   state.punchStatus = action.payload;
    // },
    setPunchStatus: (state, action) => {
      const status = action.payload;

      if (status === 1 || status === 2) {
        state.punchStatus = status;
        localStorage.setItem("punch_status", String(status));
      } else {
        state.punchStatus = null;
        localStorage.removeItem("punch_status");
      }
    },
    logout: (state) => {
      const wasStage = Boolean(sessionStorage.getItem("auth_stage_token"));
      state.sessionLoading = false;
      state.authReady = true;
      state.user = null;
      state.token = null;
      state.punchStatus = null;
      updateStep(state, null);
      state.expiresAt = null;
      state.error = null;
      state.otpauthUri = "";
      state.manualKey = "";
      state.recoveryCodes = [];

      state.enrollmentLoading = false;
      state.enrollmentError = null;

      clearStoredEnrollment();
      if (wasStage) {
        sessionStorage.removeItem("auth_stage_token");
      } else {
        clearAuthToken();
        Cookies.remove("auth_token");
        Cookies.remove("auth_user");
        localStorage.removeItem("token");
      }

      // Clear persisted authentication stage
      sessionStorage.removeItem("auth_next_step");
      if (!wasStage) clearSessionIdentity();
    },
    setOrgId: (state, action) => {
      if (state.user) {
        state.user.organisation_id = action.payload;
      }
      // Also persist to localStorage for getOrgCode() to find
      if (typeof window !== "undefined" && action.payload) {
        try {
          localStorage.setItem("org_code", action.payload);
        } catch (e) {
          console.warn("Failed to persist org_id to localStorage", e);
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(recoverWithCodeThunk.fulfilled, (state, action) => {
        state.authReady = true;
        state.token = action.payload.token;
        updateStep(state, action.payload.next_step);
        state.user = action.payload.user ? { ...(state.user || {}), ...action.payload.user } : state.user;
        if (state.user && action.payload.next_step === "full") Cookies.set("auth_user", JSON.stringify(state.user), { sameSite: "lax", secure: typeof window !== "undefined" && window.location.protocol === "https:" });
        state.expiresAt = action.payload.expires_at;
      })
      .addCase(verifyReplacementThunk.fulfilled, (state, action) => {
        state.authReady = true;
        state.token = action.payload.token;
        updateStep(state, action.payload.next_step);
        state.user = action.payload.user ? { ...(state.user || {}), ...action.payload.user } : state.user;
        if (state.user && action.payload.next_step === "full") Cookies.set("auth_user", JSON.stringify(state.user), { sameSite: "lax", secure: typeof window !== "undefined" && window.location.protocol === "https:" });
        state.expiresAt = action.payload.expires_at;
        state.recoveryCodes = action.payload.recovery_codes || [];
      })
      .addCase(registerAdminThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerAdminThunk.fulfilled, (state, action) => {
        state.authReady = true;
        state.loading = false;
        state.registered = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        updateStep(state, action.payload.next_step);
        state.expiresAt = action.payload.expires_at;
      })
      .addCase(registerAdminThunk.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.msg ||
          action.payload?.message ||
          action.error?.message ||
          "Admin registration failed";
      })
      .addCase(registerOrgThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerOrgThunk.fulfilled, (state, action) => {
        state.authReady = true;
        state.loading = false;
        state.authReady = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        updateStep(state, action.payload.next_step);
        state.expiresAt = action.payload.expires_at;
      })
      .addCase(registerOrgThunk.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.msg ||
          action.payload?.message ||
          action.error?.message ||
          "Organization registration failed";
      })
      .addCase(submitPasswordThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitPasswordThunk.fulfilled, (state, action) => {
        state.authReady = true;
        state.loading = false;

        const data = action.payload;

        if (data.next_step === "recovery_link") {
          state.token = null;
          state.user = null;
          state.expiresAt = null;
        } else {
          if (data.token) {
            state.token = data.token;
          }

          if (data.user) {
            state.user = data.user;
          }

          if (data.expires_at) {
            state.expiresAt = data.expires_at;
          }
        }

        if (data.next_step) {
          updateStep(state, data.next_step);
        }
      })
      .addCase(submitPasswordThunk.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.msg ||
          action.payload?.message ||
          action.error?.message ||
          "Password operation failed";
      })
      .addCase(loginUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // .addCase(loginUserThunk.fulfilled, (state, action) => {
      //   state.loading = false;
      //   state.authReady = true;
      //   state.token = action.payload.token;
      //   state.user = action.payload.user;
      //   updateStep(state, action.payload.next_step);
      //   state.expiresAt = action.payload.expires_at;
      // })
      .addCase(loginUserThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.authReady = true;

        state.token = action.payload.token;
        state.user = action.payload.user;
        updateStep(state, action.payload.next_step);
        state.expiresAt = action.payload.expires_at;
        // Clear old enrollment data for the new login
        state.otpauthUri = "";
        state.manualKey = "";
        state.enrollmentLoading = false;
        state.enrollmentError = null;
      })
      .addCase(loginUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed";
      })
      .addCase(getSessionThunk.pending, (state) => {
        state.sessionLoading = true;
        state.authReady = false;
        state.error = null;
      })
      .addCase(getSessionThunk.fulfilled, (state, action) => {
        state.token = state.token || sessionStorage.getItem("auth_stage_token") || localStorage.getItem("auth_session_token");
        state.sessionLoading = false;
        state.authReady = true;
        updateStep(state, action.payload.next_step);
        state.user = action.payload.user ? { ...(state.user || {}), ...action.payload.user } : state.user;
        // if (action.payload.punch_status != null) {
        //   state.punchStatus = action.payload.punch_status;
        // }
        if (action.payload.next_step === "full") {
          const status = action.payload.punch_status;

          if (status === 1 || status === 2) {
            state.punchStatus = status;
            localStorage.setItem("punch_status", String(status));
          }
        }
        if (state.user && action.payload.next_step === "full") Cookies.set("auth_user", JSON.stringify(state.user), { sameSite: "lax", secure: typeof window !== "undefined" && window.location.protocol === "https:" });
        state.expiresAt = action.payload.expires_at;
      })
      // .addCase(getSessionThunk.rejected, (state, action) => {
      //   state.sessionLoading = false;
      //   state.authReady = true;
      //   state.error = action.payload || "Session restore failed";
      //   if (state.nextStep === "full") updateStep(state, null);
      //   const code = action.payload?.code;
      //   if (["SESSION_REVOKED", "TOKEN_EXPIRED", "INVALID_TOKEN", "SESSION_EXPIRED"].includes(code)) {
      //     state.token = null;
      //     state.user = null;
      //     updateStep(state, null);
      //     clearAuthToken();
      //     Cookies.remove("auth_token");
      //     Cookies.remove("auth_user");
      //     localStorage.removeItem("token");
      //     sessionStorage.removeItem("auth_next_step");
      //     clearSessionIdentity();
      //   }
      // })
      .addCase(getSessionThunk.rejected, (state, action) => {
        state.sessionLoading = false;
        state.authReady = true;
        state.error = action.payload || "Session restore failed";

        const code = action.payload?.code;

        if (
          [
            "SESSION_REVOKED",
            "TOKEN_EXPIRED",
            "INVALID_TOKEN",
            "SESSION_EXPIRED",
          ].includes(code)
        ) {
          state.token = null;
          state.user = null;
          updateStep(state, null);

          if (sessionStorage.getItem("auth_stage_token")) {
            sessionStorage.removeItem("auth_stage_token");
          } else {
            clearAuthToken();
            Cookies.remove("auth_token");
            Cookies.remove("auth_user");
            localStorage.removeItem("token");
          }
          sessionStorage.removeItem("auth_next_step");

          clearSessionIdentity();
        }
      })
      .addCase(requestPasswordResetThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestPasswordResetThunk.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(requestPasswordResetThunk.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.msg ||
          action.payload?.message ||
          action.payload ||
          action.error?.message ||
          "Could not request password reset";
      })

      .addCase(redeemAuthLinkThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(redeemAuthLinkThunk.fulfilled, (state, action) => {
        state.authReady = true;
        state.loading = false;

        const data = action.payload;

        if (data.token) state.token = data.token;
        if (data.user) state.user = data.user;

        updateStep(state, data.next_step);
        state.expiresAt = data.expires_at || null;
      })
      .addCase(redeemAuthLinkThunk.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.msg ||
          action.payload?.message ||
          action.payload ||
          action.error?.message ||
          "Could not redeem authentication link";
      })

      .addCase(startEnrollmentThunk.pending, (state) => {
        state.enrollmentLoading = true;
        state.enrollmentError = null;
      })

      // .addCase(startEnrollmentThunk.fulfilled, (state, action) => {
      //   state.enrollmentLoading = false;
      //   state.otpauthUri = action.payload.otpauth_uri;
      //   state.manualKey = action.payload.manual_key;
      // })
      .addCase(startEnrollmentThunk.fulfilled, (state, action) => {
        state.enrollmentLoading = false;

        const otpauthUri = action.payload?.otpauth_uri || "";
        const manualKey = action.payload?.manual_key || "";

        state.otpauthUri = otpauthUri;
        state.manualKey = manualKey;

        persistEnrollment(otpauthUri, manualKey);
      })
      .addCase(startEnrollmentThunk.rejected, (state, action) => {
        state.enrollmentLoading = false;
        state.enrollmentError = action.payload || "Enrollment setup failed";
      })
      .addCase(verifyEnrollmentThunk.pending, (state) => {
        state.enrollmentLoading = true;
        state.enrollmentError = null;
      })
      // .addCase(verifyEnrollmentThunk.fulfilled, (state, action) => {
      //   state.authReady = true;
      //   state.enrollmentLoading = false;
      //   state.token = action.payload.token;
      //   state.user = action.payload.user;
      //   updateStep(state, action.payload.next_step);
      //   state.expiresAt = action.payload.expires_at;
      //   state.recoveryCodes = action.payload.recovery_codes || [];
      // })
      .addCase(verifyEnrollmentThunk.fulfilled, (state, action) => {
        state.authReady = true;
        state.enrollmentLoading = false;

        state.token = action.payload.token;
        state.user = action.payload.user;

        updateStep(state, action.payload.next_step);
        state.expiresAt = action.payload.expires_at;
        state.recoveryCodes = action.payload.recovery_codes || [];

        // Enrollment completed: remove the stored secret
        // state.otpauthUri = "";
        // state.manualKey = "";
        // clearStoredEnrollment();
      })
      .addCase(verifyEnrollmentThunk.rejected, (state, action) => {
        state.enrollmentLoading = false;
        state.enrollmentError = action.payload || "Enrollment verification failed";
      })
      .addCase(verifyMfaThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyMfaThunk.fulfilled, (state, action) => {
        state.authReady = true;
        state.loading = false;

        state.token = action.payload.token || state.token;
        state.user = action.payload.user ? { ...(state.user || {}), ...action.payload.user } : state.user;
        // state.punchStatus = action.payload.punch_status ?? null;
        if (action.payload.next_step === "full") {
          const status = action.payload.punch_status;

          if (status === 1 || status === 2) {
            state.punchStatus = status;
            localStorage.setItem("punch_status", String(status));
          } else {
            state.punchStatus = null;
            localStorage.removeItem("punch_status");
          }
        }
        updateStep(state, action.payload.next_step);
        state.expiresAt = action.payload.expires_at;

        state.recoveryCodes = action.payload.recovery_codes || [];
      })
      .addCase(verifyMfaThunk.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.msg ||
          action.payload?.message ||
          action.payload ||
          "MFA verification failed";
      })
      .addCase(acknowledgeRecoveryCodesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(acknowledgeRecoveryCodesThunk.fulfilled, (state, action) => {
        state.authReady = true;
        state.loading = false;
        state.authReady = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        updateStep(state, action.payload.next_step);
        state.expiresAt = action.payload.expires_at;
      })
      .addCase(acknowledgeRecoveryCodesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Could not confirm recovery codes";
      })
      .addCase(reissueRecoveryCodesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(reissueRecoveryCodesThunk.fulfilled, (state, action) => {
        state.authReady = true;
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user ? { ...(state.user || {}), ...action.payload.user } : state.user;
        updateStep(state, action.payload.next_step);
        state.expiresAt = action.payload.expires_at;
        state.recoveryCodes = action.payload.recovery_codes;
      })
      .addCase(reissueRecoveryCodesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.msg ||
          action.payload?.message ||
          action.payload ||
          "Could not generate a new recovery-code set.";
      });
  },
});

export const { logout, setOrgId, setAuthTransition, setPunchStatus } = authSlice.actions;
export default authSlice.reducer;

