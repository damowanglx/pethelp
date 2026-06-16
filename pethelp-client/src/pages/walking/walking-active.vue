<template>
  <view class="walking-active">
    <!-- Map (full screen background) -->
    <map class="walk-map" :latitude="currentLat" :longitude="currentLng" :polyline="polyline" :markers="markers" :scale="16" show-location />

    <!-- Status bar overlay -->
    <view class="status-overlay">
      <view class="status-card">
        <view class="timer-row">
          <text class="timer">{{ formatDuration(walkDuration) }}</text>
          <text class="distance">{{ formatDistance(walkDistance) }}</text>
        </view>
        <view class="detail-row">
          <text class="helper-name">{{ helperName }} 正在遛狗中</text>
        </view>
        <!-- Only helper sees the stop button -->
        <button v-if="isHelper" class="stop-btn" @click="stopTracking">结束遛狗</button>
        <view v-else class="tracking-hint">🛰️ 实时追踪中...</view>
      </view>
    </view>

    <!-- Back button -->
    <view class="back-btn" @click="goBack"><text>‹</text></view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useUserStore } from '@/stores/user';
import { walkingApi } from '@/api/walking';
import { formatDistance, formatDuration } from '@/utils/geo';

const userStore = useUserStore();
const matchId = ref(0);
const currentLat = ref(39.9042);
const currentLng = ref(116.4074);
const walkDuration = ref(0);
const walkDistance = ref(0);
const helperName = ref('');
const isHelper = ref(false);
const isTracking = ref(false);
let locationWatcher: number | null = null;
let durationTimer: ReturnType<typeof setInterval> | null = null;
const trailPoints: Array<{ lat: number; lng: number }> = [];
const polyline = ref<Array<{ points: Array<{ latitude: number; longitude: number }>; color: string; width: number }>>([{ points: [], color: '#FF6B35', width: 4 }]);
const markers = ref<Array<{ id: number; latitude: number; longitude: number; iconPath: string; width: number; height: number }>>([]);

onLoad((options: Record<string, string>) => {
  if (options?.matchId) {
    matchId.value = Number(options.matchId);
    fetchActiveWalk();
  }
});

async function fetchActiveWalk() {
  try {
    const res = await walkingApi.getById(matchId.value);
    // const activeWs = connectWalkingWs();
    // Phase: WebSocket connection handled in useWalkingTracker composable
    uni.showLoading({ title: '连接中...' });
    setTimeout(() => uni.hideLoading(), 1000);
  } catch { /* fallback */ }
}

function startTracking() {
  isTracking.value = true;
  // GPS location watching — uses WeChat getLocation
  uni.startLocationUpdate({
    success: () => {
      uni.onLocationChange((res) => {
        currentLat.value = res.latitude;
        currentLng.value = res.longitude;
        trailPoints.push({ lat: res.latitude, lng: res.longitude });
        polyline.value[0].points.push({ latitude: res.latitude, longitude: res.longitude });
        markers.value = [{ id: 1, latitude: res.latitude, longitude: res.longitude, iconPath: '/static/pet-marker.png', width: 30, height: 30 }];
      });
    },
    fail: () => uni.showToast({ title: '定位失败，请授权位置权限', icon: 'none' }),
  });

  durationTimer = setInterval(() => { walkDuration.value++; }, 1000);
}

function stopTracking() {
  uni.showModal({
    title: '确认结束?',
    content: `遛狗距离: ${formatDistance(walkDistance)}，时Ⓜ: ${formatDuration(walkDuration)}`,
    success: async (res) => {
      if (res.confirm) {
        isTracking.value = false;
        uni.stopLocationUpdate();
        if (durationTimer) clearInterval(durationTimer);
        await walkingApi.completeWalk(matchId.value, walkDistance, walkDuration);
        uni.redirectTo({ url: `/pages/walking/walking-complete?matchId=${matchId.value}` });
      }
    },
  });
}

function goBack() {
  uni.navigateBack();
}

onUnmounted(() => {
  if (durationTimer) clearInterval(durationTimer);
});
</script>

<style lang="scss" scoped>
.walking-active { width: 100vw; height: 100vh; position: relative; }
.walk-map { width: 100%; height: 100%; }
.status-overlay { position: absolute; bottom: 40rpx; left: 0; right: 0; padding: 0 $spacing-md; }
.status-card { background: rgba(255,255,255,0.95); border-radius: $border-radius-lg; padding: $spacing-md; box-shadow: $shadow-md; }
.timer-row { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: $spacing-xs; }
.timer { font-size: 56rpx; font-weight: 700; color: $primary; }
.distance { font-size: $font-lg; color: $text-secondary; }
.helper-name { font-size: $font-sm; color: $text-muted; }
.detail-row { margin-bottom: $spacing-sm; }
.stop-btn { width: 100%; padding: $spacing-sm; background: $danger; color: white; border-radius: $border-radius; margin-top: $spacing-sm; }
.tracking-hint { font-size: $font-sm; color: $success; text-align: center; margin-top: $spacing-sm; }
.back-btn { position: absolute; top: 80rpx; left: $spacing-md; width: 64rpx; height: 64rpx; background: rgba(255,255,255,0.9); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 44rpx; color: $text-primary; box-shadow: $shadow-sm; }
</style>
