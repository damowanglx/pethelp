import { User } from '../../users/entities/user.entity';
import { Pet } from '../../pets/entities/pet.entity';
export declare class AiConsultation {
    id: number;
    userId: number;
    petId: number | null;
    consultationType: string;
    parentId: number | null;
    queryText: string;
    response: Record<string, unknown>;
    relatedArticleIds: number[] | null;
    urgencyLevel: string | null;
    tokensUsed: number | null;
    queryHash: string | null;
    createdAt: Date;
    user: User;
    pet: Pet | null;
}
