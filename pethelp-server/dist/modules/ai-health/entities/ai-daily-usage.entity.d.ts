import { User } from '../../users/entities/user.entity';
export declare class AiDailyUsage {
    id: number;
    userId: number;
    queryDate: string;
    count: number;
    user: User;
}
