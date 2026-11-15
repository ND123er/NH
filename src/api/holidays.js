import api from './axios';

export const getHolidayList = async (organisation_id) => {
  try {
    const res = await api.get(`/settings/get_holiday_list?organisation_id=${organisation_id}`);
    return res.data;
  } catch (err) {
    throw err;
  }
};

export default { getHolidayList };