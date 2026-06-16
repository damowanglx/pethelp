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
exports.KnowledgeService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const knowledge_article_entity_1 = require("./entities/knowledge-article.entity");
const knowledge_category_entity_1 = require("./entities/knowledge-category.entity");
let KnowledgeService = class KnowledgeService {
    constructor(articleRepo, categoryRepo) {
        this.articleRepo = articleRepo;
        this.categoryRepo = categoryRepo;
    }
    async getCategories() {
        return this.categoryRepo.find({
            where: { isActive: true },
            order: { sortOrder: 'ASC' },
        });
    }
    async searchArticles(keyword, page = 1, limit = 20) {
        const [items, total] = await this.articleRepo
            .createQueryBuilder('a')
            .where('MATCH(a.title, a.content) AGAINST (:kw IN NATURAL LANGUAGE MODE)', { kw: keyword })
            .andWhere('a.isPublished = 1')
            .orderBy('a.publishedAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
        return { items, total, page, limit };
    }
};
exports.KnowledgeService = KnowledgeService;
exports.KnowledgeService = KnowledgeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(knowledge_article_entity_1.KnowledgeArticle)),
    __param(1, (0, typeorm_1.InjectRepository)(knowledge_category_entity_1.KnowledgeCategory)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], KnowledgeService);
//# sourceMappingURL=knowledge.service.js.map