import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "../api/axios";

import {
  markLocationCreated,
  markDepartmentCreated,
} from "../slices/organizationSetupSlice";

export default function PendingCompanySetup() {
  const dispatch = useDispatch();

  const auth = useSelector((state) => state.auth);
  const setup = useSelector((state) => state.organizationSetup);

  const running = useRef(false);

  useEffect(() => {
    if (
      auth.nextStep !== "full" ||
      !auth.token ||
      !setup.pendingCompanySetup ||
      !setup.organisationId ||
      !setup.divisionCreated ||
      running.current
    ) {
      return;
    }

    // Ensure setup belongs to the authenticated organization.
    const currentOrg =
      auth.user?.organisation_id || auth.user?.org_id;

    if (!currentOrg || currentOrg !== setup.organisationId) {
      return;
    }

    running.current = true;

    const sync = async () => {
      try {
        // 1. Register Location
        if (!setup.locationCreated) {
          const location = setup.locations?.[0] || {};

          await api.post("/organization/add_company_location", {
            org_id: setup.organisationId,
            location_name: location.location_name,
            address_line_1: location.address_line_1,
            address_line_2: location.address_line_2 || "",
            city: location.city,
            state: location.state,
            country: location.country,
            postal_code: location.postal_code,
            phone: location.phone,
            timezone: location.timezone,
          });

          dispatch(markLocationCreated());
        }

        // 2. Register Department
        if (!setup.departmentCreated) {
          const department = setup.departments?.[0] || {};

          await api.post("/organization/add_company_department", {
            org_id: setup.organisationId,
            department_name: department.department_name,
            head_of_department:
              department.head_of_department || "",
            email: department.email || "",
            description: department.description || "",
          });

          dispatch(markDepartmentCreated());
        }
      } catch (err) {
        // Keep the saved values for a later retry.
        console.error(
          "Company setup pending:",
          err?.response?.data || err
        );
      } finally {
        running.current = false;
      }
    };

    sync();
  }, [
    auth.nextStep,
    auth.token,
    auth.user?.organisation_id,
    auth.user?.org_id,
    setup,
    dispatch,
  ]);

  return null;
}