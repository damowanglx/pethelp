import { RedisService } from './redis.service';
export declare class SessionService {
    private redis;
    constructor(redis: RedisService);
    blacklistToken(token: string, ttlSeconds: number): Promise<void>;
    isBlacklisted(token: string): Promise<boolean>;
    setUserSession(userId: number, data: Record<string, unknown>, ttlSeconds?: number): Promise<void>;
    getUserSession<T = Record<string, unknown>>(userId: number): Promise<T | null>;
}
