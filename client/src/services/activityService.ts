import api from './api';

export const getActivityLogs = async (params?: {
  limit?: number;
  page?: number;
  action?: string;
}) => {
  const res = await api.get('/activity', { params });
  return res.data;
};