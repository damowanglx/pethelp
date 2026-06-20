<template>
  <view class="favorites">
    <view v-if="favArticles.length === 0 && !loading" class="empty">
      <text class="empty-icon">⭐</text>
      <text>还没有收藏文章</text>
      <text class="empty-sub">去知识库发现感兴趣的内容吧</text>
    </view>
    <view v-for="a in favArticles" :key="a.id" class="fav-item" @click="viewArticle(a.id)">
      <view class="fav-left">
        <text class="fav-title">{{ a.title }}</text>
        <text class="fav-tags">{{ a.tags }}</text>
      </view>
      <text class="fav-del" @click.stop="removeFav(a.id)">✕</text>
    </view>
    <button v-if="favArticles.length" class="clear-btn" @click="clearAll">清空收藏</button>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '@/api/request';

const favArticles = ref<Array<{ id: number; title: string; tags: string }>>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const ids: number[] = uni.getStorageSync('pethelp_favs') || [];
    if (ids.length) {
      // Batch fetch article titles
      const results = await Promise.allSettled(
        ids.map((id) => api.get<{ title: string; tags: string }>(`/knowledge/articles/${id}`)),
      );
      favArticles.value = results
        .filter((r) => r.status === 'fulfilled' && r.value.success)
        .map((r) => {
          const d = (r as PromiseFulfilledResult<{ data?: { title?: string; tags?: string } }>).value.data || {};
          return { id: (r as PromiseFulfilledResult<{ data?: { id?: number } }>).value.data?.id || 0, title: d.title || '', tags: d.tags || '' };
        });
    }
  } catch { /* */ }
  loading.value = false;
});

function removeFav(id: number) {
  const ids: number[] = uni.getStorageSync('pethelp_favs') || [];
  uni.setStorageSync('pethelp_favs', ids.filter((i) => i !== id));
  favArticles.value = favArticles.value.filter((a) => a.id !== id);
}

function clearAll() {
  uni.showModal({
    title: '确认清空',
    content: '确定要清空所有收藏吗？',
    success: (r) => {
      if (r.confirm) {
        uni.setStorageSync('pethelp_favs', []);
        favArticles.value = [];
      }
    },
  });
}

function viewArticle(id: number) {
  uni.navigateTo({ url: `/pages/knowledge/article-detail?id=${id}` });
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
.favorites { padding: $spacing-md; }
.fav-item { display: flex; align-items: center; background: $bg-white; padding: $spacing-md; border-radius: $border-radius; margin-bottom: $spacing-sm; }
.fav-left { flex: 1; }
.fav-title { font-size: $font-md; font-weight: 500; display: block; }
.fav-tags { font-size: $font-xs; color: $text-muted; }
.fav-del { font-size: $font-md; color: $text-muted; padding: $spacing-sm; }
.clear-btn { margin-top: $spacing-lg; background: $bg-primary; color: $danger; font-size: $font-sm; }
.empty { text-align: center; padding: $spacing-xl; }
.empty-icon { font-size: 64rpx; display: block; margin-bottom: $spacing-md; }
.empty-sub { font-size: $font-xs; color: $text-muted; display: block; margin-top: $spacing-xs; }
</style>
