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
var PubSubService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PubSubService = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("./redis.service");
let PubSubService = PubSubService_1 = class PubSubService {
    constructor(redis) {
        this.redis = redis;
        this.logger = new common_1.Logger(PubSubService_1.name);
        this.subscriber = this.redis.client.duplicate();
    }
    async publish(channel, message) {
        const payload = JSON.stringify(message);
        await this.redis.client.publish(channel, payload);
    }
    async subscribe(channel, handler) {
        await this.subscriber.subscribe(channel);
        this.subscriber.on('message', (ch, msg) => {
            if (ch === channel) {
                try {
                    handler(JSON.parse(msg));
                }
                catch {
                    handler({ raw: msg });
                }
            }
        });
    }
    async unsubscribe(channel) {
        await this.subscriber.unsubscribe(channel);
    }
};
exports.PubSubService = PubSubService;
exports.PubSubService = PubSubService = PubSubService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService])
], PubSubService);
//# sourceMappingURL=pubsub.service.js.map