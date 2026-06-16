import { Controller, Get, Post, Body, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { AiHealthService } from './ai-health.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

@UseGuards(JwtAuthGuard)
@Controller('ai-health')
export class AiHealthController {
  constructor(private aiHealthService: AiHealthService) {}

  @Post('consult')
  async consult(@CurrentUser() user: JwtPayload, @Body() body: { queryText: string; petId?: number }) {
    return this.aiHealthService.consult(user.sub, body.queryText, body.petId);
  }

  @Get('consultations')
  async getHistory(@CurrentUser() user: JwtPayload, @Query('page') page = 1, @Query('limit') limit = 20) {
    return this.aiHealthService.getHistory(user.sub, page, limit);
  }

  @Get('daily-usage')
  async getDailyUsage(@CurrentUser() user: JwtPayload) {
    return this.aiHealthService.getDailyUsage(user.sub);
  }
}
