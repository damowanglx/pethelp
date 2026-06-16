import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalkingRequest } from './entities/walking-request.entity';
import { Match } from './entities/match.entity';
import { WalkTrail } from './entities/walk-trail.entity';
import { WalkLocation } from './entities/walk-location.entity';
import { WalkingController } from './walking.controller';
import { WalkingService } from './walking.service';

@Module({
  imports: [TypeOrmModule.forFeature([WalkingRequest, Match, WalkTrail, WalkLocation])],
  controllers: [WalkingController],
  providers: [WalkingService],
  exports: [WalkingService],
})
export class WalkingModule {}
