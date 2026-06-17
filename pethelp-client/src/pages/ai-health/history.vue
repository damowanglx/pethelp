<template>
  <view class="history-page">
    <view v-for="h in history" :key="h.id" class="history-item" @click="viewDetail(h.id)">
      <view class="item-header">
        <text class="item-query">{{ (h.queryText || '').slice(0, 50) }}...</text>
        <text class="item-urgency" :class="h.urgencyLevel">{{ urgencyLabel(h.urgencyLevel) }}</text>
      </view>
      <text class="item-date">{{ h.createdAt?.split('T')[0] }}</text>
    </view>
    <view v-if="history.length === 0" class="empty"><text>暂无问诊记录</text></view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { aiHealthApi } from '@/api/ai-health';

const history = ref<Array<{ id: number; queryText: string; urgencyLevel: string; createdAt: string }>>([]);

function urgencyLabel(level: string) {
  return { low: '低', medium: '中', high: '高', emergency: '急' }[level] || '?';
}

function viewDetail(_id: number) { /* TODO: expand detail */ }

onMounted(async () => {
  try {
    const res = await aiHealthApi.getHistory();
    if (res.success) {
      const data = res.data as { items: Array<Record<string, unknown>> };
      history.value = (data?.items || []) as Array<{ id: number; queryText: string; urgencyLevel: string; createdAt: string }>;
    }
  } catch { /* */ }
});
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
.history-page { padding: $spacing-md; }
.history-item { background: $bg-white; padding: $spacing-md; border-radius: $border-radius; margin-bottom: $spacing-sm; }
.item-header { display: flex; justify-content: space-between; align-items: center; }
.item-query { font-size: $font-sm; }
.item-urgency { font-size: $font-xs; padding: 2rpx 12rpx; border-radius: 20rpx; }
.item-urgency.low { background: #E8F5E9; color: $success; }
.item-urgency.medium { background: #FFF8E1; color: #F57F17; }
.item-urgency.high { background: #FFF3E0; color: #E65100; }
.item-urgency.emergency { background: #FFEBEE; color: $danger; }
.item-date { font-size: $font-xs; color: $text-muted; margin-top: $spacing-xs; display: block; }
.empty { text-align: center; padding: $spacing-xl; color: $text-muted; }
</style>
