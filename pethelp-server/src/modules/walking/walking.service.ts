import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { WalkingRequest } from './entities/walking-request.entity';
import { Match } from './entities/match.entity';
import { WalkTrail } from './entities/walk-trail.entity';
import { WalkLocation } from './entities/walk-location.entity';
import { Pet } from '../pets/entities/pet.entity';
import { getBoundingBox } from '../../shared/geo-utils';
import { TrustService } from '../trust/trust.service';

@Injectable()
export class WalkingService {
  constructor(
    @InjectRepository(WalkingRequest)
    private requestRepo: Repository<WalkingRequest>,
    @InjectRepository(Match)
    private matchRepo: Repository<Match>,
    @InjectRepository(WalkTrail)
    private trailRepo: Repository<WalkTrail>,
    @InjectRepository(WalkLocation)
    private locationRepo: Repository<WalkLocation>,
    @InjectRepository(Pet)
    private petRepo: Repository<Pet>,
    @Inject(forwardRef(() => TrustService))
    private trustService: TrustService,
  ) {}

  // ============ Walking Request CRUD ============

  async createRequest(ownerId: number, dto: {
    petId: number; walkDate: string; startTime: string; endTime: string;
    durationMinutes: number; address: string; latitude: number; longitude: number;
    rewardType?: string; rewardAmount?: number; description?: string; requireExperience?: boolean;
  }): Promise<WalkingRequest> {
    const pet = await this.petRepo.findOne({ where: { id: dto.petId, userId: ownerId, isDisabled: false } });
    if (!pet) throw new NotFoundException('宠物不存在或不属于您');

    const request = this.requestRepo.create({ ...dto, ownerId, status: 'open' });
    return this.requestRepo.save(request);
  }

