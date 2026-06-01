import api from './api';

export const uploadResume = async (formData: FormData) => {
  const res = await api.post('/candidates/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const getCandidates = async (params?: Record<string, string>) => {
  const res = await api.get('/candidates', { params });
  return res.data;
};

export const getCandidateById = async (id: string) => {
  const res = await api.get(`/candidates/${id}`);
  return res.data;
};

export const updateCandidateStatus = async (id: string, status: string) => {
  const res = await api.patch(`/candidates/${id}/status`, { status });
  return res.data;
};

export const deleteCandidate = async (id: string) => {
  const res = await api.delete(`/candidates/${id}`);
  return res.data;
};