import { Match } from './match.entity';
export declare class WalkLocation {
    id: number;
    matchId: number;
    lat: number;
    lng: number;
    timestamp: Date;
    createdAt: Date;
    match: Match;
}
