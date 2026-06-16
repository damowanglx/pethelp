<template>
  <view class="walking-complete">
    <view class="complete-header">
      <text class="complete-icon">🎉</text>
      <text class="complete-title">遛狗完成!</text>
    </view>

    <view class="stats-card">
      <view class="stat-item">
        <text class="stat-value">{{ formatDistance(trailDistance) }}</text>
        <text class="stat-label">总距离</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ formatDuration(trailDuration) }}</text>
        <text class="stat-label">总时长</text>
      </view>
    </view>

    <!-- Mini trail map replay -->
    <view class="replay-section">
      <text class="section-title">🗺️ 遛狗轨迹</text>
      <map class="trail-map" :latitude="centerLat" :longitude="centerLng" :polyline="polyline" :scale="15" />
    </view>

    <view class="actions">
      <button class="btn-primary" @click="goReview">去评价 ⭐</button>
      <button class="btn-secondary" @click="goHome">返回首页</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { walkingApi } from '@/api/walking';
import { formatDistance, formatDuration } from '@/utils/geo';

const matchId = ref(0);
const trailDistance = ref(0);
const trailDuration = ref(0);
const coordinates = ref<Array<{ lat: number; lng: number }>>([]);
const centerLat = ref(39.9042);
const centerLng = ref(116.4074);
const polyline = ref<Array<{ points: Array<{ latitude: number; longitude: number }>; color: string; width: number }>>([]);

onLoad((options: Record<string, string>) => {
  if (options?.matchId) {
    matchId.value = Number(options.matchId);
    fetchTrail();
  }
});

async function fetchTrail() {
  try {
    const res = await walkingApi.getById(matchId.value);
    if (res.success && res.data) {
      trailDistance.value = (res.data as unknown as Record<string, number>).trackDistanceM || 0;
      trailDuration.value = (res.data as unknown as Record<string, number>).trackDurationS || 0;
    }
    // Also try trail endpoint
    const trailRes = await walkingApi.getById(matchId.value);
  } catch { /* trail may be empty */ }
}

function goReview() { uni.navigateTo({ url: `/pages/reviews/create?matchId=${matchId.value}` }); }
function goHome() { uni.reLaunch({ url: '/pages/index/index' }); }
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
.walking-complete { padding: $spacing-xl $spacing-md; }
.complete-header { text-align: center; margin-bottom: $spacing-xl; }
.complete-icon { font-size: 96rpx; display: block; }
.complete-title { font-size: $font-xl; font-weight: 700; margin-top: $spacing-sm; display: block; }
.stats-card { display: flex; justify-content: space-around; background: $bg-white; border-radius: $border-radius-lg; padding: $spacing-lg; margin-bottom: $spacing-lg; }
.stat-item { text-align: center; }
.stat-value { font-size: $font-xl; font-weight: 700; color: $primary; display: block; }
.stat-label { font-size: $font-sm; color: $text-muted; }
.replay-section { margin-bottom: $spacing-lg; }
.section-title { font-size: $font-md; font-weight: 600; margin-bottom: $spacing-sm; display: block; }
.trail-map { width: 100%; height: 400rpx; border-radius: $border-radius; }
.actions { display: flex; flex-direction: column; gap: $spacing-sm; }
.btn-primary { width: 100%; padding: $spacing-md; background: $primary; color: white; border-radius: $border-radius; font-size: $font-md; }
.btn-secondary { width: 100%; padding: $spacing-md; background: $bg-primary; color: $text-secondary; border-radius: $border-radius; font-size: $font-md; }
</style>
