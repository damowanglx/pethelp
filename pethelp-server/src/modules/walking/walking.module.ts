import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalkingRequest } from './entities/walking-request.entity';
import { Match } from './entities/match.entity';
import { WalkTrail } from './entities/walk-trail.entity';
import { WalkLocation } from './entities/walk-location.entity';
import { Pet } from '../pets/entities/pet.entity';
import { WalkingController } from './walking.controller';
import { WalkingService } from './walking.service';
import { WalkingGateway } from './walking.gateway';
import { WsAuthGuard } from '../../common/guards/ws-auth.guard';

@Module({
  imports: [TypeOrmModule.forFeature([WalkingRequest, Match, WalkTrail, WalkLocation, Pet])],
  controllers: [WalkingController],
  providers: [WalkingService, WalkingGateway, WsAuthGuard],
  exports: [WalkingService, WalkingGateway],
})
export class WalkingModule {}
