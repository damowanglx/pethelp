import { User } from '../../users/entities/user.entity';
import { WalkingRequest } from '../../walking/entities/walking-request.entity';
export declare class Pet {
    id: number;
    userId: number;
    name: string;
    species: string;
    breed: string;
    avatarUrl: string | null;
    birthDate: string | null;
    weightKg: number | null;
    gender: string;
    isNeutered: boolean;
    temperament: string | null;
    medicalNotes: string | null;
    walkDurationMin: number;
    isDisabled: boolean;
    createdAt: Date;
    updatedAt: Date;
    user: User;
    walkingRequests: WalkingRequest[];
}
