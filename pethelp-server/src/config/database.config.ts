import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from './naming-strategy';
import { User } from '../modules/users/entities/user.entity';
import { Pet } from '../modules/pets/entities/pet.entity';
import { WalkingRequest } from '../modules/walking/entities/walking-request.entity';
import { Match } from '../modules/walking/entities/match.entity';
import { ChatMessage } from '../modules/chat/entities/chat-message.entity';
import { KnowledgeCategory } from '../modules/knowledge/entities/knowledge-category.entity';
import { KnowledgeArticle } from '../modules/knowledge/entities/knowledge-article.entity';
import { ReviewRating } from '../modules/reviews/entities/review-rating.entity';
import { WalkTrail } from '../modules/walking/entities/walk-trail.entity';
import { WalkLocation } from '../modules/walking/entities/walk-location.entity';
import { BadgeDefinition } from '../modules/trust/entities/badge-definition.entity';
import { UserBadge } from '../modules/trust/entities/user-badge.entity';
import { UserCertification } from '../modules/trust/entities/user-certification.entity';
import { UserDeposit } from '../modules/trust/entities/user-deposit.entity';
import { AiConsultation } from '../modules/ai-health/entities/ai-consultation.entity';
import { AiDailyUsage } from '../modules/ai-health/entities/ai-daily-usage.entity';

@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'mysql',
      host: this.configService.get<string>('DB_HOST', 'localhost'),
      port: this.configService.get<number>('DB_PORT', 3306),
      username: this.configService.get<string>('DB_USER', 'pethelp'),
      password: this.configService.get<string>('DB_PASSWORD', 'pethelp_dev'),
      database: this.configService.get<string>('DB_NAME', 'pethelp'),
      entities: [
        User, Pet, WalkingRequest, Match, ChatMessage,
        KnowledgeCategory, KnowledgeArticle, ReviewRating,
        WalkTrail, WalkLocation,
        BadgeDefinition, UserBadge, UserCertification, UserDeposit,
        AiConsultation, AiDailyUsage,
      ],
      namingStrategy: new SnakeNamingStrategy(),
      synchronize: false, // Use migrations in production
      migrations: ['dist/migrations/*.js'],
      migrationsRun: false,
      extra: {
        connectionLimit: this.configService.get<number>('DB_POOL_SIZE', 20),
      },
      logging: this.configService.get<string>('NODE_ENV') === 'development',
    };
  }
}
