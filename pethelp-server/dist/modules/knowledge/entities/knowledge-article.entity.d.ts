import { KnowledgeCategory } from './knowledge-category.entity';
export declare class KnowledgeArticle {
    id: number;
    categoryId: number;
    title: string;
    summary: string | null;
    coverUrl: string | null;
    content: string;
    tags: string | null;
    sourceType: string;
    sourceAuthor: string | null;
    viewCount: number;
    likeCount: number;
    shareCount: number;
    isPublished: boolean;
    publishedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    category: KnowledgeCategory;
}
