import api from './api';

export const getDashboardStats = async () => {
  const res = await api.get('/dashboard/stats');
  return res.data;
};
export const getActivityLogs = async (params: Record<string, string> = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await api.get(`/dashboard/activity${query ? `?${query}` : ''}`);
  return res.data;
};