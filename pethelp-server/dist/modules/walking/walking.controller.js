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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalkingController = void 0;
const common_1 = require("@nestjs/common");
const walking_service_1 = require("./walking.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let WalkingController = class WalkingController {
    constructor(walkingService) {
        this.walkingService = walkingService;
    }
    async nearby(lat, lng, radius = 5, page = 1, limit = 20) {
        return this.walkingService.findNearby(lat, lng, radius, page, limit);
    }
};
exports.WalkingController = WalkingController;
__decorate([
    (0, common_1.Get)('requests/nearby'),
    __param(0, (0, common_1.Query)('lat')),
    __param(1, (0, common_1.Query)('lng')),
    __param(2, (0, common_1.Query)('radius')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], WalkingController.prototype, "nearby", null);
exports.WalkingController = WalkingController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('walking'),
    __metadata("design:paramtypes", [walking_service_1.WalkingService])
], WalkingController);
//# sourceMappingURL=walking.controller.js.map