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
exports.WalkTrail = void 0;
const typeorm_1 = require("typeorm");
const match_entity_1 = require("./match.entity");
let WalkTrail = class WalkTrail {
};
exports.WalkTrail = WalkTrail;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint', unsigned: true }),
    __metadata("design:type", Number)
], WalkTrail.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', unsigned: true }),
    __metadata("design:type", Number)
], WalkTrail.prototype, "matchId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json' }),
    __metadata("design:type", Array)
], WalkTrail.prototype, "coordinates", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', unsigned: true, default: 0 }),
    __metadata("design:type", Number)
], WalkTrail.prototype, "totalDistanceM", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', unsigned: true, default: 0 }),
    __metadata("design:type", Number)
], WalkTrail.prototype, "totalDurationS", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', precision: 3 }),
    __metadata("design:type", Date)
], WalkTrail.prototype, "startedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', precision: 3, nullable: true }),
    __metadata("design:type", Object)
], WalkTrail.prototype, "endedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ precision: 3 }),
    __metadata("design:type", Date)
], WalkTrail.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => match_entity_1.Match, (match) => match.trails, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'match_id' }),
    __metadata("design:type", match_entity_1.Match)
], WalkTrail.prototype, "match", void 0);
exports.WalkTrail = WalkTrail = __decorate([
    (0, typeorm_1.Entity)('walk_trails')
], WalkTrail);
//# sourceMappingURL=walk-trail.entity.js.map