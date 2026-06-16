import { Match } from '../../walking/entities/match.entity';
import { User } from '../../users/entities/user.entity';
export declare class ReviewRating {
    id: number;
    matchId: number;
    reviewerId: number;
    revieweeId: number;
    rating: number;
    tags: string[] | null;
    fromRole: string;
    comment: string | null;
    createdAt: Date;
    match: Match;
    reviewer: User;
    reviewee: User;
}
