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
exports.Match = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const walking_request_entity_1 = require("./walking-request.entity");
const chat_message_entity_1 = require("../../chat/entities/chat-message.entity");
const review_rating_entity_1 = require("../../reviews/entities/review-rating.entity");
const walk_trail_entity_1 = require("./walk-trail.entity");
const walk_location_entity_1 = require("./walk-location.entity");
let Match = class Match {
};
exports.Match = Match;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint', unsigned: true }),
    __metadata("design:type", Number)
], Match.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', unsigned: true }),
    __metadata("design:type", Number)
], Match.prototype, "requestId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', unsigned: true }),
    __metadata("design:type", Number)
], Match.prototype, "helperId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['applied', 'accepted', 'rejected', 'cancelled', 'in_progress', 'completed', 'disputed'], default: 'applied' }),
    __metadata("design:type", String)
], Match.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 512, nullable: true }),
    __metadata("design:type", Object)
], Match.prototype, "ownerMessage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 512, nullable: true }),
    __metadata("design:type", Object)
], Match.prototype, "helperMessage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Object)
], Match.prototype, "respondedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', precision: 3, nullable: true }),
    __metadata("design:type", Object)
], Match.prototype, "startedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', precision: 3, nullable: true }),
    __metadata("design:type", Object)
], Match.prototype, "endedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', unsigned: true, nullable: true }),
    __metadata("design:type", Object)
], Match.prototype, "trackDistanceM", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', unsigned: true, nullable: true }),
    __metadata("design:type", Object)
], Match.prototype, "trackDurationS", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'tinyint', unsigned: true, default: 5 }),
    __metadata("design:type", Number)
], Match.prototype, "syncIntervalS", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Object)
], Match.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Object)
], Match.prototype, "cancelledAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 256, nullable: true }),
    __metadata("design:type", Object)
], Match.prototype, "cancelReason", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Match.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Match.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => walking_request_entity_1.WalkingRequest, (wr) => wr.matches, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'request_id' }),
    __metadata("design:type", walking_request_entity_1.WalkingRequest)
], Match.prototype, "request", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.matches, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'helper_id' }),
    __metadata("design:type", user_entity_1.User)
], Match.prototype, "helper", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => chat_message_entity_1.ChatMessage, (cm) => cm.match),
    __metadata("design:type", Array)
], Match.prototype, "messages", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => review_rating_entity_1.ReviewRating, (rr) => rr.match),
    __metadata("design:type", Array)
], Match.prototype, "reviews", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => walk_trail_entity_1.WalkTrail, (wt) => wt.match),
    __metadata("design:type", Array)
], Match.prototype, "trails", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => walk_location_entity_1.WalkLocation, (wl) => wl.match),
    __metadata("design:type", Array)
], Match.prototype, "locations", void 0);
exports.Match = Match = __decorate([
    (0, typeorm_1.Entity)('matches')
], Match);
//# sourceMappingURL=match.entity.js.map