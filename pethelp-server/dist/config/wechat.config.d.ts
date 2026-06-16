import { ConfigService } from '@nestjs/config';
export declare class WechatConfig {
    private configService;
    readonly appId: string;
    readonly secret: string;
    constructor(configService: ConfigService);
}
