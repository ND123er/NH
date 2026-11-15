import api from './axios';

const PERFORMANCE_API = '/performance';

// {{base_url}}/api/v1/hrm/performance/get_dashboard
export const getAppraisalEmployee = async ({ page = 1, limit = 100, status } = {}) => {
  const params = { page, limit };
  if (status !== undefined && status !== null && status !== '') {
    params.status = status;
  }

  const response = await api.get(`${PERFORMANCE_API}/get_dashboard`, { params });
  return response.data;
};

export const getAppraisalDetails = async (appraisalId) => {
  const response = await api.get(
    `${PERFORMANCE_API}/get_appraisal/${encodeURIComponent(appraisalId)}`,
  );
  return response.data;
};

export const sendMissedDeadlineEmail = async (appraisalId) => {
  const response = await api.post(
    `${PERFORMANCE_API}/send_missed_deadline_email/${encodeURIComponent(appraisalId)}`,
    {},
  );
  return response.data;
};

export const reopenSelfAssessment = async (appraisalId) => {
  const response = await api.post(
    `${PERFORMANCE_API}/reopen_self_assessment/${encodeURIComponent(appraisalId)}`,
    {},
  );
  return response.data;
};
