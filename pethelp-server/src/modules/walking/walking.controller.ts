import { Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { WalkingService } from './walking.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { CreateWalkingRequestDto } from './dto/create-request.dto';
import { NearbyQueryDto } from './dto/nearby-query.dto';
import { ApplyMatchDto, AcceptMatchDto, CancelMatchDto } from './dto/match.dto';

@UseGuards(JwtAuthGuard)
@Controller('walking')
export class WalkingController {
  constructor(private walkingService: WalkingService) {}

  // === Walking Requests ===

  @Post('requests')
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateWalkingRequestDto) {
    return this.walkingService.createRequest(user.sub, dto);
  }

  @Get('requests')
  async list(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.walkingService.findAll(page, limit);
  }

  @Get('requests/nearby')
  async nearby(@Query() query: NearbyQueryDto) {
    return this.walkingService.findNearby(query.latitude, query.longitude, query.radius || 5, query.page || 1, query.limit || 20);
  }

  @Get('requests/my-posts')
  async myPosts(@CurrentUser() user: JwtPayload) {
    return this.walkingService.getMyRequests(user.sub);
  }

  @Get('requests/my-applications')
  async myApplications(@CurrentUser() user: JwtPayload) {
    return this.walkingService.getMyApplications(user.sub);
  }

  @Get('requests/:id')
  async get(@Param('id', ParseIntPipe) id: number) {
    return this.walkingService.findById(id);
  }

  @Patch('requests/:id')
  async update(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: JwtPayload, @Body() body: Record<string, unknown>) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.walkingService.updateRequest(id, user.sub, body as any);
  }

  @Delete('requests/:id')
  async cancelRequest(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CancelMatchDto,
  ) {
    await this.walkingService.cancelRequest(id, user.sub, dto.cancelReason);
    return { success: true };
  }

  // === Match Actions ===

  @Post('requests/:id/apply')
  async apply(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: JwtPayload, @Body() dto: ApplyMatchDto) {
    return this.walkingService.applyForRequest(id, user.sub, dto.helperMessage);
  }

  @Post('matches/:id/accept')
  async acceptMatch(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: JwtPayload, @Body() dto: AcceptMatchDto) {
    return this.walkingService.acceptApplication(id, user.sub, dto.ownerMessage);
  }

  @Post('matches/:id/reject')
  async rejectMatch(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: JwtPayload) {
    await this.walkingService.rejectApplication(id, user.sub);
    return { success: true };
  }

  @Post('matches/:id/start')
  async startWalk(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: JwtPayload) {
    await this.walkingService.startWalk(id, user.sub);
    return { success: true };
  }

  @Post('matches/:id/complete')
  async completeWalk(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
    @Body() body: { trackDistanceM?: number; trackDurationS?: number },
  ) {
    await this.walkingService.completeWalk(id, user.sub, body.trackDistanceM, body.trackDurationS);
    return { success: true };
  }

  @Post('matches/:id/cancel')
  async cancelMatch(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: JwtPayload, @Body() dto: CancelMatchDto) {
    await this.walkingService.cancelMatch(id, user.sub, dto.cancelReason);
    return { success: true };
  }
}
