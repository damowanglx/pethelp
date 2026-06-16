<template>
  <view class="market">
    <view class="filter-bar">
      <view class="filter-item" @click="setFilter('date')">
        <text>日期</text>
      </view>
      <view class="filter-item" @click="setFilter('radius')">
        <text>{{ store.filters.radius }}km内</text>
      </view>
    </view>

    <scroll-view class="request-list" scroll-y>
      <view v-if="requests.length === 0" class="empty">
        <text>暂无遛狗请求</text>
      </view>
      <view v-for="req in requests" :key="req.id" class="request-card" @click="viewDetail(req.id)">
        <view class="card-header">
          <text class="pet-name">{{ req.pet?.name || '未知' }}</text>
          <text class="pet-breed">{{ req.pet?.breed || '' }}</text>
          <view class="status-badge" :class="req.status">{{ statusLabel(req.status) }}</view>
        </view>
        <view class="card-body">
          <text class="address">📍 {{ req.address }}</text>
          <text class="time">🕐 {{ req.walkDate }} {{ req.startTime }}-{{ req.endTime }}</text>
        </view>
        <view class="card-footer">
          <text class="reward">{{ req.rewardType === 'free' ? '免费互助' : `${req.rewardAmount}元` }}</text>
          <text class="apply-count">{{ req.applyCount }}人申请</text>
        </view>
      </view>
    </scroll-view>

    <view class="fab" @click="createRequest">+</view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useWalkingStore } from '@/stores/walking';

const store = useWalkingStore();
const requests = ref<Array<Record<string, unknown>>>([]);

const statusLabel = (s: string) => {
  const labels: Record<string, string> = { open: '待匹配', matched: '已匹配', in_progress: '进行中', completed: '已完成' };
  return labels[s] || s;
};

function setFilter(_type: string) { /* TODO: Phase 1 */ }
function viewDetail(_id: number) { uni.navigateTo({ url: `/pages/walking/request-detail?id=${_id}` }); }
function createRequest() { uni.navigateTo({ url: '/pages/walking/request-create' }); }
</script>

<style lang="scss" scoped>
.market { padding-bottom: 120rpx; }
.filter-bar { display: flex; padding: $spacing-sm $spacing-md; background: $bg-white; gap: $spacing-sm; }
.filter-item { padding: $spacing-xs $spacing-md; background: $bg-primary; border-radius: 20rpx; font-size: $font-sm; }
.request-list { padding: $spacing-sm $spacing-md; }
.request-card { background: $bg-white; border-radius: $border-radius; padding: $spacing-md; margin-bottom: $spacing-sm; box-shadow: $shadow-sm; }
.card-header { display: flex; align-items: center; gap: $spacing-sm; margin-bottom: $spacing-sm; }
.pet-name { font-size: $font-lg; font-weight: 600; }
.pet-breed { font-size: $font-sm; color: $text-secondary; }
.status-badge { margin-left: auto; font-size: $font-xs; padding: 4rpx 12rpx; border-radius: 8rpx; }
.status-badge.open { background: #E8F5E9; color: $success; }
.card-body { margin-bottom: $spacing-sm; }
.card-body text { display: block; font-size: $font-sm; color: $text-secondary; margin-top: 4rpx; }
.card-footer { display: flex; justify-content: space-between; font-size: $font-sm; }
.reward { color: $primary; font-weight: 600; }
.apply-count { color: $text-muted; }
.empty { text-align: center; padding: $spacing-xl; color: $text-muted; }
.fab { position: fixed; bottom: 160rpx; right: 40rpx; width: 96rpx; height: 96rpx; background: $primary; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 48rpx; box-shadow: $shadow-md; }
</style>
