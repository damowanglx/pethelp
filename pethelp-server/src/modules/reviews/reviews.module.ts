import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewRating } from './entities/review-rating.entity';
import { Match } from '../walking/entities/match.entity';
import { User } from '../users/entities/user.entity';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

@Module({
  imports: [TypeOrmModule.forFeature([ReviewRating, Match, User])],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
