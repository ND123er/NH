import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getOrgCode, ORG_CODE_KEY } from "../../../utils/token";
import {
  fetchCompanyDepartments,
  selectCompanyDepartments,
  selectCompanyDepartmentsError,
  selectCompanyDepartmentsLoading,
} from "../../../slices/performanceManagementSlice";

export const resolveCurrentOrganizationId = (reduxOrganizationId) => {
  if (reduxOrganizationId) return reduxOrganizationId;

  const sessionOrganizationId = getOrgCode();
  if (sessionOrganizationId) return sessionOrganizationId;

  try {
    const storedOrganizationId = localStorage.getItem(ORG_CODE_KEY)?.trim();
    if (storedOrganizationId && !["null", "undefined"].includes(storedOrganizationId)) {
      return storedOrganizationId;
    }
  } catch {
    return null;
  }

  return null;
};

export const useCompanyDepartments = () => {
  const dispatch = useDispatch();
  const reduxOrganizationId = useSelector(
    (state) => state.auth?.user?.organisation_id || state.auth?.user?.org_id,
  );
  const organizationId = resolveCurrentOrganizationId(reduxOrganizationId);

  useEffect(() => {
    if (organizationId) {
      dispatch(fetchCompanyDepartments(organizationId));
    }
  }, [dispatch, organizationId]);

  const departments = useSelector((state) =>
    selectCompanyDepartments(state, organizationId),
  );
  const isLoading = useSelector((state) =>
    selectCompanyDepartmentsLoading(state, organizationId),
  );
  const error = useSelector((state) =>
    selectCompanyDepartmentsError(state, organizationId),
  );

  const departmentNames = departments
    .map((department) =>
      typeof department === "string"
        ? department
        : department?.department_name || department?.name,
    )
    .filter(Boolean);

  return { organizationId, departments, departmentNames, isLoading, error };
};
