import { PetsService } from './pets.service';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
export declare class PetsController {
    private petsService;
    constructor(petsService: PetsService);
    list(user: JwtPayload): Promise<import("./entities/pet.entity").Pet[]>;
    create(user: JwtPayload, body: Record<string, unknown>): Promise<import("./entities/pet.entity").Pet>;
    get(id: number): Promise<import("./entities/pet.entity").Pet>;
    update(id: number, body: Record<string, unknown>): Promise<import("./entities/pet.entity").Pet>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
}
