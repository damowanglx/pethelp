import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
export declare class UsersService {
    private userRepo;
    constructor(userRepo: Repository<User>);
    findById(id: number): Promise<User>;
    findByOpenid(openid: string): Promise<User | null>;
    updateProfile(id: number, data: Record<string, unknown>): Promise<User>;
    updateLocation(id: number, lat: number, lng: number): Promise<void>;
}
