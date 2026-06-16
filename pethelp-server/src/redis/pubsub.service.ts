import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from './redis.service';

@Injectable()
export class PubSubService {
  private readonly logger = new Logger(PubSubService.name);
  private subscriber: ReturnType<typeof RedisService.prototype.client.duplicate>;

  constructor(private redis: RedisService) {
    this.subscriber = this.redis.client.duplicate();
  }

  async publish(channel: string, message: unknown): Promise<void> {
    const payload = JSON.stringify(message);
    await this.redis.client.publish(channel, payload);
  }

  async subscribe(
    channel: string,
    handler: (message: Record<string, unknown>) => void,
  ): Promise<void> {
    await this.subscriber.subscribe(channel);
    this.subscriber.on('message', (ch, msg) => {
      if (ch === channel) {
        try { handler(JSON.parse(msg)); } catch { handler({ raw: msg }); }
      }
    });
  }

  async unsubscribe(channel: string): Promise<void> {
    await this.subscriber.unsubscribe(channel);
  }
}
