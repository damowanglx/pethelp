import { ConfigService } from '@nestjs/config';
export interface LLMConfig {
    provider: string;
    apiKey: string;
    baseUrl: string;
    model: string;
}
export declare class LLMConfigService {
    private configService;
    constructor(configService: ConfigService);
    getConfig(): LLMConfig;
}
