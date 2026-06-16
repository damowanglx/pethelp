import { api } from './request';
import type { Pet } from '@/types/pet';

export const petApi = {
  list: () => api.get<Pet[]>('/pets'),
  getById: (id: number) => api.get<Pet>(`/pets/${id}`),
  create: (data: { name: string; species: string; breed: string; avatarUrl?: string; birthDate?: string; weightKg?: number; gender?: string; isNeutered?: boolean; temperament?: string; medicalNotes?: string; walkDurationMin?: number }) => api.post<Pet>('/pets', data),
  update: (id: number, data: Record<string, unknown>) => api.patch<Pet>(`/pets/${id}`, data),
  remove: (id: number) => api.delete(`/pets/${id}`),
};
