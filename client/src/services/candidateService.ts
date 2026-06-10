import api from './api';
import axios from 'axios';
export const uploadResume = async (formData: FormData) => {
  const res = await api.post('/candidates/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  //return axios.post('http://localhost:5000/api/candidates/upload', formData);
  return res.data;
};

export const parseResume = async (formData: FormData) => {
  const res = await api.post('/candidates/parse-resume', formData, {
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

export const bulkDeleteCandidates = async (candidateIds: string[]) => {
  const res = await api.post('/candidates/bulk-delete', { candidateIds });
  return res.data;
};

export const analyzeCandidate = async (id: string) => {
  const res = await api.post(`/ai/analyze/${id}`);
  return res.data;
};

export const scoreCandidate = async (id: string, jobId: string) => {
  const res = await api.post(`/ai/score/${id}`, { jobId });
  return res.data;
};

export const exportShortlisted = async () => {
  const res = await api.get('/candidates/export/shortlisted', {
    responseType: 'blob',
  });

  // Trigger browser download
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'shortlisted-candidates.csv');
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const bulkUpdateStatus = async (
  candidateIds: string[] | string,
  status: string,
  minScore?: number
) => {
  const body: any = { status };

  if (candidateIds === 'auto') {
    body.candidateIds = 'auto';
    body.minScore = minScore;
  } else {
    body.candidateIds = candidateIds;
  }

  const res = await api.post('/candidates/bulk-status', body);
  return res.data;
};

/*export const autoShortlist = async (minScore: number) => {
  const res = await api.post('/candidates/bulk-status', {
    candidateIds: 'auto',
    status: 'shortlisted',
    minScore,
  });
  return res.data;
};*/

export const getRankedCandidates = async (jobId?: string) => {
  const params: Record<string, string> = {
    sortBy: 'aiScore',
    order: 'desc',
  };
  if (jobId) params.jobId = jobId;
  const res = await api.get('/candidates', { params });
  return res.data;
};