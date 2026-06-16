import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from './config/config.module';
import { DatabaseConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PetsModule } from './modules/pets/pets.module';
import { WalkingModule } from './modules/walking/walking.module';
import { ChatModule } from './modules/chat/chat.module';
import { KnowledgeModule } from './modules/knowledge/knowledge.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { TrustModule } from './modules/trust/trust.module';
import { AiHealthModule } from './modules/ai-health/ai-health.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfig,
    }),
    RedisModule,
    AuthModule,
    UsersModule,
    PetsModule,
    WalkingModule,
    ChatModule,
    KnowledgeModule,
    ReviewsModule,
    TrustModule,
    AiHealthModule,
  ],
})
export class AppModule {}
