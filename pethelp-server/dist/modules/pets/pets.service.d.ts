import { Repository } from 'typeorm';
import { Pet } from './entities/pet.entity';
export declare class PetsService {
    private petRepo;
    constructor(petRepo: Repository<Pet>);
    findByUser(userId: number): Promise<Pet[]>;
    findById(id: number): Promise<Pet>;
    create(userId: number, data: Partial<Pet>): Promise<Pet>;
    update(id: number, data: Record<string, unknown>): Promise<Pet>;
    remove(id: number): Promise<void>;
}
