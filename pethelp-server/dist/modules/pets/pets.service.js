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
exports.PetsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const pet_entity_1 = require("./entities/pet.entity");
let PetsService = class PetsService {
    constructor(petRepo) {
        this.petRepo = petRepo;
    }
    async findByUser(userId) {
        return this.petRepo.find({ where: { userId, isDisabled: false } });
    }
    async findById(id) {
        const pet = await this.petRepo.findOne({ where: { id, isDisabled: false } });
        if (!pet)
            throw new common_1.NotFoundException('Pet not found');
        return pet;
    }
    async create(userId, data) {
        const pet = this.petRepo.create({ ...data, userId });
        return this.petRepo.save(pet);
    }
    async update(id, data) {
        await this.petRepo.update(id, data);
        return this.findById(id);
    }
    async remove(id) {
        await this.petRepo.update(id, { isDisabled: true });
    }
};
exports.PetsService = PetsService;
exports.PetsService = PetsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(pet_entity_1.Pet)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PetsService);
//# sourceMappingURL=pets.service.js.map