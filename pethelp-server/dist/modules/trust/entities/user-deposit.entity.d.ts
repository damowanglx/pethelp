import { User } from '../../users/entities/user.entity';
export declare class UserDeposit {
    id: number;
    userId: number;
    amountCents: number;
    status: string;
    matchId: number | null;
    transactionId: string | null;
    heldAt: Date | null;
    releasedAt: Date | null;
    createdAt: Date;
    user: User;
}
