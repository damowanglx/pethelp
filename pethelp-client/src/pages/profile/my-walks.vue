<template>
  <view class="my-walks">
    <view class="tab-bar">
      <view class="tab" :class="{ active: tab === 0 }" @click="tab = 0; fetchData()">我发布的</view>
      <view class="tab" :class="{ active: tab === 1 }" @click="tab = 1; fetchData()">我申请的</view>
    </view>

    <view v-if="tab === 0">
      <view v-for="r in requests" :key="r.id" class="walk-card" @click="viewRequest(r.id)">
        <text class="pet-name">{{ r.pet?.name || '未知' }}</text>
        <text class="walk-info">{{ r.walkDate }} {{ r.startTime }}-{{ r.endTime }}</text>
        <view class="status-badge" :class="r.status">{{ statusLabel(r.status) }}</view>
      </view>
    </view>

    <view v-if="tab === 1">
      <view v-for="m in matches" :key="m.id" class="walk-card" @click="viewRequest(m.requestId)">
        <text class="pet-name">{{ m.request?.pet?.name || '未知' }}</text>
        <text class="walk-info">{{ m.request?.walkDate }}</text>
        <view class="status-badge" :class="m.status">{{ statusLabel(m.status) }}</view>
      </view>
    </view>

    <view v-if="empty" class="empty"><text>暂无记录</text></view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { walkingApi } from '@/api/walking';

const tab = ref(0);
const requests = ref<Array<Record<string, unknown>>>([]);
const matches = ref<Array<Record<string, unknown>>>([]);
const empty = ref(false);

function statusLabel(s: string) {
  return { open: '待匹配', matched: '已匹配', in_progress: '进行中', completed: '已完成', cancelled: '已取消' }[s] || s;
}

function viewRequest(id: unknown) {
  uni.navigateTo({ url: `/pages/walking/request-detail?id=${id}` });
}

async function fetchData() {
  try {
    if (tab.value === 0) {
      const res = await walkingApi.getMyPosts();
      requests.value = (res.data || []) as Array<Record<string, unknown>>;
      empty.value = requests.value.length === 0;
    } else {
      const res = await walkingApi.getMyApplications();
      matches.value = (res.data || []) as Array<Record<string, unknown>>;
      empty.value = matches.value.length === 0;
    }
  } catch { empty.value = true; }
}

onMounted(() => fetchData());
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
.my-walks { padding-bottom: $spacing-xl; }
.tab-bar { display: flex; background: $bg-white; }
.tab { flex: 1; text-align: center; padding: $spacing-md; font-size: $font-md; border-bottom: 2rpx solid transparent; }
.tab.active { color: $primary; border-bottom-color: $primary; font-weight: 600; }
.walk-card { background: $bg-white; padding: $spacing-md; margin: $spacing-sm $spacing-md; border-radius: $border-radius; display: flex; justify-content: space-between; align-items: center; }
.pet-name { font-weight: 600; }
.walk-info { font-size: $font-sm; color: $text-muted; }
.status-badge { padding: $spacing-xs $spacing-sm; border-radius: 20rpx; font-size: $font-xs; }
.status-badge.open { background: #E8F5E9; color: $success; }
.status-badge.completed { background: #E8F5E9; color: $success; }
.status-badge.matched { background: #E3F2FD; color: $info; }
.status-badge.cancelled { background: #FFEBEE; color: $danger; }
.empty { text-align: center; padding: $spacing-xl; color: $text-muted; }
</style>
