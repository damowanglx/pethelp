<template>
  <view class="request-detail">
    <view v-if="request" class="detail-content">
      <view class="pet-card">
        <text class="pet-icon">🐶</text>
        <view class="pet-info">
          <text class="pet-name">{{ request.pet?.name || '未知' }}</text>
          <text class="pet-breed">{{ request.pet?.breed }} · {{ request.pet?.temperament || '未填写性格' }}</text>
        </view>
      </view>

      <view class="detail-section">
        <view class="detail-row"><text class="dl">🕐 时间</text><text>{{ request.walkDate }} {{ request.startTime }}-{{ request.endTime }} ({{ request.durationMinutes }}分钟)</text></view>
        <view class="detail-row"><text class="dl">📍 地点</text><text>{{ request.address }}</text></view>
        <view class="detail-row"><text class="dl">🏷️ 类型</text><text>{{ request.rewardType === 'free' ? '免费互助' : '积分感谢' }}</text></view>
        <view class="detail-row" v-if="request.description"><text class="dl">📝 备注</text><text>{{ request.description }}</text></view>
        <view class="detail-row"><text class="dl">👤 宠主</text><text>{{ request.owner?.nickname || '用户' }} ⭐{{ request.owner?.ratingAvg }}</text></view>
      </view>

      <view class="status-section">
        <view class="status-badge" :class="request.status">{{ statusText }}</view>
        <text class="apply-count">{{ request.applyCount }} 人已申请</text>
      </view>

      <view v-if="isOwner && request.matches?.length" class="applicants">
        <text class="section-title">申请人</text>
        <view v-for="m in request.matches" :key="m.id" class="applicant-item">
          <view class="applicant-info">
            <text class="applicant-name">{{ m.helper?.nickname || '用户' }}</text>
            <text class="applicant-score">信用 {{ m.helper?.creditScore || 0 }}</text>
            <text class="applicant-msg" v-if="m.helperMessage">{{ m.helperMessage }}</text>
          </view>
          <view class="applicant-actions" v-if="m.status === 'applied'">
            <button class="btn-accept" @click="handleAccept(m.id)">接受</button>
            <button class="btn-reject" @click="handleReject(m.id)">拒绝</button>
          </view>
          <view v-else class="applicant-status">{{ m.status === 'accepted' ? '已接受 ✅' : m.status }}</view>
        </view>
      </view>

      <view class="actions">
        <button v-if="!isOwner && request.status === 'open'" class="btn-primary" @click="handleApply">
          我要帮遛 🐾
        </button>
        <button v-if="canStart" class="btn-primary" @click="handleStart">
          开始遛狗 ▶️
        </button>
        <button v-if="canComplete" class="btn-primary" @click="handleComplete">
          完成遛狗 ✅
        </button>
        <button v-if="isOwner && request.status === 'open'" class="btn-danger" @click="handleCancelRequest">
          取消请求
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { walkingApi } from '@/api/walking';
import { useUserStore } from '@/stores/user';
import type { WalkingRequest, Match } from '@/types/walking';

const request = ref<(WalkingRequest & { matches: Match[] }) | null>(null);
const userStore = useUserStore();

