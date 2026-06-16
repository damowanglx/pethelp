import { Repository } from 'typeorm';
import { KnowledgeArticle } from './entities/knowledge-article.entity';
import { KnowledgeCategory } from './entities/knowledge-category.entity';
export declare class KnowledgeService {
    private articleRepo;
    private categoryRepo;
    constructor(articleRepo: Repository<KnowledgeArticle>, categoryRepo: Repository<KnowledgeCategory>);
    getCategories(): Promise<KnowledgeCategory[]>;
    searchArticles(keyword: string, page?: number, limit?: number): Promise<{
        items: KnowledgeArticle[];
        total: number;
        page: number;
        limit: number;
    }>;
}
