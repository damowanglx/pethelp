import { WalkingService } from './walking.service';
export declare class WalkingController {
    private walkingService;
    constructor(walkingService: WalkingService);
    nearby(lat: number, lng: number, radius?: number, page?: number, limit?: number): Promise<{
        items: import("./entities/walking-request.entity").WalkingRequest[];
        total: number;
        page: number;
        limit: number;
    }>;
}
