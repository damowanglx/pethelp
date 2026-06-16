import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BadgeDefinition } from './entities/badge-definition.entity';
import { UserBadge } from './entities/user-badge.entity';
import { UserCertification } from './entities/user-certification.entity';
import { UserDeposit } from './entities/user-deposit.entity';
import { TrustController } from './trust.controller';
import { TrustService } from './trust.service';

@Module({
  imports: [TypeOrmModule.forFeature([BadgeDefinition, UserBadge, UserCertification, UserDeposit])],
  controllers: [TrustController],
  providers: [TrustService],
  exports: [TrustService],
})
export class TrustModule {}
