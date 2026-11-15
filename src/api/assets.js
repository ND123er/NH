import api from './axios';

export const fetchAssets = async () => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await api.get('/assets', { headers });
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const addAsset = async (payload) => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await api.post('/assets', payload, { headers });
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const updateAsset = async (id, payload) => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await api.put(`/assets/${id}`, payload, { headers });
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const deleteAsset = async (id) => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await api.delete(`/assets/${id}`, { headers });
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};
