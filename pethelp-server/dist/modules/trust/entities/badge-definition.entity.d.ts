import { UserBadge } from './user-badge.entity';
export declare class BadgeDefinition {
    badgeKey: string;
    name: string;
    icon: string | null;
    description: string | null;
    rule: Record<string, unknown>;
    category: string;
    sortOrder: number;
    createdAt: Date;
    userBadges: UserBadge[];
}
