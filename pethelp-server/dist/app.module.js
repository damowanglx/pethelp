"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_module_1 = require("./config/config.module");
const database_config_1 = require("./config/database.config");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const pets_module_1 = require("./modules/pets/pets.module");
const walking_module_1 = require("./modules/walking/walking.module");
const chat_module_1 = require("./modules/chat/chat.module");
const knowledge_module_1 = require("./modules/knowledge/knowledge.module");
const reviews_module_1 = require("./modules/reviews/reviews.module");
const trust_module_1 = require("./modules/trust/trust.module");
const ai_health_module_1 = require("./modules/ai-health/ai-health.module");
const redis_module_1 = require("./redis/redis.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_module_1.ConfigModule,
            typeorm_1.TypeOrmModule.forRootAsync({
                useClass: database_config_1.DatabaseConfig,
            }),
            redis_module_1.RedisModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            pets_module_1.PetsModule,
            walking_module_1.WalkingModule,
            chat_module_1.ChatModule,
            knowledge_module_1.KnowledgeModule,
            reviews_module_1.ReviewsModule,
            trust_module_1.TrustModule,
            ai_health_module_1.AiHealthModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map