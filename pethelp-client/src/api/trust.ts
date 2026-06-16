import { api } from './request';

export const trustApi = {
  applyCertification: (data: { certType?: string; speciesExperience?: Array<{ species: string; years: number; count: number }>; years?: number; selfDescription?: string; proofPhotos?: string[] }) => api.post('/trust/certifications', data),
  getMyCertifications: () => api.get('/trust/certifications'),
  getCreditScore: (userId: number) => api.get(`/trust/credit-score/${userId}`),
  getUserBadges: (userId: number) => api.get(`/trust/badges/user/${userId}`),
  getAllBadges: () => api.get('/trust/badges'),
};
