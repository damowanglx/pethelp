import { api } from './request';

export interface ConsultationResponse {
  possible_conditions: Array<{ name: string; probability: string; description: string }>;
  urgency_level: string;
  home_care: string[];
  when_to_see_vet: string;
  disclaimer: string;
}

export const aiHealthApi = {
  consult: (queryText: string, petId?: number) =>
    api.post<ConsultationResponse>('/ai-health/consult', { queryText, petId }),
  getHistory: (page = 1, limit = 20) =>
    api.get(`/ai-health/consultations?page=${page}&limit=${limit}`),
  getDailyUsage: () => api.get<{ used: number; limit: number; remaining: number }>('/ai-health/daily-usage'),
};
