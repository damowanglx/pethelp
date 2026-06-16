import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WalkingRequest } from './entities/walking-request.entity';
import { Match } from './entities/match.entity';
import { getBoundingBox } from '../../shared/geo-utils';

@Injectable()
export class WalkingService {
  constructor(
    @InjectRepository(WalkingRequest)
    private requestRepo: Repository<WalkingRequest>,
    @InjectRepository(Match)
    private matchRepo: Repository<Match>,
  ) {}

  async findNearby(lat: number, lng: number, radiusKm: number, page = 1, limit = 20) {
    const box = getBoundingBox(lat, lng, radiusKm);
    const [items, total] = await this.requestRepo.findAndCount({
      where: {
        status: 'open',
        latitude: { $gte: box.minLat, $lte: box.maxLat } as unknown as number,
        longitude: { $gte: box.minLng, $lte: box.maxLng } as unknown as number,
      },
      relations: ['owner', 'pet'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, limit };
  }

  // Stub — full implementation in Phase 1
}
