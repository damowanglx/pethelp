import { KnowledgeService } from './knowledge.service';
export declare class KnowledgeController {
    private knowledgeService;
    constructor(knowledgeService: KnowledgeService);
    categories(): Promise<import("./entities/knowledge-category.entity").KnowledgeCategory[]>;
    search(keyword: string, page?: number, limit?: number): Promise<{
        items: import("./entities/knowledge-article.entity").KnowledgeArticle[];
        total: number;
        page: number;
        limit: number;
    }>;
}
