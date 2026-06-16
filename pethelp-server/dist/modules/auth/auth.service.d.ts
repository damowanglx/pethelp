import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { WechatConfig } from '../../config/wechat.config';
export declare class AuthService {
    private userRepo;
    private jwtService;
    private wechatConfig;
    private readonly logger;
    constructor(userRepo: Repository<User>, jwtService: JwtService, wechatConfig: WechatConfig);
    login(code: string, nickname?: string, avatarUrl?: string): Promise<{
        accessToken: string;
        user: {
            id: number;
            nickname: string | null;
            avatarUrl: string | null;
            role: string;
            creditScore: number;
        };
    }>;
    refresh(userId: number): Promise<{
        accessToken: string;
    }>;
    private code2Session;
}
