import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface LLMConfig {
  provider: string;
  apiKey: string;
  baseUrl: string;
  model: string;
}

@Injectable()
export class LLMConfigService {
  constructor(private configService: ConfigService) {}

  getConfig(): LLMConfig {
    return {
      provider: this.configService.get<string>('LLM_PROVIDER', 'deepseek'),
      apiKey: this.configService.get<string>('LLM_API_KEY', ''),
      baseUrl: this.configService.get<string>('LLM_BASE_URL', 'https://api.deepseek.com/v1'),
      model: this.configService.get<string>('LLM_MODEL', 'deepseek-chat'),
    };
  }
}
