import api from './api';

export const getJobs = async () => {
  const res = await api.get('/jobs');
  return res.data;
};

export const createJob = async (data: {
  title: string;
  description: string;
  requiredSkills: string;
  experienceRequired: number;
}) => {
  const res = await api.post('/jobs', data);
  return res.data;
};