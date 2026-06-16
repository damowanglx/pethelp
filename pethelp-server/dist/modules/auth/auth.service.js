"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const axios_1 = require("axios");
const user_entity_1 = require("../users/entities/user.entity");
const wechat_config_1 = require("../../config/wechat.config");
let AuthService = AuthService_1 = class AuthService {
    constructor(userRepo, jwtService, wechatConfig) {
        this.userRepo = userRepo;
        this.jwtService = jwtService;
        this.wechatConfig = wechatConfig;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async login(code, nickname, avatarUrl) {
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
        }
        else {
            user.lastLoginAt = new Date();
            if (nickname)
                user.nickname = nickname;
            if (avatarUrl)
                user.avatarUrl = avatarUrl;
            await this.userRepo.save(user);
        }
        const payload = { sub: user.id, openid: user.openid, role: user.role };
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
    async refresh(userId) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.UnauthorizedException('User not found');
        const payload = { sub: user.id, openid: user.openid, role: user.role };
        return { accessToken: this.jwtService.sign(payload) };
    }
    async code2Session(code) {
        try {
            const url = 'https://api.weixin.qq.com/sns/jscode2session';
            const { data } = await axios_1.default.get(url, {
                params: {
                    appid: this.wechatConfig.appId,
                    secret: this.wechatConfig.secret,
                    js_code: code,
                    grant_type: 'authorization_code',
                },
            });
            if (data.errcode) {
                this.logger.error(`WeChat code2Session failed: ${data.errmsg}`);
                throw new common_1.UnauthorizedException('WeChat login failed');
            }
            return { openid: data.openid, session_key: data.session_key, unionid: data.unionid };
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException)
                throw error;
            this.logger.error('WeChat API call failed', error);
            throw new common_1.UnauthorizedException('Login service unavailable');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService,
        wechat_config_1.WechatConfig])
], AuthService);
//# sourceMappingURL=auth.service.js.map