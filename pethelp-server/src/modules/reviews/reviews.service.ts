import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReviewRating } from './entities/review-rating.entity';
import { Match } from '../walking/entities/match.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(ReviewRating)
    private reviewRepo: Repository<ReviewRating>,
    @InjectRepository(Match)
    private matchRepo: Repository<Match>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async createReview(dto: {
    matchId: number; reviewerId: number; revieweeId: number;
    rating: number; tags?: string[]; fromRole: string; comment?: string;
  }): Promise<ReviewRating> {
    const match = await this.matchRepo.findOne({ where: { id: dto.matchId } });
    if (!match) throw new NotFoundException('Match not found');
    if (match.status !== 'completed') throw new BadRequestException('Walk not completed yet');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existing = await this.reviewRepo.findOne({ where: { matchId: dto.matchId } as any });
    if (existing) throw new BadRequestException('Already reviewed this match');

    if (dto.rating < 1 || dto.rating > 5) throw new BadRequestException('Rating must be 1-5');

    const review = this.reviewRepo.create({
      matchId: dto.matchId,
      reviewerId: dto.reviewerId,
      revieweeId: dto.revieweeId,
      rating: dto.rating,
      tags: dto.tags || null,
      fromRole: dto.fromRole,
      comment: dto.comment || null,
    });
    const saved = await this.reviewRepo.save(review);

    // Update reviewee's average rating
    await this.updateUserRating(dto.revieweeId);
    // Update completion count for walk participants
    await this.updateCompletionStats(dto.revieweeId);

    return saved;
  }

  async getUserReviews(userId: number) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.reviewRepo.find({
      where: { revieweeId: userId } as any,
      relations: ['reviewer'],
      order: { createdAt: 'DESC' },
    });
  }

  async getMatchReview(matchId: number) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.reviewRepo.findOne({ where: { matchId } as any });
  }

  private async updateUserRating(userId: number) {
    const result = await this.reviewRepo
      .createQueryBuilder('r')
      .select('AVG(r.rating)', 'avg')
      .addSelect('COUNT(r.id)', 'count')
      .where('r.revieweeId = :userId', { userId })
      .getRawOne();

    const ratingAvg = result?.avg ? Math.round(parseFloat(result.avg) * 10) / 10 : 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.userRepo.update(userId, { ratingAvg } as any);
  }

  private async updateCompletionStats(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.userRepo.update(userId, {
      completionCount: () => 'completion_count + 1',
      completedWalks: () => 'completed_walks + 1',
      completionRate: () => `CASE WHEN (completion_count + cancellation_count) > 0 THEN (completion_count + 1) / (completion_count + cancellation_count + 1) ELSE 1 END`,
    } as any);
  }
}
