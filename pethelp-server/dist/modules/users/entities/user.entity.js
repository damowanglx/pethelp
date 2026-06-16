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
exports.User = void 0;
const typeorm_1 = require("typeorm");
const pet_entity_1 = require("../../pets/entities/pet.entity");
const walking_request_entity_1 = require("../../walking/entities/walking-request.entity");
const match_entity_1 = require("../../walking/entities/match.entity");
const chat_message_entity_1 = require("../../chat/entities/chat-message.entity");
const review_rating_entity_1 = require("../../reviews/entities/review-rating.entity");
const user_badge_entity_1 = require("../../trust/entities/user-badge.entity");
const user_certification_entity_1 = require("../../trust/entities/user-certification.entity");
const user_deposit_entity_1 = require("../../trust/entities/user-deposit.entity");
const ai_consultation_entity_1 = require("../../ai-health/entities/ai-consultation.entity");
const ai_daily_usage_entity_1 = require("../../ai-health/entities/ai-daily-usage.entity");
let User = class User {
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint', unsigned: true }),
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 64, unique: true }),
    __metadata("design:type", String)
], User.prototype, "openid", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 64, nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "unionid", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 64, nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "nickname", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 256, nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "avatarUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['pet_owner', 'helper', 'both'], default: 'both' }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'tinyint', default: 0 }),
    __metadata("design:type", Number)
], User.prototype, "gender", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 64, nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 64, nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "province", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 7, nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "latitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 7, nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "longitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "locationUpdatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, unsigned: true, default: 0 }),
    __metadata("design:type", Number)
], User.prototype, "creditScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', unsigned: true, default: 0 }),
    __metadata("design:type", Number)
], User.prototype, "completionCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', unsigned: true, default: 0 }),
    __metadata("design:type", Number)
], User.prototype, "cancellationCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 4, unsigned: true, default: 0 }),
    __metadata("design:type", Number)
], User.prototype, "completionRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', unsigned: true, nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "avgResponseTimeS", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'tinyint', default: 0 }),
    __metadata("design:type", Boolean)
], User.prototype, "isHelper", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'tinyint', default: 0 }),
    __metadata("design:type", Boolean)
], User.prototype, "hasDeposit", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', unsigned: true, default: 0 }),
    __metadata("design:type", Number)
], User.prototype, "completedWalks", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 2, scale: 1, default: 0 }),
    __metadata("design:type", Number)
], User.prototype, "ratingAvg", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'tinyint', default: 0 }),
    __metadata("design:type", Boolean)
], User.prototype, "isDisabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "lastLoginAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => pet_entity_1.Pet, (pet) => pet.user),
    __metadata("design:type", Array)
], User.prototype, "pets", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => walking_request_entity_1.WalkingRequest, (wr) => wr.owner),
    __metadata("design:type", Array)
], User.prototype, "walkingRequests", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => match_entity_1.Match, (m) => m.helper),
    __metadata("design:type", Array)
], User.prototype, "matches", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => chat_message_entity_1.ChatMessage, (cm) => cm.sender),
    __metadata("design:type", Array)
], User.prototype, "sentMessages", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => chat_message_entity_1.ChatMessage, (cm) => cm.receiver),
    __metadata("design:type", Array)
], User.prototype, "receivedMessages", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => review_rating_entity_1.ReviewRating, (rr) => rr.reviewer),
    __metadata("design:type", Array)
], User.prototype, "writtenReviews", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => review_rating_entity_1.ReviewRating, (rr) => rr.reviewee),
    __metadata("design:type", Array)
], User.prototype, "receivedReviews", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_badge_entity_1.UserBadge, (ub) => ub.user),
    __metadata("design:type", Array)
], User.prototype, "badges", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_certification_entity_1.UserCertification, (uc) => uc.user),
    __metadata("design:type", Array)
], User.prototype, "certifications", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_deposit_entity_1.UserDeposit, (ud) => ud.user),
    __metadata("design:type", Array)
], User.prototype, "deposits", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ai_consultation_entity_1.AiConsultation, (ac) => ac.user),
    __metadata("design:type", Array)
], User.prototype, "consultations", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ai_daily_usage_entity_1.AiDailyUsage, (adu) => adu.user),
    __metadata("design:type", Array)
], User.prototype, "dailyUsage", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('users')
], User);
//# sourceMappingURL=user.entity.js.map