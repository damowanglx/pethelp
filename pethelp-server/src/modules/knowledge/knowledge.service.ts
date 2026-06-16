import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KnowledgeArticle } from './entities/knowledge-article.entity';
import { KnowledgeCategory } from './entities/knowledge-category.entity';

@Injectable()
export class KnowledgeService {
  constructor(
    @InjectRepository(KnowledgeArticle)
    private articleRepo: Repository<KnowledgeArticle>,
    @InjectRepository(KnowledgeCategory)
    private categoryRepo: Repository<KnowledgeCategory>,
  ) {}

  async getCategories() {
    return this.categoryRepo.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC' },
    });
  }

  async searchArticles(keyword: string, page = 1, limit = 20) {
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
}
