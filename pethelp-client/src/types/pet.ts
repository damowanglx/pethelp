export type PetSpecies = 'dog' | 'cat' | 'other';
export type PetGender = 'male' | 'female' | 'unknown';

export interface Pet {
  id: number;
  userId: number;
  name: string;
  species: PetSpecies;
  breed: string;
  avatarUrl: string | null;
  birthDate: string | null;
  weightKg: number | null;
  gender: PetGender;
  isNeutered: boolean;
  temperament: string | null;
  medicalNotes: string | null;
  walkDurationMin: number;
  createdAt: string;
  updatedAt: string;
}
