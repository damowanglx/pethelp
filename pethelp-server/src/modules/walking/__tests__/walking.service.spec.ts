import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { WalkingService } from '../walking.service';
import { WalkingRequest } from '../entities/walking-request.entity';
import { Match } from '../entities/match.entity';
import { WalkTrail } from '../entities/walk-trail.entity';
import { WalkLocation } from '../entities/walk-location.entity';
import { Pet } from '../../pets/entities/pet.entity';
import { WalkingGateway } from '../walking.gateway';

describe('WalkingService — Match State Machine', () => {
  let service: WalkingService;

  const mockRequestRepo = { findOne: jest.fn(), update: jest.fn(), createQueryBuilder: jest.fn() };
  const mockMatchRepo = { findOne: jest.fn(), create: jest.fn(), save: jest.fn(), update: jest.fn() };
  const mockTrailRepo = { create: jest.fn(), save: jest.fn() };
  const mockLocationRepo = { create: jest.fn(), save: jest.fn() };
  const mockPetRepo = { findOne: jest.fn() };
  const mockGateway = {
    notifyMatchAccepted: jest.fn(),
    notifyMatchRejected: jest.fn(),
    notifyMatchStarted: jest.fn(),
    notifyMatchCompleted: jest.fn(),
    notifyNewApplication: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalkingService,
        { provide: getRepositoryToken(WalkingRequest), useValue: mockRequestRepo },
        { provide: getRepositoryToken(Match), useValue: mockMatchRepo },
        { provide: getRepositoryToken(WalkTrail), useValue: mockTrailRepo },
        { provide: getRepositoryToken(WalkLocation), useValue: mockLocationRepo },
        { provide: getRepositoryToken(Pet), useValue: mockPetRepo },
        { provide: WalkingGateway, useValue: mockGateway },
      ],
    }).compile();

    service = module.get<WalkingService>(WalkingService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('applyForRequest', () => {
    it('should reject if request is not open', async () => {
      mockRequestRepo.findOne.mockResolvedValue({ id: 1, ownerId: 2, status: 'matched' });

      await expect(service.applyForRequest(1, 3)).rejects.toThrow(BadRequestException);
    });

    it('should reject if helper is the owner', async () => {
      mockRequestRepo.findOne.mockResolvedValue({ id: 1, ownerId: 2, status: 'open' });

      await expect(service.applyForRequest(1, 2)).rejects.toThrow(BadRequestException);
    });

    it('should reject if helper already applied', async () => {
      mockRequestRepo.findOne.mockResolvedValue({ id: 1, ownerId: 2, status: 'open' });
      mockMatchRepo.findOne.mockResolvedValue({ id: 5 });

      await expect(service.applyForRequest(1, 3)).rejects.toThrow(BadRequestException);
    });

    it('should create match with applied status', async () => {
      mockRequestRepo.findOne.mockResolvedValue({ id: 1, ownerId: 2, status: 'open' });
      mockMatchRepo.findOne.mockResolvedValue(null);
      mockMatchRepo.create.mockReturnValue({ id: 10 });
      mockMatchRepo.save.mockResolvedValue({ id: 10, status: 'applied' });

      const result = await service.applyForRequest(1, 3, 'Hello');
      expect(result.status).toBe('applied');
      expect(mockRequestRepo.update).toHaveBeenCalledWith(1, expect.any(Object));
    });
  });

  describe('acceptApplication', () => {
    it('should reject if match is not in applied status', async () => {
      mockMatchRepo.findOne.mockResolvedValue({
        id: 1, status: 'accepted',
        request: { id: 5, ownerId: 2, status: 'open' },
      });

      await expect(service.acceptApplication(1, 2)).rejects.toThrow(BadRequestException);
    });

    it('should accept match and reject all other applicants', async () => {
      mockMatchRepo.findOne.mockResolvedValue({
        id: 1, requestId: 5, helperId: 3, status: 'applied',
        request: { id: 5, ownerId: 2, status: 'open', matchedHelperId: null },
      });

      await service.acceptApplication(1, 2);
      expect(mockMatchRepo.update).toHaveBeenCalled();
    });
  });

  describe('startWalk', () => {
    it('should reject for non-accepted match', async () => {
      mockMatchRepo.findOne.mockResolvedValue({
        id: 1, helperId: 3, status: 'applied',
        request: { id: 5, ownerId: 2, status: 'open' },
      });

      await expect(service.startWalk(1, 3)).rejects.toThrow(BadRequestException);
    });

    it('should start walk for accepted match', async () => {
      mockMatchRepo.findOne.mockResolvedValue({
        id: 1, helperId: 3, requestId: 5, status: 'accepted',
        request: { id: 5, ownerId: 2, status: 'open' },
      });

      await service.startWalk(1, 3);
      expect(mockMatchRepo.update).toHaveBeenCalled();
      expect(mockRequestRepo.update).toHaveBeenCalledWith(5, expect.any(Object));
    });
  });

  describe('completeWalk', () => {
    it('should reject for non-in-progress match', async () => {
      mockMatchRepo.findOne.mockResolvedValue({ id: 1, helperId: 3, status: 'accepted' });

      await expect(service.completeWalk(1, 3)).rejects.toThrow();
    });
  });
});
