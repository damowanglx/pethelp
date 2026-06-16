import { api } from './request';
import type { WalkingRequest, Match } from '@/types/walking';
import type { PaginatedData } from '@/types/api';

export const walkingApi = {
  createRequest: (data: {
    petId: number; walkDate: string; startTime: string; endTime: string;
    durationMinutes: number; address: string; latitude: number; longitude: number;
    rewardType?: string; description?: string; requireExperience?: boolean;
  }) => api.post<WalkingRequest>('/walking/requests', data),

  getNearby: (lat: number, lng: number, radius = 5, page = 1, limit = 20) =>
    api.get<PaginatedData<WalkingRequest>>(
      `/walking/requests/nearby?latitude=${lat}&longitude=${lng}&radius=${radius}&page=${page}&limit=${limit}`
    ),

  getAll: (page = 1, limit = 20) =>
    api.get<PaginatedData<WalkingRequest>>(`/walking/requests?page=${page}&limit=${limit}`),

  getById: (id: number) => api.get<WalkingRequest & { matches: Match[] }>(`/walking/requests/${id}`),

  cancelRequest: (id: number, reason: string) =>
    api.delete(`/walking/requests/${id}`, { cancelReason: reason } as unknown as Record<string, unknown>),

  getMyPosts: () => api.get<WalkingRequest[]>('/walking/requests/my-posts'),
  getMyApplications: () => api.get<Match[]>('/walking/requests/my-applications'),

  // Match actions
  apply: (requestId: number, helperMessage?: string) =>
    api.post<Match>(`/walking/requests/${requestId}/apply`, { helperMessage }),

  acceptMatch: (matchId: number, ownerMessage?: string) =>
    api.post(`/walking/matches/${matchId}/accept`, { ownerMessage }),

  rejectMatch: (matchId: number) =>
    api.post(`/walking/matches/${matchId}/reject`),

  startWalk: (matchId: number) =>
    api.post(`/walking/matches/${matchId}/start`),

  completeWalk: (matchId: number, trackDistanceM?: number, trackDurationS?: number) =>
    api.post(`/walking/matches/${matchId}/complete`, { trackDistanceM, trackDurationS }),

  cancelMatch: (matchId: number, cancelReason: string) =>
    api.post(`/walking/matches/${matchId}/cancel`, { cancelReason }),
};
