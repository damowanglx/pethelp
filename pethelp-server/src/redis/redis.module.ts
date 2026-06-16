import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { SessionService } from './session.service';
import { PubSubService } from './pubsub.service';

@Global()
@Module({
  providers: [RedisService, SessionService, PubSubService],
  exports: [RedisService, SessionService, PubSubService],
})
export class RedisModule {}
