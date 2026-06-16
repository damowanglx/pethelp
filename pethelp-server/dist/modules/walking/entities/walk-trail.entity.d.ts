import { Match } from './match.entity';
export declare class WalkTrail {
    id: number;
    matchId: number;
    coordinates: Array<{
        lat: number;
        lng: number;
        timestamp: string;
    }>;
    totalDistanceM: number;
    totalDurationS: number;
    startedAt: Date;
    endedAt: Date | null;
    createdAt: Date;
    match: Match;
}
