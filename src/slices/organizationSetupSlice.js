// import { createSlice } from "@reduxjs/toolkit";

// const initialState = {
//   currentStep: 1,
//   organization: {},
//   divisions: [{}],
//   locations: [{}],
//   departments: [{}],
//   organizationCreated: false,
//   pendingCompanySetup: false,
// };

// const slice = createSlice({
//   name: "organizationSetup",
//   initialState,
//   reducers: {
//     saveOrganizationStep(state, action) {
//       const { step, values } = action.payload;
//       if (step === 1) state.organization = values.org ?? {};
//       if (step === 2) state.divisions = values.divisions ?? [{}];
//       if (step === 3) state.locations = values.locations ?? [{}];
//       if (step === 4) state.departments = values.departments ?? [{}];
//       state.currentStep = step;
//     },
//     setOrganizationStep(state, action) { state.currentStep = action.payload; },
//     markOrganizationCreated(state) {
//       state.organizationCreated = true;
//       // These records have only been collected, not created on the backend.
//       state.pendingCompanySetup = true;
//     },
//     clearOrganizationSetup() { return initialState; },
//   },
//    extraReducers: (builder) => {
//   builder
//     .addCase("auth/logout", () => initialState)
//     .addCase("auth/registerAdmin/fulfilled", () => initialState);
// },
// });

// export const { saveOrganizationStep, setOrganizationStep, markOrganizationCreated, clearOrganizationSetup } = slice.actions;
// export default slice.reducer;


import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentStep: 1,
  organization: {},
  divisions: [{}],
  locations: [{}],
  departments: [{}],
  organizationCreated: false,
  pendingCompanySetup: false,
  organisationId: null,
  divisionCreated: false,
  locationCreated: false,
  departmentCreated: false,
};

const slice = createSlice({
  name: "organizationSetup",
  initialState,
  reducers: {
    saveOrganizationStep(state, action) {
      const { step, values } = action.payload;

      if (step === 1) state.organization = values.org ?? {};
      if (step === 2) state.divisions = values.divisions ?? [{}];
      if (step === 3) state.locations = values.locations ?? [{}];
      if (step === 4) state.departments = values.departments ?? [{}];

      state.currentStep = step;
    },

    setOrganizationStep(state, action) {
      state.currentStep = action.payload;
    },

    markOrganizationCreated(state, action) {
      state.organizationCreated = true;
      state.organisationId = action.payload;
      state.pendingCompanySetup = true;
    },

    markDivisionCreated(state) {
      state.divisionCreated = true;
    },

    markLocationCreated(state) {
      state.locationCreated = true;
      state.pendingCompanySetup = !state.departmentCreated;
    },

    markDepartmentCreated(state) {
      state.departmentCreated = true;
      state.pendingCompanySetup = !state.locationCreated;
    },

    clearOrganizationSetup() {
      return initialState;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase("auth/logout", () => initialState)
      .addCase("auth/registerAdmin/fulfilled", () => initialState);
  },
});

export const {
  saveOrganizationStep,
  setOrganizationStep,
  markOrganizationCreated,
  markDivisionCreated,
  markLocationCreated,
  markDepartmentCreated,
  clearOrganizationSetup,
} = slice.actions;

export default slice.reducer;
