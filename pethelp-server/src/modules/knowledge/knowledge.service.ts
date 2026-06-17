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
    const categories = await this.categoryRepo.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC' },
    });
    return this.buildTree(categories);
  }

  async getArticles(page = 1, limit = 20, categoryId?: number) {
    const where: Record<string, unknown> = { isPublished: true };
    if (categoryId) where['categoryId'] = categoryId;

    const [items, total] = await this.articleRepo.findAndCount({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      where: where as any,
      select: ['id', 'categoryId', 'title', 'summary', 'coverUrl', 'tags', 'viewCount', 'likeCount', 'publishedAt'],
      order: { publishedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, limit };
  }

  async getArticle(id: number) {
    const article = await this.articleRepo.findOne({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      where: { id, isPublished: true } as any,
    });
    if (!article) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.articleRepo.update(id, { viewCount: () => 'view_count + 1' } as any);
    return article;
  }

  async searchArticles(keyword: string, page = 1, limit = 20) {
    // Try FULLTEXT first, fall back to LIKE if empty or error
    let items: KnowledgeArticle[] = [];
    let total = 0;

    try {
      const result = await this.articleRepo
        .createQueryBuilder('a')
        .select(['a.id', 'a.categoryId', 'a.title', 'a.summary', 'a.coverUrl', 'a.tags', 'a.viewCount', 'a.likeCount', 'a.publishedAt'])
        .where('MATCH(a.title, a.content) AGAINST (:kw IN NATURAL LANGUAGE MODE)', { kw: keyword })
        .andWhere('a.isPublished = 1')
        .orderBy('a.viewCount', 'DESC')
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();
      items = result[0];
      total = result[1];
    } catch {
      // FULLTEXT not available, will use LIKE fallback below
    }

    // LIKE fallback if FULLTEXT returned nothing or failed
    if (!total) {
      const allPublished = await this.articleRepo.find({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        where: { isPublished: true } as any,
        select: ['id', 'categoryId', 'title', 'summary', 'coverUrl', 'tags', 'viewCount', 'likeCount', 'publishedAt'],
      });
      const kw = keyword.toLowerCase();
      const filtered = allPublished.filter(
        (a) =>
          (a.title && a.title.toLowerCase().includes(kw)) ||
          (a.tags && a.tags.toLowerCase().includes(kw)) ||
          (a.summary && a.summary.toLowerCase().includes(kw)),
      );
      total = filtered.length;
      items = filtered.slice((page - 1) * limit, page * limit);
    }

    return { items, total, page, limit };
  }

  async getHotArticles(limit = 5) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.articleRepo.find({ where: { isPublished: true } as any, order: { viewCount: 'DESC' }, take: limit });
  }

  async toggleLike(id: number) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.articleRepo.update(id, { likeCount: () => 'like_count + 1' } as any);
    return { success: true };
  }

  private buildTree(categories: KnowledgeCategory[], parentId: number | null = null): Record<string, unknown>[] {
    return categories
      .filter((c) => (c.parentId ?? null) === parentId)
      .map((c) => ({
        id: c.id,
        name: c.name,
        icon: c.icon,
        parentId: c.parentId,
        sortOrder: c.sortOrder,
        children: this.buildTree(categories, c.id),
      }));
  }
}
