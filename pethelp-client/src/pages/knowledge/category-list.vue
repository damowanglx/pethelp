<template>
  <view class="category-page">
    <view class="search-bar">
      <input v-model="keyword" class="search-input" placeholder="搜索疾病、品种、用药..." @confirm="doSearch" />
    </view>
    <view v-if="categories.length" class="cat-grid">
      <view v-for="cat in categories" :key="cat.id" class="cat-card" @click="viewCategory(cat.id, cat.name)">
        <text class="cat-icon">{{ cat.icon || '📋' }}</text>
        <text class="cat-name">{{ cat.name }}</text>
        <text class="cat-arrow">›</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '@/api/request';
import { useKnowledgeStore } from '@/stores/knowledge';

const store = useKnowledgeStore();
const categories = ref<Array<{ id: number; name: string; icon: string; children?: Array<unknown> }>>([]);
const keyword = ref('');

async function fetchCategories() {
  const res = await api.get('/knowledge/categories');
  if (res.success) categories.value = res.data as Array<{ id: number; name: string; icon: string }> || [];
}

function viewCategory(id: number, _name: string) {
  uni.navigateTo({ url: `/pages/knowledge/article-list?categoryId=${id}` });
}

function doSearch() {
  if (keyword.value.trim()) {
    uni.navigateTo({ url: `/pages/knowledge/article-list?keyword=${encodeURIComponent(keyword.value.trim())}` });
  }
}

onMounted(() => fetchCategories());
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
.category-page { padding: $spacing-md; }
.search-bar { margin-bottom: $spacing-md; }
.search-input { width: 100%; padding: $spacing-sm $spacing-md; background: $bg-white; border-radius: 40rpx; font-size: $font-md; }
.cat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: $spacing-sm; }
.cat-card { background: $bg-white; border-radius: $border-radius-lg; padding: $spacing-lg; display: flex; flex-direction: column; align-items: center; }
.cat-icon { font-size: 48rpx; }
.cat-name { font-size: $font-sm; font-weight: 500; margin-top: $spacing-xs; }
.cat-arrow { display: none; }
</style>
