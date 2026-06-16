import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async findById(id: number): Promise<User> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = await this.userRepo.findOne({ where: { id } as any });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByOpenid(openid: string): Promise<User | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.userRepo.findOne({ where: { openid } as any });
  }

  async updateProfile(id: number, data: Record<string, unknown>): Promise<User> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.userRepo.update(id, data as any);
    return this.findById(id);
  }

  async updateLocation(id: number, lat: number, lng: number): Promise<void> {
    await this.userRepo.update(id, {
      latitude: lat,
      longitude: lng,
      locationUpdatedAt: new Date(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  }
}
