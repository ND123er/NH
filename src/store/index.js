import { configureStore } from '@reduxjs/toolkit';
import announcementsReducer from '../slices/announcements/announcementsSlice';
import authReducer from '../slices/authSlice';
import organizationSetupReducer from '../slices/organizationSetupSlice';
import assetsReducer from '../slices/assetsSlice';
import performanceManagementReducer from '../slices/performanceManagementSlice';

const PERSIST_KEY = 'hrmsnap_announcements_state_v1';
const ORG_DRAFT_KEY = 'hrmsnap_organization_setup_draft_v1';
const AUTH_STAGE_STATE_KEY = 'hrmsnap_auth_stage_state_v1';
const PERFORMANCE_MANAGEMENT_KEY = 'hrmsnap_performance_management_state_v1';

// Load state from localStorage
function loadState() {
  try {
    const serialized = localStorage.getItem(PERSIST_KEY);
    const announcements = serialized ? JSON.parse(serialized) : {};
    let draft = {};
    try { draft = JSON.parse(sessionStorage.getItem(ORG_DRAFT_KEY) || '{}'); } catch {}
    let persistedPerformanceManagement = {};
    try {
      persistedPerformanceManagement = JSON.parse(
        localStorage.getItem(PERFORMANCE_MANAGEMENT_KEY) || '{}'
      ) || {};
    } catch {}

    return {
      ...announcements,
      ...draft,
      performanceManagement: {
        departmentsByOrganization:
          persistedPerformanceManagement.departmentsByOrganization || {},
        loadedOrganizationIds:
          persistedPerformanceManagement.loadedOrganizationIds || {},
        loadingByOrganization: {},
        errorByOrganization: {},
      },
    };
  } catch {
    return undefined;
  }
}

// Save state to localStorage
function saveState(state) {
  try {
    const serialized = JSON.stringify({ announcements: state.announcements });
    localStorage.setItem(PERSIST_KEY, serialized);
    if (state.auth?.token && state.auth.nextStep && state.auth.nextStep !== 'full') {
      sessionStorage.setItem(AUTH_STAGE_STATE_KEY, JSON.stringify({ user: state.auth.user }));
    } else {
      sessionStorage.removeItem(AUTH_STAGE_STATE_KEY);
    }
    if (state.organizationSetup) {
      sessionStorage.setItem(ORG_DRAFT_KEY, JSON.stringify({ organizationSetup: state.organizationSetup }));
    }
    if (state.performanceManagement) {
      localStorage.setItem(
        PERFORMANCE_MANAGEMENT_KEY,
        JSON.stringify({
          departmentsByOrganization:
            state.performanceManagement.departmentsByOrganization,
          loadedOrganizationIds:
            state.performanceManagement.loadedOrganizationIds,
        })
      );
    }
  } catch {}
}

// Configure the Redux store
export const store = configureStore({
  reducer: {
    announcements: announcementsReducer,
    auth: authReducer,
    organizationSetup: organizationSetupReducer,
    assets: assetsReducer,
    performanceManagement: performanceManagementReducer,
  },
  preloadedState: loadState(),
});

// Subscribe to store updates to save state changes
store.subscribe(() => saveState(store.getState()));

export default store;
