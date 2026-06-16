import { Repository } from 'typeorm';
import { WalkingRequest } from './entities/walking-request.entity';
import { Match } from './entities/match.entity';
export declare class WalkingService {
    private requestRepo;
    private matchRepo;
    constructor(requestRepo: Repository<WalkingRequest>, matchRepo: Repository<Match>);
    findNearby(lat: number, lng: number, radiusKm: number, page?: number, limit?: number): Promise<{
        items: WalkingRequest[];
        total: number;
        page: number;
        limit: number;
    }>;
}
