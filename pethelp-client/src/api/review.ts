import { api } from './request';

export const reviewApi = {
  create: (data: { matchId: number; revieweeId: number; rating: number; tags?: string[]; fromRole: string; comment?: string }) => api.post('/reviews', data),
  getUserReviews: (userId: number) => api.get(`/reviews/user/${userId}`),
  getMatchReview: (matchId: number) => api.get(`/reviews/match/${matchId}`),
};
