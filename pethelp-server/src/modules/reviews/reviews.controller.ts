import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

@UseGuards(JwtAuthGuard)
@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Post()
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() body: {
      matchId: number; revieweeId: number; rating: number;
      tags?: string[]; fromRole: string; comment?: string;
    },
  ) {
    return this.reviewsService.createReview({ ...body, reviewerId: user.sub });
  }

  @Get('user/:userId')
  async getUserReviews(@Param('userId', ParseIntPipe) userId: number) {
    return this.reviewsService.getUserReviews(userId);
  }

  @Get('match/:matchId')
  async getMatchReview(@Param('matchId', ParseIntPipe) matchId: number) {
    return this.reviewsService.getMatchReview(matchId);
  }
}
