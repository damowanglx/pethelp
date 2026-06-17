import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { User } from '../users/entities/user.entity';
import { WechatConfig } from '../../config/wechat.config';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

interface WechatSession {
  openid: string;
  session_key: string;
  unionid?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtService: JwtService,
    private wechatConfig: WechatConfig,
  ) {}

  async login(code: string, nickname?: string, avatarUrl?: string) {
    // Dev mode bypass: code="dev" or "dev_Nickname" creates mock users
    if (code === 'dev' || code.startsWith('dev_')) {
      const name = code === 'dev' ? (nickname || 'DevUser') : code.replace('dev_', '');
      return this.devLogin(name);
    }

    const session = await this.code2Session(code);
    let user = await this.userRepo.findOne({ where: { openid: session.openid } });

    if (!user) {
      user = this.userRepo.create({
        openid: session.openid,
        unionid: session.unionid || null,
        nickname: nickname || null,
        avatarUrl: avatarUrl || null,
      });
      await this.userRepo.save(user);
    } else {
      user.lastLoginAt = new Date();
      if (nickname) user.nickname = nickname;
      if (avatarUrl) user.avatarUrl = avatarUrl;
      await this.userRepo.save(user);
    }

    const payload: JwtPayload = { sub: user.id, openid: user.openid, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
        role: user.role,
        creditScore: user.creditScore,
      },
    };
  }

  private async devLogin(nickname: string) {
    const devOpenid = `dev_${nickname}`;
    let user = await this.userRepo.findOne({ where: { openid: devOpenid } });
    if (!user) {
      user = this.userRepo.create({
        openid: devOpenid,
        nickname,
        role: 'both',
        creditScore: 80,
        isHelper: true,
        ratingAvg: 4.5,
      });
      await this.userRepo.save(user);
    }
    const payload: JwtPayload = { sub: user.id, openid: user.openid, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      user: { id: user.id, nickname: user.nickname, avatarUrl: user.avatarUrl, role: user.role, creditScore: user.creditScore },
    };
  }

  async refresh(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    const payload: JwtPayload = { sub: user.id, openid: user.openid, role: user.role };
    return { accessToken: this.jwtService.sign(payload) };
  }

  private async code2Session(code: string): Promise<WechatSession> {
    try {
      const url = 'https://api.weixin.qq.com/sns/jscode2session';
      const { data } = await axios.get(url, {
        params: {
          appid: this.wechatConfig.appId,
          secret: this.wechatConfig.secret,
          js_code: code,
          grant_type: 'authorization_code',
        },
      });

      if (data.errcode) {
        this.logger.error(`WeChat code2Session failed: ${data.errmsg}`);
        throw new UnauthorizedException('WeChat login failed');
      }

      return { openid: data.openid, session_key: data.session_key, unionid: data.unionid };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      this.logger.error('WeChat API call failed', error);
      throw new UnauthorizedException('Login service unavailable');
    }
  }
}
