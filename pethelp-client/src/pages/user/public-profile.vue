<template>
  <view class="public-profile">
    <view class="user-card">
      <text class="user-avatar">🐶</text>
      <text class="user-name">{{ profile?.nickname || '用户' }}</text>
      <view class="score-row">
        <text class="credit-score">信用分 {{ profile?.creditScore || 0 }}</text>
        <text class="rating">⭐ {{ profile?.ratingAvg || 0 }}</text>
      </view>
      <text class="walks-done">完成 {{ profile?.completedWalks || 0 }} 次遛狗</text>
    </view>

    <view class="actions">
      <button class="btn-primary" @click="viewCredit">查看信用档案</button>
      <button class="btn-secondary" @click="viewBadges">查看徽章</button>
    </view>

    <view class="reviews-section">
      <text class="section-title">最近评价</text>
      <view v-for="r in reviews" :key="r.id" class="review-item">
        <text class="review-rating">⭐ {{ r.rating }}</text>
        <text class="review-comment" v-if="r.comment">{{ r.comment }}</text>
        <view class="review-tags" v-if="r.tags?.length">
          <text v-for="t in r.tags" :key="t" class="review-tag">{{ t }}</text>
        </view>
      </view>
      <text v-if="reviews.length === 0" class="empty">暂无评价</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { api } from '@/api/request';

const profile = ref<Record<string, unknown> | null>(null);
const reviews = ref<Array<{ id: number; rating: number; comment: string; tags: string[] }>>([]);

onLoad((options: Record<string, string>) => {
  if (options?.userId) {
    fetchProfile(Number(options.userId));
  }
});

async function fetchProfile(userId: number) {
  try {
    const [userRes, reviewRes] = await Promise.all([
      api.get(`/users/${userId}`),
      api.get(`/reviews/user/${userId}`),
    ]);
    if (userRes.success) profile.value = userRes.data as Record<string, unknown>;
    if (reviewRes.success) reviews.value = (reviewRes.data as Array<unknown> || []) as Array<{ id: number; rating: number; comment: string; tags: string[] }>;
  } catch { /* */ }
}

function viewCredit() {
  uni.navigateTo({ url: `/pages/trust/credit-showcase?userId=${profile.value?.id}` });
}

function viewBadges() {
  uni.navigateTo({ url: `/pages/trust/badge-wall?userId=${profile.value?.id}` });
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
.public-profile { padding: $spacing-md; }
.user-card { background: $bg-white; border-radius: $border-radius-lg; padding: $spacing-xl; text-align: center; margin-bottom: $spacing-md; }
.user-avatar { font-size: 96rpx; display: block; }
.user-name { font-size: $font-xl; font-weight: 600; display: block; margin: $spacing-sm 0; }
.score-row { display: flex; justify-content: center; gap: $spacing-lg; }
.credit-score { color: $primary; font-weight: 600; }
.rating { color: $warning; }
.walks-done { font-size: $font-sm; color: $text-muted; margin-top: $spacing-xs; }
.actions { display: flex; gap: $spacing-sm; margin-bottom: $spacing-lg; }
.btn-primary { flex: 1; padding: $spacing-sm; background: $primary; color: white; border-radius: $border-radius; font-size: $font-sm; }
.btn-secondary { flex: 1; padding: $spacing-sm; background: $bg-primary; color: $text-secondary; border-radius: $border-radius; font-size: $font-sm; }
.section-title { font-size: $font-md; font-weight: 600; margin-bottom: $spacing-sm; display: block; }
.review-item { background: $bg-white; padding: $spacing-md; border-radius: $border-radius; margin-bottom: $spacing-sm; }
.review-rating { font-size: $font-sm; }
.review-comment { font-size: $font-sm; display: block; margin-top: $spacing-xs; }
.review-tags { display: flex; gap: $spacing-xs; margin-top: $spacing-xs; flex-wrap: wrap; }
.review-tag { font-size: $font-xs; padding: 2rpx 12rpx; background: rgba(255,107,53,0.1); color: $primary; border-radius: 20rpx; }
.empty { text-align: center; padding: $spacing-md; color: $text-muted; font-size: $font-sm; }
</style>
