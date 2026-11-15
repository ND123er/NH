import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../api/axios";

export const fetchCompanyDepartments = createAsyncThunk(
  "performanceManagement/fetchCompanyDepartments",
  async (organizationId, { rejectWithValue }) => {
    try {
      const response = await api.get("/settings/get_company_departments", {
        params: { org_id: organizationId },
      });
      const departments = response?.data?.data;

      if (!Array.isArray(departments)) {
        return rejectWithValue(
          response?.data?.message || "The departments response was not a list.",
        );
      }

      return { organizationId, departments };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch company departments.",
      );
    }
  },
  {
    condition: (organizationId, { getState }) => {
      if (!organizationId) return false;

      const performanceManagement = getState().performanceManagement;
      return (
        !performanceManagement?.loadedOrganizationIds?.[organizationId] &&
        !performanceManagement?.loadingByOrganization?.[organizationId]
      );
    },
  },
);

const initialState = {
  departmentsByOrganization: {},
  loadedOrganizationIds: {},
  loadingByOrganization: {},
  errorByOrganization: {},
};

const performanceManagementSlice = createSlice({
  name: "performanceManagement",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompanyDepartments.pending, (state, action) => {
        const organizationId = action.meta.arg;
        state.loadingByOrganization[organizationId] = true;
        delete state.errorByOrganization[organizationId];
      })
      .addCase(fetchCompanyDepartments.fulfilled, (state, action) => {
        const { organizationId, departments } = action.payload;
        state.departmentsByOrganization[organizationId] = departments;
        state.loadedOrganizationIds[organizationId] = true;
        state.loadingByOrganization[organizationId] = false;
        delete state.errorByOrganization[organizationId];
      })
      .addCase(fetchCompanyDepartments.rejected, (state, action) => {
        const organizationId = action.meta.arg;
        if (!organizationId) return;

        state.loadingByOrganization[organizationId] = false;
        state.errorByOrganization[organizationId] =
          action.payload || action.error?.message || "Failed to fetch departments.";
      });
  },
});

export const selectCompanyDepartments = (state, organizationId) =>
  organizationId
    ? state.performanceManagement?.departmentsByOrganization?.[organizationId] || []
    : [];

export const selectCompanyDepartmentsLoading = (state, organizationId) =>
  organizationId
    ? Boolean(state.performanceManagement?.loadingByOrganization?.[organizationId])
    : false;

export const selectCompanyDepartmentsError = (state, organizationId) =>
  organizationId
    ? state.performanceManagement?.errorByOrganization?.[organizationId] || null
    : null;

export default performanceManagementSlice.reducer;
