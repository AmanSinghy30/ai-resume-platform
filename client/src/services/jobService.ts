import api from './api';

export const getJobs = async (params?: Record<string, string | number>) => {
  const res = await api.get('/jobs', { params });
  return res.data;
};

export const getJobById = async (id: string) => {
  const res = await api.get(`/jobs/${id}`);
  return res.data;
};

export const createJob = async (data: {
  title: string;
  description: string;
  requiredSkills: string [];
  niceToHaveSkills?: string [];
  skillWeight?: number;
  experienceWeight?: number;
  roleFitWeight?: number;
  experienceRequired: number;
  minShortlistedScore?: number;
  minReviewedScore?: number;
}) => {
  const res = await api.post('/jobs', data);
  return res.data;
};

export const updateJob = async (id: string, data: any) => {
  const res = await api.put(`/jobs/${id}`, data);
  return res.data;
};

export const deleteJob = async (id: string) => {
  const res = await api.delete(`/jobs/${id}`);
  return res.data;
};

export const matchCandidates = async (jobId: string) => {
  const res = await api.post('/ai/match', { jobId });
  return res.data;
};

export const scoreAllForJob = async (jobId: string, candidateIds?: string[]) => {
  const body: any = { jobId };
  if (candidateIds && candidateIds.length > 0) {
    body.candidateIds = candidateIds;
  }
  const res = await api.post('/ai/score-all', body);
  return res.data;
};