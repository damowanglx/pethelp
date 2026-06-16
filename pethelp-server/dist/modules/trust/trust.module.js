"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrustModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const badge_definition_entity_1 = require("./entities/badge-definition.entity");
const user_badge_entity_1 = require("./entities/user-badge.entity");
const user_certification_entity_1 = require("./entities/user-certification.entity");
const user_deposit_entity_1 = require("./entities/user-deposit.entity");
const trust_controller_1 = require("./trust.controller");
const trust_service_1 = require("./trust.service");
let TrustModule = class TrustModule {
};
exports.TrustModule = TrustModule;
exports.TrustModule = TrustModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([badge_definition_entity_1.BadgeDefinition, user_badge_entity_1.UserBadge, user_certification_entity_1.UserCertification, user_deposit_entity_1.UserDeposit])],
        controllers: [trust_controller_1.TrustController],
        providers: [trust_service_1.TrustService],
        exports: [trust_service_1.TrustService],
    })
], TrustModule);
//# sourceMappingURL=trust.module.js.map