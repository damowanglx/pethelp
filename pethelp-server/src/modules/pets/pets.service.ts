import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pet } from './entities/pet.entity';

@Injectable()
export class PetsService {
  constructor(
    @InjectRepository(Pet)
    private petRepo: Repository<Pet>,
  ) {}

  async findByUser(userId: number): Promise<Pet[]> {
    return this.petRepo.find({ where: { userId, isDisabled: false } });
  }

  async findById(id: number): Promise<Pet> {
    const pet = await this.petRepo.findOne({ where: { id, isDisabled: false } });
    if (!pet) throw new NotFoundException('Pet not found');
    return pet;
  }

  async create(userId: number, data: Partial<Pet>): Promise<Pet> {
    const pet = this.petRepo.create({ ...data, userId });
    return this.petRepo.save(pet);
  }

  async update(id: number, data: Record<string, unknown>): Promise<Pet> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.petRepo.update(id, data as any);
    return this.findById(id);
  }

  async remove(id: number): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.petRepo.update(id, { isDisabled: true } as any);
  }
}
