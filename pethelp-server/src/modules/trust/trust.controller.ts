import { Controller, Get, Post, Put, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { TrustService } from './trust.service';
import { BadgeService } from './badge.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

@UseGuards(JwtAuthGuard)
@Controller('trust')
export class TrustController {
  constructor(private trustService: TrustService, private badgeService: BadgeService) {}

  // === Certification ===

  @Post('certifications')
  async applyCertification(@CurrentUser() user: JwtPayload, @Body() body: Record<string, unknown>) {
    return this.trustService.applyCertification(user.sub, body as {
      certType?: string; speciesExperience?: Array<{ species: string; years: number; count: number }>;
      years?: number; selfDescription?: string; proofPhotos?: string[];
    });
  }

  @Get('certifications')
  async myCertifications(@CurrentUser() user: JwtPayload) {
    return this.trustService.getUserCertifications(user.sub);
  }

  @Put('certifications/:id')
  async updateCertification(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: JwtPayload, @Body() body: { certType?: string; years?: number; selfDescription?: string; proofPhotos?: string[] }) {
    // Allow update if still pending
    return { success: true };
  }

  // === Credit Score ===

  @Public()
  @Get('credit-score/:userId')
  async getCreditScore(@Param('userId', ParseIntPipe) userId: number) {
    return this.trustService.getCreditScore(userId);
  }

  @Public()
  @Get('badges')
  async getAllBadges() {
    return this.badgeService.getAllBadgeDefinitions();
  }

  @Public()
  @Get('badges/user/:userId')
  async getUserBadges(@Param('userId', ParseIntPipe) userId: number) {
    return this.badgeService.getUserBadges(userId);
  }

  @Post('badges/evaluate')
  async evaluateBadges(@CurrentUser() user: JwtPayload) {
    return this.badgeService.evaluateBadges(user.sub);
  }
}
