<template>
  <view class="credit-page">
    <view v-if="data" class="score-section">
      <view class="score-ring">
        <text class="score-number">{{ data.score }}</text>
        <text class="score-label">信用分</text>
      </view>
      <view class="breakdown">
        <view class="break-item"><text>🌟 评分 (50%)</text><text>{{ data.breakdown?.rating?.toFixed(1) || 0 }}</text></view>
        <view class="break-item"><text>✅ 完成率 (30%)</text><text>{{ data.breakdown?.completion?.toFixed(1) || 0 }}</text></view>
        <view class="break-item"><text>📚 经验 (20%)</text><text>{{ data.breakdown?.experience?.toFixed(1) || 0 }}</text></view>
      </view>
    </view>
    <view class="stats">
      <view class="stat"><text class="stat-num">{{ stats.completedWalks }}</text><text class="stat-label">完成遛狗</text></view>
      <view class="stat"><text class="stat-num">{{ stats.ratingAvg }}</text><text class="stat-label">平均评分</text></view>
      <view class="stat"><text class="stat-num">{{ (stats.completionRate * 100).toFixed(0) }}%</text><text class="stat-label">完成率</text></view>
    </view>
    <button class="btn-view-badges" @click="viewBadges">🏅 查看徽章</button>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { trustApi } from '@/api/trust';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
const data = ref<{ score: number; breakdown?: Record<string, number> } | null>(null);
const stats = ref({ completedWalks: 0, ratingAvg: 0, completionRate: 0, completionCount: 0 });

onLoad((options: Record<string, string>) => {
  const uid = options?.userId ? Number(options.userId) : userStore.profile?.id;
  if (uid) fetchScore(uid);
});

async function fetchScore(uid: number) {
  const res = await trustApi.getCreditScore(uid);
  if (res.success) {
    const d = res.data as Record<string, unknown>;
    data.value = { score: d.score as number, breakdown: d.breakdown as Record<string, number> };
    stats.value = d.stats as typeof stats.value;
  }
}

function viewBadges() {
  uni.navigateTo({ url: '/pages/trust/badge-wall' });
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
.credit-page { padding: $spacing-md; display: flex; flex-direction: column; align-items: center; }
.score-section { text-align: center; margin-bottom: $spacing-lg; }
.score-ring { width: 200rpx; height: 200rpx; border-radius: 50%; border: 8rpx solid $primary; display: flex; flex-direction: column; align-items: center; justify-content: center; margin: $spacing-lg auto; }
.score-number { font-size: 64rpx; font-weight: 700; color: $primary; }
.score-label { font-size: $font-sm; color: $text-muted; }
.breakdown { background: $bg-white; border-radius: $border-radius; padding: $spacing-md; width: 100%; max-width: 500rpx; }
.break-item { display: flex; justify-content: space-between; padding: $spacing-xs 0; font-size: $font-sm; }
.stats { display: flex; justify-content: space-around; width: 100%; background: $bg-white; border-radius: $border-radius-lg; padding: $spacing-lg; margin-bottom: $spacing-lg; }
.stat { text-align: center; }
.stat-num { font-size: $font-xl; font-weight: 700; color: $primary; display: block; }
.stat-label { font-size: $font-xs; color: $text-muted; }
.btn-view-badges { padding: $spacing-sm $spacing-lg; background: $primary; color: white; border-radius: 40rpx; }
</style>
