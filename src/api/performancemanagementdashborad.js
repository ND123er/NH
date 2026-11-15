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


export const getMyAppraisals = async ({ page = 1, limit = 20 } = {}) => (await api.get(`${PERFORMANCE_API}/get_my_appraisals`, { params: { page, limit } })).data;
export const submitSelfAssessment = async (id, answers) => (await api.post(`${PERFORMANCE_API}/submit_self_assessment/${encodeURIComponent(id)}`, { answers })).data;
export const getMyReviews = async ({ page = 1, limit = 100 } = {}) => (await api.get(`${PERFORMANCE_API}/get_my_reviews`, { params: { page, limit } })).data;
export const submitReview = async (id, answers) => (await api.post(`${PERFORMANCE_API}/submit_review/${encodeURIComponent(id)}`, { answers })).data;

