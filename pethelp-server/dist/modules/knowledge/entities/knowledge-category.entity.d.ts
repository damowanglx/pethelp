import { KnowledgeArticle } from './knowledge-article.entity';
export declare class KnowledgeCategory {
    id: number;
    name: string;
    icon: string | null;
    parentId: number | null;
    sortOrder: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    parent: KnowledgeCategory | null;
    children: KnowledgeCategory[];
    articles: KnowledgeArticle[];
}
