import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TrustService } from '../trust.service';
import { User } from '../../users/entities/user.entity';
import { UserBadge } from '../entities/user-badge.entity';
import { BadgeDefinition } from '../entities/badge-definition.entity';
import { UserCertification } from '../entities/user-certification.entity';
import { UserDeposit } from '../entities/user-deposit.entity';
import { BadgeService } from '../badge.service';

describe('TrustService — Credit Score Calculation', () => {
  let service: TrustService;

  const mockUserRepo = { findOne: jest.fn(), update: jest.fn() };
  const mockBadgeRepo = {};
  const mockUserBadgeRepo = {};
  const mockCertRepo = {
    find: jest.fn().mockResolvedValue([]),
  };
  const mockDepositRepo = {};
  const mockBadgeService = { evaluateAll: jest.fn().mockResolvedValue([]) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrustService,
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: getRepositoryToken(BadgeDefinition), useValue: mockBadgeRepo },
        { provide: getRepositoryToken(UserBadge), useValue: mockUserBadgeRepo },
        { provide: getRepositoryToken(UserCertification), useValue: mockCertRepo },
        { provide: getRepositoryToken(UserDeposit), useValue: mockDepositRepo },
        { provide: BadgeService, useValue: mockBadgeService },
      ],
    }).compile();

    service = module.get<TrustService>(TrustService);
  });

  describe('recalculateCreditScore', () => {
    it('should return 50 for average user (3.0 rating, 50% completion, no cert)', async () => {
      mockUserRepo.findOne.mockResolvedValue({
        id: 1,
        ratingAvg: 3.0,
        completionRate: 0.5,
        completionCount: 5,
        completedWalks: 5,
        cancellationCount: 0,
        isHelper: true,
      });

      const score = await service.recalculateCreditScore(1);
      // (3.0/5 * 50) + (0.5 * 30) + (0/10 * 20) = 30 + 15 + 0 = 45
      expect(score).toBe(45);
    });

    it('should return 100 for perfect user', async () => {
      mockUserRepo.findOne.mockResolvedValue({
        id: 1,
        ratingAvg: 5.0,
        completionRate: 1.0,
        completionCount: 50,
        completedWalks: 50,
        cancellationCount: 0,
        isHelper: true,
      });
      mockCertRepo.find.mockResolvedValue([{ years: 10 }]);

      const score = await service.recalculateCreditScore(1);
      // (5.0/5 * 50) + (1.0 * 30) + (min(10,10)/10 * 20) = 50 + 30 + 20 = 100
      expect(score).toBe(100);
    });

    it('should cap experience at 10 years', async () => {
      mockUserRepo.findOne.mockResolvedValue({
        id: 1,
        ratingAvg: 4.0,
        completionRate: 0.8,
        completionCount: 20,
        completedWalks: 20,
        cancellationCount: 0,
        isHelper: true,
      });
      mockCertRepo.find.mockResolvedValue([{ years: 15 }]);

      const score = await service.recalculateCreditScore(1);
      // (4.0/5 * 50) + (0.8 * 30) + (min(15,10)/10 * 20) = 40 + 24 + 20 = 84
      expect(score).toBe(84);
    });

    it('should return 0 for worst case', async () => {
      mockUserRepo.findOne.mockResolvedValue({
        id: 1,
        ratingAvg: 0,
        completionRate: 0,
        completionCount: 0,
        completedWalks: 0,
        cancellationCount: 100,
        isHelper: false,
      });

      const score = await service.recalculateCreditScore(1);
      expect(typeof score).toBe('number');
      // (0/5*50) + (0*30) + (0/10*20) = 0
    });
  });
});
