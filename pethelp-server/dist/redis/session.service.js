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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionService = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("./redis.service");
const SESSION_PREFIX = 'session:';
const BLACKLIST_PREFIX = 'jwt:blacklist:';
let SessionService = class SessionService {
    constructor(redis) {
        this.redis = redis;
    }
    async blacklistToken(token, ttlSeconds) {
        await this.redis.set(`${BLACKLIST_PREFIX}${token}`, '1', ttlSeconds);
    }
    async isBlacklisted(token) {
        const val = await this.redis.get(`${BLACKLIST_PREFIX}${token}`);
        return val !== null;
    }
    async setUserSession(userId, data, ttlSeconds = 3600) {
        await this.redis.set(`${SESSION_PREFIX}${userId}`, data, ttlSeconds);
    }
    async getUserSession(userId) {
        return this.redis.get(`${SESSION_PREFIX}${userId}`);
    }
};
exports.SessionService = SessionService;
exports.SessionService = SessionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService])
], SessionService);
//# sourceMappingURL=session.service.js.map