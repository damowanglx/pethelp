import { defineStore } from 'pinia';
import { ref } from 'vue';

interface KnowledgeCategory {
  id: number;
  name: string;
  icon: string | null;
  parentId: number | null;
  children?: KnowledgeCategory[];
}

interface KnowledgeArticle {
  id: number;
  categoryId: number;
  title: string;
  summary: string | null;
  coverUrl: string | null;
  tags: string | null;
  viewCount: number;
  likeCount: number;
  publishedAt: string | null;
}

export const useKnowledgeStore = defineStore('knowledge', () => {
  const categories = ref<KnowledgeCategory[]>([]);
  const articles = ref<KnowledgeArticle[]>([]);
  const currentArticle = ref<KnowledgeArticle | null>(null);

  return { categories, articles, currentArticle };
});
