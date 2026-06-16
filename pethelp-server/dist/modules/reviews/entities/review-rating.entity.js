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
exports.ReviewRating = void 0;
const typeorm_1 = require("typeorm");
const match_entity_1 = require("../../walking/entities/match.entity");
const user_entity_1 = require("../../users/entities/user.entity");
let ReviewRating = class ReviewRating {
};
exports.ReviewRating = ReviewRating;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint', unsigned: true }),
    __metadata("design:type", Number)
], ReviewRating.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', unsigned: true, unique: true }),
    __metadata("design:type", Number)
], ReviewRating.prototype, "matchId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', unsigned: true }),
    __metadata("design:type", Number)
], ReviewRating.prototype, "reviewerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', unsigned: true }),
    __metadata("design:type", Number)
], ReviewRating.prototype, "revieweeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'tinyint', unsigned: true }),
    __metadata("design:type", Number)
], ReviewRating.prototype, "rating", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], ReviewRating.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['owner', 'helper'] }),
    __metadata("design:type", String)
], ReviewRating.prototype, "fromRole", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], ReviewRating.prototype, "comment", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ReviewRating.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => match_entity_1.Match, (match) => match.reviews, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'match_id' }),
    __metadata("design:type", match_entity_1.Match)
], ReviewRating.prototype, "match", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.writtenReviews, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'reviewer_id' }),
    __metadata("design:type", user_entity_1.User)
], ReviewRating.prototype, "reviewer", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.receivedReviews, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'reviewee_id' }),
    __metadata("design:type", user_entity_1.User)
], ReviewRating.prototype, "reviewee", void 0);
exports.ReviewRating = ReviewRating = __decorate([
    (0, typeorm_1.Entity)('review_ratings')
], ReviewRating);
//# sourceMappingURL=review-rating.entity.js.map