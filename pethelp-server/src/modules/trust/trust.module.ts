import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BadgeDefinition } from './entities/badge-definition.entity';
import { UserBadge } from './entities/user-badge.entity';
import { UserCertification } from './entities/user-certification.entity';
import { UserDeposit } from './entities/user-deposit.entity';
import { User } from '../users/entities/user.entity';
import { TrustController } from './trust.controller';
import { TrustService } from './trust.service';
import { BadgeService } from './badge.service';

@Module({
  imports: [TypeOrmModule.forFeature([BadgeDefinition, UserBadge, UserCertification, UserDeposit, User])],
  controllers: [TrustController],
  providers: [TrustService, BadgeService],
  exports: [TrustService, BadgeService],
})
export class TrustModule {}
