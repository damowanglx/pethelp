import { UsersService } from './users.service';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getProfile(user: JwtPayload): Promise<import("./entities/user.entity").User>;
    updateProfile(user: JwtPayload, body: Record<string, unknown>): Promise<import("./entities/user.entity").User>;
    updateLocation(user: JwtPayload, body: {
        latitude: number;
        longitude: number;
    }): Promise<{
        success: boolean;
    }>;
    getPublicProfile(id: number): Promise<import("./entities/user.entity").User>;
}