  async findNearby(lat: number, lng: number, radiusKm: number, page: number, limit: number) {
    const box = getBoundingBox(lat, lng, radiusKm);
    const [items, total] = await this.requestRepo.findAndCount({
      where: {
        status: 'open',
        walkDate: MoreThanOrEqual(new Date().toISOString().split('T')[0]),
      },
      relations: ['owner', 'pet'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Filter by bounding box in-memory (MySQL spatial index for production upgrade)
    const filtered = items.filter(
      (r) =>
        r.latitude >= box.minLat &&
        r.latitude <= box.maxLat &&
        r.longitude >= box.minLng &&
        r.longitude <= box.maxLng,
    );

    return {
      items: filtered.map((r) => this.sanitizeRequest(r)),
      total: filtered.length,
      page,
      limit,
    };
  }

  async findAll(page: number, limit: number) {
    const [items, total] = await this.requestRepo.findAndCount({
      where: { status: 'open' },
      relations: ['owner', 'pet'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items: items.map((r) => this.sanitizeRequest(r)), total, page, limit };
  }

  async findById(id: number): Promise<WalkingRequest> {
    const request = await this.requestRepo.findOne({
      where: { id },
      relations: ['owner', 'pet', 'matches', 'matches.helper'],
    });
    if (!request) throw new NotFoundException('遛狗请求不存在');
    return request;
  }

  async updateRequest(id: number, ownerId: number, dto: Partial<WalkingRequest>): Promise<WalkingRequest> {
    const request = await this.findById(id);
    if (request.ownerId !== ownerId) throw new ForbiddenException('这不是您的请求');
    if (request.status !== 'open') throw new BadRequestException('只能修改待匹配的请求');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.requestRepo.update(id, dto as any);
    return this.findById(id);
  }

  async cancelRequest(id: number, userId: number, reason: string): Promise<void> {
    const request = await this.findById(id);
    if (request.ownerId !== userId) throw new ForbiddenException('这不是您的请求');
    if (!['open', 'matched'].includes(request.status)) throw new BadRequestException('当前状态无法取消');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.requestRepo.update(id, { status: 'cancelled', cancelledAt: new Date(), cancelReason: reason } as any);
  }

  // ============ Match State Machine ============

  async applyForRequest(requestId: number, helperId: number, message?: string) {
    const request = await this.findById(requestId);
    if (request.status !== 'open') throw new BadRequestException('该请求已不再接受申请');
    if (request.ownerId === helperId) throw new BadRequestException('不能申请自己的请求');

    const existing = await this.matchRepo.findOne({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      where: { requestId, helperId } as any,
    });
    if (existing) throw new BadRequestException('您已经申请过了');

    const match = this.matchRepo.create({
      requestId,
      helperId,
      status: 'applied',
      helperMessage: message || null,
    });
    const saved = await this.matchRepo.save(match);

    // Update apply count
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.requestRepo.update(requestId, { applyCount: () => 'apply_count + 1' } as any);

    return saved;
  }

  async acceptApplication(matchId: number, ownerId: number, message?: string) {
    const match = await this.matchRepo.findOne({
      where: { id: matchId },
      relations: ['request'],
    });
    if (!match) throw new NotFoundException('匹配记录不存在');
    if (match.request.ownerId !== ownerId) throw new ForbiddenException('这不是您的请求');
    if (match.status !== 'applied') throw new BadRequestException('只能接受待确认的申请');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.matchRepo.update(matchId, { status: 'accepted', ownerMessage: message || null, respondedAt: new Date() } as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.requestRepo.update(match.requestId, { status: 'matched', matchedHelperId: match.helperId } as any);

    // Reject all other applicants
    await this.matchRepo.update(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { requestId: match.requestId, status: 'applied' } as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { status: 'rejected', respondedAt: new Date() } as any,
    );

    return this.matchRepo.findOne({ where: { id: matchId }, relations: ['request', 'helper'] });
  }

  async rejectApplication(matchId: number, ownerId: number) {
    const match = await this.matchRepo.findOne({ where: { id: matchId }, relations: ['request'] });
    if (!match) throw new NotFoundException('匹配记录不存在');
    if (match.request.ownerId !== ownerId) throw new ForbiddenException('这不是您的请求');
    if (match.status !== 'applied') throw new BadRequestException('只能拒绝待确认的申请');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.matchRepo.update(matchId, { status: 'rejected', respondedAt: new Date() } as any);
  }

  async startWalk(matchId: number, helperId: number) {
    const match = await this.matchRepo.findOne({
      where: { id: matchId },
      relations: ['request'],
    });
    if (!match) throw new NotFoundException('匹配记录不存在');
    if (match.helperId !== helperId) throw new ForbiddenException('这不是您的匹配');
    if (match.status !== 'accepted') throw new BadRequestException('匹配尚未被接受');

    const now = new Date();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.matchRepo.update(matchId, { status: 'in_progress', startedAt: now } as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.requestRepo.update(match.requestId, { status: 'in_progress' } as any);
  }

  async completeWalk(matchId: number, helperId: number, trackDistanceM?: number, trackDurationS?: number) {
    const match = await this.matchRepo.findOne({
      where: { id: matchId },
      relations: ['request'],
    });
    if (!match) throw new NotFoundException('匹配记录不存在');
    if (match.helperId !== helperId) throw new ForbiddenException('这不是您的匹配');
    if (match.status !== 'in_progress') throw new BadRequestException('遛狗尚未开始');

    const now = new Date();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.matchRepo.update(matchId, {
      status: 'completed',
      endedAt: now,
      completedAt: now,
      trackDistanceM: trackDistanceM || null,
      trackDurationS: trackDurationS || null,
    } as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.requestRepo.update(match.requestId, { status: 'completed', completedAt: now } as any);

    // Update credit scores for both participants
    this.trustService.recalculateCreditScore(helperId).catch((e) => console.error('Credit score update failed for helper', e));
    this.trustService.recalculateCreditScore(match.request.ownerId).catch((e) => console.error('Credit score update failed for owner', e));
  }

  async cancelMatch(matchId: number, userId: number, reason: string) {
    const match = await this.matchRepo.findOne({
      where: { id: matchId },
      relations: ['request'],
    });
    if (!match) throw new NotFoundException('匹配记录不存在');
    if (match.helperId !== userId && match.request.ownerId !== userId) throw new ForbiddenException('您不是该匹配的参与者');
    if (['completed', 'cancelled'].includes(match.status)) throw new BadRequestException('当前状态无法取消');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.matchRepo.update(matchId, { status: 'cancelled', cancelledAt: new Date(), cancelReason: reason } as any);
    // If the request was matched to this helper, reopen it
    if (match.request.matchedHelperId === match.helperId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await this.requestRepo.update(match.requestId, { status: 'open', matchedHelperId: null } as any);
    }
  }

  async getMyRequests(userId: number) {
    return this.requestRepo.find({
      where: { ownerId: userId },
      relations: ['pet', 'matchedHelper'],
      order: { createdAt: 'DESC' },
    });
  }

  async getMyApplications(userId: number) {
    return this.matchRepo.find({
      where: { helperId: userId },
      relations: ['request', 'request.pet', 'request.owner'],
      order: { createdAt: 'DESC' },
    });
  }

  // ============ GPS Tracking ============

  async getMatch(matchId: number): Promise<Match | null> {
    return this.matchRepo.findOne({ where: { id: matchId }, relations: ['request', 'helper'] });
  }

  async recordLocation(matchId: number, lat: number, lng: number, timestamp: string): Promise<void> {
    const location = this.locationRepo.create({ matchId, lat, lng, timestamp: new Date(timestamp) });
    await this.locationRepo.save(location);
  }

  async finalizeTrail(matchId: number, coordinates: Array<{ lat: number; lng: number; timestamp: string }>, totalDistanceM: number, totalDurationS: number): Promise<number> {
    const trail = this.trailRepo.create({
      matchId,
      coordinates,
      totalDistanceM: Math.round(totalDistanceM),
      totalDurationS,
      startedAt: coordinates[0]?.timestamp ? new Date(coordinates[0].timestamp) : new Date(),
      endedAt: coordinates[coordinates.length - 1]?.timestamp ? new Date(coordinates[coordinates.length - 1].timestamp) : new Date(),
    });
    const saved = await this.trailRepo.save(trail);
    return saved.id;
  }

  async getTrail(matchId: number) {
    return this.trailRepo.findOne({ where: { matchId }, order: { createdAt: 'DESC' } as Record<string, string> });
  }

  async getActiveWalk(matchId: number) {
    const match = await this.matchRepo.findOne({
      where: { id: matchId },
      relations: ['request', 'request.pet', 'helper'],
    });
    if (!match) throw new NotFoundException('匹配记录不存在');

    const latestLocations = await this.locationRepo.find({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      where: { matchId } as any,
      order: { timestamp: 'DESC' },
      take: 100,
    });

    return {
      match: {
        id: match.id,
        status: match.status,
        startedAt: match.startedAt,
        helper: match.helper ? { id: match.helper.id, nickname: match.helper.nickname } : null,
        request: match.request ? {
          pet: match.request.pet ? { name: match.request.pet.name, breed: match.request.pet.breed } : null,
          address: match.request.address,
        } : null,
      },
      locations: latestLocations.reverse().map((l) => ({ lat: l.lat, lng: l.lng, timestamp: l.timestamp })),
    };
  }

  async getLatestLocations(matchId: number, limit = 10) {
    const locations = await this.locationRepo.find({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      where: { matchId } as any,
      order: { timestamp: 'DESC' },
      take: limit,
    });
    return locations.reverse().map((l) => ({ lat: l.lat, lng: l.lng, timestamp: l.timestamp }));
  }

  // ============ Helpers ============

  private sanitizeRequest(r: WalkingRequest) {
    return {
      id: r.id,
      ownerId: r.ownerId,
      petId: r.petId,
      status: r.status,
      walkDate: r.walkDate,
      startTime: r.startTime,
      endTime: r.endTime,
      durationMinutes: r.durationMinutes,
      address: r.address,
      latitude: r.latitude,
      longitude: r.longitude,
      rewardType: r.rewardType,
      rewardAmount: r.rewardAmount,
      description: r.description,
      requireExperience: r.requireExperience,
      applyCount: r.applyCount,
      createdAt: r.createdAt,
      owner: r.owner ? { id: r.owner.id, nickname: r.owner.nickname, avatarUrl: r.owner.avatarUrl, ratingAvg: r.owner.ratingAvg } : undefined,
      pet: r.pet ? { id: r.pet.id, name: r.pet.name, breed: r.pet.breed, avatarUrl: r.pet.avatarUrl, temperament: r.pet.temperament } : undefined,
    };
  }
}
