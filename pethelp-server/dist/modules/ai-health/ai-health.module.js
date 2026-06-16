"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiHealthModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const ai_consultation_entity_1 = require("./entities/ai-consultation.entity");
const ai_daily_usage_entity_1 = require("./entities/ai-daily-usage.entity");
const ai_health_controller_1 = require("./ai-health.controller");
const ai_health_service_1 = require("./ai-health.service");
let AiHealthModule = class AiHealthModule {
};
exports.AiHealthModule = AiHealthModule;
exports.AiHealthModule = AiHealthModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([ai_consultation_entity_1.AiConsultation, ai_daily_usage_entity_1.AiDailyUsage])],
        controllers: [ai_health_controller_1.AiHealthController],
        providers: [ai_health_service_1.AiHealthService],
        exports: [ai_health_service_1.AiHealthService],
    })
], AiHealthModule);
//# sourceMappingURL=ai-health.module.js.map