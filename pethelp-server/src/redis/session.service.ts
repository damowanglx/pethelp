import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';

const SESSION_PREFIX = 'session:';
const BLACKLIST_PREFIX = 'jwt:blacklist:';

@Injectable()
export class SessionService {
  constructor(private redis: RedisService) {}

  async blacklistToken(token: string, ttlSeconds: number): Promise<void> {
    await this.redis.set(`${BLACKLIST_PREFIX}${token}`, '1', ttlSeconds);
  }

  async isBlacklisted(token: string): Promise<boolean> {
    const val = await this.redis.get(`${BLACKLIST_PREFIX}${token}`);
    return val !== null;
  }

  async setUserSession(userId: number, data: Record<string, unknown>, ttlSeconds = 3600): Promise<void> {
    await this.redis.set(`${SESSION_PREFIX}${userId}`, data, ttlSeconds);
  }

  async getUserSession<T = Record<string, unknown>>(userId: number): Promise<T | null> {
    return this.redis.get<T>(`${SESSION_PREFIX}${userId}`);
  }
}
