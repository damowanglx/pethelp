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
exports.KnowledgeCategory = void 0;
const typeorm_1 = require("typeorm");
const knowledge_article_entity_1 = require("./knowledge-article.entity");
let KnowledgeCategory = class KnowledgeCategory {
};
exports.KnowledgeCategory = KnowledgeCategory;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint', unsigned: true }),
    __metadata("design:type", Number)
], KnowledgeCategory.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 64 }),
    __metadata("design:type", String)
], KnowledgeCategory.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 128, nullable: true }),
    __metadata("design:type", Object)
], KnowledgeCategory.prototype, "icon", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', unsigned: true, nullable: true }),
    __metadata("design:type", Object)
], KnowledgeCategory.prototype, "parentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', unsigned: true, default: 0 }),
    __metadata("design:type", Number)
], KnowledgeCategory.prototype, "sortOrder", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'tinyint', default: 1 }),
    __metadata("design:type", Boolean)
], KnowledgeCategory.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], KnowledgeCategory.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], KnowledgeCategory.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => KnowledgeCategory, { onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'parent_id' }),
    __metadata("design:type", Object)
], KnowledgeCategory.prototype, "parent", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => KnowledgeCategory, (kc) => kc.parent),
    __metadata("design:type", Array)
], KnowledgeCategory.prototype, "children", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => knowledge_article_entity_1.KnowledgeArticle, (ka) => ka.category),
    __metadata("design:type", Array)
], KnowledgeCategory.prototype, "articles", void 0);
exports.KnowledgeCategory = KnowledgeCategory = __decorate([
    (0, typeorm_1.Entity)('knowledge_categories')
], KnowledgeCategory);
//# sourceMappingURL=knowledge-category.entity.js.map