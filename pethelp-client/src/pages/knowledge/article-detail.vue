<template>
  <view class="article-detail">
    <view v-if="article">
      <text class="article-title">{{ article.title }}</text>
      <view class="article-meta">
        <text class="meta-item">{{ article.sourceAuthor || 'PetHelp' }}</text>
        <text class="meta-item">{{ article.publishedAt?.split('T')[0] }}</text>
        <text class="meta-item">👀 {{ article.viewCount }}</text>
      </view>
      <view class="article-content">
        <rich-text :nodes="article.content" />
      </view>
      <view class="article-footer">
        <view class="action-btn" @click="toggleLike">
          ❤️ {{ article.likeCount }}
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { api } from '@/api/request';

interface Article { id: number; title: string; content: string; summary: string; tags: string; sourceAuthor: string; viewCount: number; likeCount: number; publishedAt: string }
const article = ref<Article | null>(null);

onLoad((options: Record<string, string>) => {
  if (options?.id) fetchArticle(Number(options.id));
});

async function fetchArticle(id: number) {
  const res = await api.get<Article>(`/knowledge/articles/${id}`);
  if (res.success && res.data) article.value = res.data;
}

async function toggleLike() {
  if (!article.value) return;
  await api.post(`/knowledge/articles/${article.value.id}/like`);
  article.value.likeCount++;
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
.article-detail { padding: $spacing-md; background: $bg-white; min-height: 100vh; }
.article-title { font-size: $font-xl; font-weight: 700; display: block; margin-bottom: $spacing-md; }
.article-meta { display: flex; gap: $spacing-md; margin-bottom: $spacing-lg; }
.meta-item { font-size: $font-xs; color: $text-muted; }
.article-content { font-size: $font-md; line-height: 1.8; }
.article-footer { display: flex; justify-content: center; padding: $spacing-lg 0; }
.action-btn { padding: $spacing-sm $spacing-lg; background: $bg-primary; border-radius: 40rpx; font-size: $font-sm; }
</style>
