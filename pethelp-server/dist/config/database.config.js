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
exports.DatabaseConfig = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const user_entity_1 = require("../modules/users/entities/user.entity");
const pet_entity_1 = require("../modules/pets/entities/pet.entity");
const walking_request_entity_1 = require("../modules/walking/entities/walking-request.entity");
const match_entity_1 = require("../modules/walking/entities/match.entity");
const chat_message_entity_1 = require("../modules/chat/entities/chat-message.entity");
const knowledge_category_entity_1 = require("../modules/knowledge/entities/knowledge-category.entity");
const knowledge_article_entity_1 = require("../modules/knowledge/entities/knowledge-article.entity");
const review_rating_entity_1 = require("../modules/reviews/entities/review-rating.entity");
const walk_trail_entity_1 = require("../modules/walking/entities/walk-trail.entity");
const walk_location_entity_1 = require("../modules/walking/entities/walk-location.entity");
const badge_definition_entity_1 = require("../modules/trust/entities/badge-definition.entity");
const user_badge_entity_1 = require("../modules/trust/entities/user-badge.entity");
const user_certification_entity_1 = require("../modules/trust/entities/user-certification.entity");
const user_deposit_entity_1 = require("../modules/trust/entities/user-deposit.entity");
const ai_consultation_entity_1 = require("../modules/ai-health/entities/ai-consultation.entity");
const ai_daily_usage_entity_1 = require("../modules/ai-health/entities/ai-daily-usage.entity");
let DatabaseConfig = class DatabaseConfig {
    constructor(configService) {
        this.configService = configService;
    }
    createTypeOrmOptions() {
        return {
            type: 'mysql',
            host: this.configService.get('DB_HOST', 'localhost'),
            port: this.configService.get('DB_PORT', 3306),
            username: this.configService.get('DB_USER', 'pethelp'),
            password: this.configService.get('DB_PASSWORD', 'pethelp_dev'),
            database: this.configService.get('DB_NAME', 'pethelp'),
            entities: [
                user_entity_1.User, pet_entity_1.Pet, walking_request_entity_1.WalkingRequest, match_entity_1.Match, chat_message_entity_1.ChatMessage,
                knowledge_category_entity_1.KnowledgeCategory, knowledge_article_entity_1.KnowledgeArticle, review_rating_entity_1.ReviewRating,
                walk_trail_entity_1.WalkTrail, walk_location_entity_1.WalkLocation,
                badge_definition_entity_1.BadgeDefinition, user_badge_entity_1.UserBadge, user_certification_entity_1.UserCertification, user_deposit_entity_1.UserDeposit,
                ai_consultation_entity_1.AiConsultation, ai_daily_usage_entity_1.AiDailyUsage,
            ],
            synchronize: false,
            logging: this.configService.get('NODE_ENV') === 'development',
        };
    }
};
exports.DatabaseConfig = DatabaseConfig;
exports.DatabaseConfig = DatabaseConfig = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], DatabaseConfig);
//# sourceMappingURL=database.config.js.map