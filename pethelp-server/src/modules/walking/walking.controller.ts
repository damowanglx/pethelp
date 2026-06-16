import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { WalkingService } from './walking.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('walking')
export class WalkingController {
  constructor(private walkingService: WalkingService) {}

  @Get('requests/nearby')
  async nearby(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('radius') radius = 5,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.walkingService.findNearby(lat, lng, radius, page, limit);
  }
}
