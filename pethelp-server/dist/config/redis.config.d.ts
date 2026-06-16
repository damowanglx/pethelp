import { ConfigService } from '@nestjs/config';
export declare class RedisConfig {
    private configService;
    readonly host: string;
    readonly port: number;
    readonly password: string | undefined;
    constructor(configService: ConfigService);
}