const isOwner = computed(() => request.value?.ownerId === userStore.profile?.id);
const activeMatch = computed(() => request.value?.matches?.find((m: Match) => m.status === 'accepted' || m.status === 'in_progress'));
const canStart = computed(() => activeMatch.value?.status === 'accepted');
const canComplete = computed(() => activeMatch.value?.status === 'in_progress');
const statusText = computed(() => {
  const labels: Record<string, string> = {
    open: '待匹配', matched: '已匹配', in_progress: '进行中', completed: '已完成', cancelled: '已取消',
  };
  return labels[request.value?.status || ''] || '';
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
onLoad((options: any) => {
  if (options?.id) fetchDetail(Number(options.id));
});

async function fetchDetail(id: number) {
  const res = await walkingApi.getById(id);
  if (res.success && res.data) request.value = res.data;
}

async function handleApply() {
  const { confirm } = await uni.showModal({
    title: '申请帮遛',
    content: '确认要申请这个遛狗请求吗？',
  });
  if (!confirm) return;
  try {
    await walkingApi.apply(request.value!.id);
    uni.showToast({ title: '申请成功', icon: 'success' });
    fetchDetail(request.value!.id);
  } catch (e: unknown) {
    uni.showToast({ title: (e as Error).message || '申请失败', icon: 'none' });
  }
}

async function handleAccept(matchId: number) {
  try {
    await walkingApi.acceptMatch(matchId, '很高兴一起遛狗!');
    uni.showToast({ title: '已接受', icon: 'success' });
    fetchDetail(request.value!.id);
  } catch (e: unknown) {
    uni.showToast({ title: (e as Error).message, icon: 'none' });
  }
}

async function handleReject(matchId: number) {
  try {
    await walkingApi.rejectMatch(matchId);
    uni.showToast({ title: '已拒绝', icon: 'none' });
    fetchDetail(request.value!.id);
  } catch (e: unknown) {
    uni.showToast({ title: (e as Error).message, icon: 'none' });
  }
}

async function handleStart() {
  if (!activeMatch.value) return;
  try {
    await walkingApi.startWalk(activeMatch.value.id);
    uni.showToast({ title: '遛狗开始!', icon: 'success' });
    uni.navigateTo({ url: `/pages/walking/walking-active?matchId=${activeMatch.value.id}` });
  } catch (e: unknown) {
    uni.showToast({ title: (e as Error).message, icon: 'none' });
  }
}

async function handleComplete() {
  if (!activeMatch.value) return;
  try {
    await walkingApi.completeWalk(activeMatch.value.id);
    uni.showToast({ title: '遛狗完成!', icon: 'success' });
    uni.redirectTo({ url: `/pages/walking/walking-complete?matchId=${activeMatch.value.id}` });
  } catch (e: unknown) {
    uni.showToast({ title: (e as Error).message, icon: 'none' });
  }
}

async function handleCancelRequest() {
  const { confirm } = await uni.showModal({ title: '确认取消?', content: '取消后无法恢复' });
  if (!confirm) return;
  try {
    await walkingApi.cancelRequest(request.value!.id, '宠主主动取消');
    uni.showToast({ title: '已取消', icon: 'none' });
    setTimeout(() => uni.navigateBack(), 1000);
  } catch (e: unknown) {
    uni.showToast({ title: (e as Error).message, icon: 'none' });
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
.request-detail { padding: $spacing-md; }
.pet-card { display: flex; align-items: center; background: $bg-white; padding: $spacing-md; border-radius: $border-radius-lg; margin-bottom: $spacing-md; }
.pet-icon { font-size: 64rpx; margin-right: $spacing-md; }
.pet-name { font-size: $font-lg; font-weight: 600; display: block; }
.pet-breed { font-size: $font-sm; color: $text-secondary; }
.detail-section { background: $bg-white; border-radius: $border-radius-lg; padding: $spacing-md; margin-bottom: $spacing-md; }
.detail-row { display: flex; margin-bottom: $spacing-sm; font-size: $font-sm; }
.dl { width: 120rpx; flex-shrink: 0; }
.status-section { display: flex; align-items: center; gap: $spacing-md; margin-bottom: $spacing-md; }
.status-badge { padding: $spacing-xs $spacing-md; border-radius: 20rpx; font-size: $font-sm; }
.status-badge.open { background: #E8F5E9; color: $success; }
.status-badge.matched { background: #E3F2FD; color: $info; }
.apply-count { color: $text-muted; font-size: $font-sm; }
.section-title { font-size: $font-md; font-weight: 600; margin-bottom: $spacing-sm; display: block; }
.applicant-item { background: $bg-white; padding: $spacing-md; border-radius: $border-radius; margin-bottom: $spacing-sm; display: flex; justify-content: space-between; align-items: center; }
.applicant-name { font-weight: 500; }
.applicant-score { color: $primary; font-size: $font-sm; margin-left: $spacing-sm; }
.applicant-msg { font-size: $font-xs; color: $text-muted; display: block; margin-top: 4rpx; }
.applicant-actions { display: flex; gap: $spacing-sm; }
.btn-accept { padding: $spacing-xs $spacing-md; background: $success; color: white; border-radius: 20rpx; font-size: $font-sm; }
.btn-reject { padding: $spacing-xs $spacing-md; background: $bg-primary; color: $text-secondary; border-radius: 20rpx; font-size: $font-sm; }
.actions { margin-top: $spacing-lg; }
.btn-primary { width: 100%; padding: $spacing-md; background: $primary; color: white; border-radius: $border-radius; font-size: $font-md; }
.btn-danger { width: 100%; padding: $spacing-md; background: $bg-primary; color: $danger; border-radius: $border-radius; font-size: $font-md; }
</style>
