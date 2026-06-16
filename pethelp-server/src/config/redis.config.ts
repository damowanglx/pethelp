import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisConfig {
  public readonly host: string;
  public readonly port: number;
  public readonly password: string | undefined;

  constructor(private configService: ConfigService) {
    this.host = this.configService.get<string>('REDIS_HOST', 'localhost');
    this.port = this.configService.get<number>('REDIS_PORT', 6379);
    this.password = this.configService.get<string>('REDIS_PASSWORD', '') || undefined;
  }
}
