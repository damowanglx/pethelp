import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WechatConfig {
  public readonly appId: string;
  public readonly secret: string;

  constructor(private configService: ConfigService) {
    this.appId = this.configService.get<string>('WECHAT_APPID', '');
    this.secret = this.configService.get<string>('WECHAT_SECRET', '');
  }
}
