import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import { AiHealthService } from '../ai-health.service';
import { AiConsultation } from '../entities/ai-consultation.entity';
import { AiDailyUsage } from '../entities/ai-daily-usage.entity';
import { KnowledgeArticle } from '../../knowledge/entities/knowledge-article.entity';
import { RedisService } from '../../../redis/redis.service';

describe('AiHealthService — Rate Limiting & Free Mode', () => {
  let service: AiHealthService;

  const mockConsultRepo = { create: jest.fn(), save: jest.fn(), findAndCount: jest.fn().mockResolvedValue([[], 0]) };
  const mockUsageRepo = { findOne: jest.fn(), save: jest.fn(), update: jest.fn(), create: jest.fn() };
  const mockArticleRepo = { find: jest.fn().mockResolvedValue([]), createQueryBuilder: jest.fn() };
  const mockConfigService = { get: jest.fn().mockImplementation((k: string) => k === 'LLM_API_KEY' ? '' : null) };

  const mockRedis = {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn(),
    incr: jest.fn().mockResolvedValue(1),
    expire: jest.fn(),
    del: jest.fn(),
    rpush: jest.fn(), lrange: jest.fn().mockResolvedValue([]), llen: jest.fn().mockResolvedValue(0),
    hset: jest.fn(), hget: jest.fn(), hgetall: jest.fn(),
    sadd: jest.fn(), srem: jest.fn(),
    client: {} as unknown,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiHealthService,
        { provide: getRepositoryToken(AiConsultation), useValue: mockConsultRepo },
        { provide: getRepositoryToken(AiDailyUsage), useValue: mockUsageRepo },
        { provide: getRepositoryToken(KnowledgeArticle), useValue: mockArticleRepo },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: RedisService, useValue: mockRedis },
      ],
    }).compile();

    service = module.get<AiHealthService>(AiHealthService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('daily limit', () => {
    it('should allow consultation when under limit', async () => {
      mockRedis.get.mockResolvedValueOnce(0); // daily count

      const result = await service.consult(1, '狗拉肚子');
      expect(result).toBeDefined();
      expect(result.possible_conditions).toBeDefined();
    });

    it('should reject when daily limit reached', async () => {
      mockRedis.get.mockResolvedValueOnce(10); // at limit

      await expect(service.consult(1, '任何问题')).rejects.toThrow(BadRequestException);
    });

    it('should return usage stats', async () => {
      mockRedis.get.mockResolvedValueOnce(3);

      const usage = await service.getDailyUsage(1);
      expect(usage.used).toBe(3);
      expect(usage.limit).toBe(10);
      expect(usage.remaining).toBe(7);
    });
  });

  describe('free mode keyword matching', () => {
    it('should return emergency for dangerous symptoms', async () => {
      mockRedis.get.mockResolvedValueOnce(0);
      mockRedis.get.mockResolvedValueOnce(null); // cache miss
      mockArticleRepo.createQueryBuilder = jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      });

      const result = await service.consult(1, '狗狗吐血抽搐');
      expect(result.urgency_level).toBe('emergency');
    });

    it('should return high urgency for concerning symptoms', async () => {
      mockRedis.get.mockResolvedValueOnce(0);
      mockRedis.get.mockResolvedValueOnce(null);
      mockArticleRepo.createQueryBuilder = jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      });

      const result = await service.consult(1, '狗不吃东西精神不好');
      expect(result.urgency_level).toBe('high');
    });
  });
});
