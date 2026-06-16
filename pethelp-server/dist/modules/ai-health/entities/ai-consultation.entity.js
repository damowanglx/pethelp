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
exports.AiConsultation = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const pet_entity_1 = require("../../pets/entities/pet.entity");
let AiConsultation = class AiConsultation {
};
exports.AiConsultation = AiConsultation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint', unsigned: true }),
    __metadata("design:type", Number)
], AiConsultation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', unsigned: true }),
    __metadata("design:type", Number)
], AiConsultation.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', unsigned: true, nullable: true }),
    __metadata("design:type", Object)
], AiConsultation.prototype, "petId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['symptom', 'follow_up'], default: 'symptom' }),
    __metadata("design:type", String)
], AiConsultation.prototype, "consultationType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', unsigned: true, nullable: true }),
    __metadata("design:type", Object)
], AiConsultation.prototype, "parentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 2000 }),
    __metadata("design:type", String)
], AiConsultation.prototype, "queryText", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json' }),
    __metadata("design:type", Object)
], AiConsultation.prototype, "response", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], AiConsultation.prototype, "relatedArticleIds", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['low', 'medium', 'high', 'emergency'], nullable: true }),
    __metadata("design:type", Object)
], AiConsultation.prototype, "urgencyLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', unsigned: true, nullable: true }),
    __metadata("design:type", Object)
], AiConsultation.prototype, "tokensUsed", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 64, nullable: true }),
    __metadata("design:type", Object)
], AiConsultation.prototype, "queryHash", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ precision: 3 }),
    __metadata("design:type", Date)
], AiConsultation.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.consultations, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], AiConsultation.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => pet_entity_1.Pet, { onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'pet_id' }),
    __metadata("design:type", Object)
], AiConsultation.prototype, "pet", void 0);
exports.AiConsultation = AiConsultation = __decorate([
    (0, typeorm_1.Entity)('ai_consultations')
], AiConsultation);
//# sourceMappingURL=ai-consultation.entity.js.map