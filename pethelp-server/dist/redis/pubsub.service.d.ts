import { RedisService } from './redis.service';
export declare class PubSubService {
    private redis;
    private readonly logger;
    private subscriber;
    constructor(redis: RedisService);
    publish(channel: string, message: unknown): Promise<void>;
    subscribe(channel: string, handler: (message: Record<string, unknown>) => void): Promise<void>;
    unsubscribe(channel: string): Promise<void>;
}
