import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserBadge } from './entities/user-badge.entity';
import { BadgeDefinition } from './entities/badge-definition.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class BadgeService {
  private readonly logger = new Logger(BadgeService.name);

  constructor(
    @InjectRepository(UserBadge)
    private userBadgeRepo: Repository<UserBadge>,
    @InjectRepository(BadgeDefinition)
    private badgeDefRepo: Repository<BadgeDefinition>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async evaluateBadges(userId: number) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['certifications', 'badges'],
    });
    if (!user) return [];

    const badges = await this.badgeDefRepo.find();
    const existingKeys = user.badges?.map((b) => b.badgeKey) || [];
    const newBadges: string[] = [];

    for (const badge of badges) {
      if (existingKeys.includes(badge.badgeKey)) continue;
      if (this.evaluateRule(badge.rule as Record<string, unknown>, user)) {
        await this.userBadgeRepo.save(this.userBadgeRepo.create({ userId, badgeKey: badge.badgeKey }));
        newBadges.push(badge.badgeKey);
        this.logger.log(`Badge awarded: ${badge.badgeKey} → user ${userId}`);
      }
    }
    return newBadges;
  }

  private evaluateRule(rule: Record<string, unknown>, user: User): boolean {
    const type = rule['type'] as string;
    const operator = rule['operator'] as string;
    const value = rule['value'] as number;

    switch (type) {
      case 'walks_count':
        return this.compare(user.completedWalks, operator, value);
      case 'completion_rate':
        return this.compare(user.completionRate, operator, value)
          && (rule['min_walks'] === undefined || user.completedWalks >= (rule['min_walks'] as number));
      case 'rating_avg':
        return this.compare(user.ratingAvg, operator, value)
          && (rule['min_reviews'] === undefined || user.completionCount >= (rule['min_reviews'] as number));
      case 'response_time':
        if (!user.avgResponseTimeS) return false;
        return this.compare(user.avgResponseTimeS, operator, value);
      case 'cert_type': {
        const certs = user.certifications || [];
        const certValue = rule['value'] as string;
        return certs.some((c) => c.certType === certValue && c.status === 'approved');
      }
      case 'consultations_count': {
        return this.compare(user.completionCount, operator, value);
      }
      default:
        return false;
    }
  }

  private compare(actual: number, op: string, expected: number): boolean {
    switch (op) {
      case 'gte': return actual >= expected;
      case 'lte': return actual <= expected;
      case 'gt': return actual > expected;
      case 'lt': return actual < expected;
      case 'eq': return actual === expected;
      default: return false;
    }
  }

  async getUserBadges(userId: number) {
    return this.userBadgeRepo.find({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      where: { userId } as any,
      relations: ['badge'],
      order: { awardedAt: 'DESC' },
    });
  }

  async getAllBadgeDefinitions() {
    return this.badgeDefRepo.find({ order: { sortOrder: 'ASC' } });
  }
}
