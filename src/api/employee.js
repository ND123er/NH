import api from './axios';

export const addEmployee = async (payload) => {
  try {
    // include token if available in localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.post('/employee/add_employee', payload, { headers });
    return response.data;
  } catch (err) {
    // rethrow so callers can show messages
    throw err.response?.data || err;
  }
};

export const updateEmployeeBasicInformation = async (payload) => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    // backend expects a PUT to this route
    const response = await api.put('/employee/update_employee_basic_information', payload, { headers });
    return response.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const updateEmployee = async (idOrCode, payload, opts = { by: 'id' }) => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    if (opts.by === 'emp_code') {
      // update by emp_code via path param (matches your API: /employee/update_employee/EMP000014)
      const response = await api.put(`/employee/update_employee/${idOrCode}`, payload, { headers });
      return response.data;
    }

    // default: update by DB id (assumes backend route /employee/update_employee/:id)
    const response = await api.put(`/employee/update_employee/${idOrCode}`, payload, { headers });
    return response.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const updateContactInformation = async (payload) => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.post('/employee/update_contact_information', payload, { headers });
    return response.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const updateWorkInformation = async (payload) => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.post('/employee/add_work_information', payload, { headers });
    return response.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const updateWorkInformationPut = async (payload) => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    // PUT endpoint for update (keeps same base and path style as your other endpoints)
    const response = await api.put('/employee/update_work_information', payload, { headers });
    return response.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const deleteEmployeeEducation = async (educationId) => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.delete(`/employee/delete_employee_education/${educationId}`, { headers });
    return response.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};


export const deleteEmployeeEmergencyContact = async (employeeId, commandId) => {
  try {
    const response = await api.delete(
      "/employee/delete_employee_emergency_contact",
      {
        params: {
          employee_id: employeeId,
          contact_id: commandId,
        },
      }
    );

    return response.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const deleteEmployeePreviousExperience = async (experienceId) => {
  try {
    const response = await api.delete(
      `/employee/delete_employee_privious_experience/${experienceId}`
    );

    return response.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};