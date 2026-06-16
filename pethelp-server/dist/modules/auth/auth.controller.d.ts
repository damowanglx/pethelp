import { AuthService } from './auth.service';
import { LoginDto, RefreshTokenDto } from './dto/login.dto';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(dto: LoginDto): Promise<{
        accessToken: string;
        user: {
            id: number;
            nickname: string | null;
            avatarUrl: string | null;
            role: string;
            creditScore: number;
        };
    }>;
    refresh(user: JwtPayload, _dto: RefreshTokenDto): Promise<{
        accessToken: string;
    }>;
    logout(): Promise<{
        message: string;
    }>;
}
