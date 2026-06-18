<template>
  <view class="article-list">
    <view v-if="loading" class="empty"><text>加载中...</text></view>
    <view v-for="article in articles" :key="article.id" class="article-card" @click="viewDetail(article.id)">
      <text class="article-title">{{ article.title }}</text>
      <text class="article-summary" v-if="article.summary">{{ article.summary }}</text>
      <view class="article-meta">
        <text class="article-tags" v-if="article.tags">{{ article.tags }}</text>
        <text class="article-views">👀 {{ article.viewCount }}</text>
        <text class="article-likes">❤️ {{ article.likeCount }}</text>
      </view>
    </view>
    <view v-if="!loading && articles.length === 0" class="empty"><text>暂无文章</text></view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { api } from '@/api/request';

const articles = ref<Array<{ id: number; title: string; summary: string; tags: string; viewCount: number; likeCount: number }>>([]);
const loading = ref(true);
let catId: number | undefined;
let keyword: string | undefined;

onLoad((options: Record<string, string>) => {
  catId = options?.categoryId ? Number(options.categoryId) : undefined;
  keyword = options?.keyword ? decodeURIComponent(options.keyword) : undefined;
  fetchArticles();
});

async function fetchArticles() {
  loading.value = true;
  let res;
  if (keyword) {
    res = await api.get(`/knowledge/search?keyword=${encodeURIComponent(keyword)}`);
  } else if (catId) {
    res = await api.get(`/knowledge/articles?categoryId=${catId}`);
    // If parent category has no articles, fall back to all
    if (!res.data || !(res.data as { items: unknown[] }).items?.length) {
      res = await api.get('/knowledge/articles');
    }
  } else {
    res = await api.get('/knowledge/articles');
  }
  if (res.success) {
    const data = res.data as { items: Array<Record<string, unknown>> };
    articles.value = (data?.items || []) as Array<{ id: number; title: string; summary: string; tags: string; viewCount: number; likeCount: number }>;
  }
  loading.value = false;
}

function viewDetail(id: number) {
  uni.navigateTo({ url: `/pages/knowledge/article-detail?id=${id}` });
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
.article-list { padding: $spacing-md; }
.article-card { background: $bg-white; border-radius: $border-radius; padding: $spacing-md; margin-bottom: $spacing-sm; }
.article-title { font-size: $font-md; font-weight: 600; display: block; }
.article-summary { font-size: $font-sm; color: $text-secondary; margin-top: $spacing-xs; display: block; }
.article-meta { display: flex; gap: $spacing-md; margin-top: $spacing-sm; }
.article-tags { font-size: $font-xs; color: $primary; }
.article-views, .article-likes { font-size: $font-xs; color: $text-muted; }
.empty { text-align: center; padding: $spacing-xl; color: $text-muted; }
</style>
