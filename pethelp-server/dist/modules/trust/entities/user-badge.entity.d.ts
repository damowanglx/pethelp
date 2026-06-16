import { User } from '../../users/entities/user.entity';
import { BadgeDefinition } from './badge-definition.entity';
export declare class UserBadge {
    id: number;
    userId: number;
    badgeKey: string;
    awardedAt: Date;
    user: User;
    badge: BadgeDefinition;
}
