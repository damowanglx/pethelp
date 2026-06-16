<template>
  <view class="home">
    <!-- Header -->
    <view class="home-header">
      <view class="header-left">
        <text class="app-name">PetHelp</text>
        <text class="app-slogan">宠物互助，爱心传递</text>
      </view>
      <view class="header-right" @click="handleRoleSwitch">
        <view class="role-tag" :class="userStore.currentRole">
          {{ roleLabel }}
        </view>
      </view>
    </view>

    <!-- Quick Actions -->
    <view class="quick-actions">
      <view class="action-item" @click="navigateTo('/pages/walking/request-create')">
        <view class="action-icon">🐾</view>
        <text class="action-text">发布遛狗</text>
      </view>
      <view class="action-item" @click="navigateTo('/pages/ai-health/consult')">
        <view class="action-icon">🤖</view>
        <text class="action-text">AI宠物医生</text>
      </view>
      <view class="action-item" @click="navigateTo('/pages/knowledge/category-list')">
        <view class="action-icon">📚</view>
        <text class="action-text">知识库</text>
      </view>
      <view class="action-item" @click="navigateTo('/pages/trust/certification-apply')">
        <view class="action-icon">🎖️</view>
        <text class="action-text">经验认证</text>
      </view>
    </view>

    <!-- Nearby Walking Requests (placeholder) -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">附近遛狗请求</text>
        <text class="section-more" @click="navigateTo('/pages/walking/market')">更多 ›</text>
      </view>
      <view class="empty-state" v-if="true">
        <text class="empty-icon">🐕</text>
        <text class="empty-text">暂无附近请求</text>
        <text class="empty-sub">点击上方"发布遛狗"成为第一个</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();

const roleLabel = computed(() => {
  const labels = { pet_owner: '🐶 宠主', helper: '🤝 帮养人', both: '🐶🤝 双角色' };
  return labels[userStore.currentRole] || '双角色';
});

function handleRoleSwitch() {
  uni.showActionSheet({
    itemList: ['切换为宠主', '切换为帮养人'],
    success: (res) => {
      const role = res.tapIndex === 0 ? 'pet_owner' : 'helper';
      userStore.switchRole(role);
    },
  });
}

function navigateTo(url: string) {
  uni.navigateTo({ url });
}
</script>

<style lang="scss" scoped>
.home { padding-bottom: $spacing-xl; }
.home-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: $spacing-lg $spacing-md; background: $bg-white;
}
.app-name { font-size: $font-xl; font-weight: 700; color: $primary; }
.app-slogan { font-size: $font-xs; color: $text-muted; display: block; }
.role-tag {
  padding: $spacing-xs $spacing-md; border-radius: 20rpx;
  font-size: $font-sm; background: $bg-primary;
}
.quick-actions {
  display: grid; grid-template-columns: repeat(4, 1fr);
  padding: $spacing-md; gap: $spacing-sm; background: $bg-white;
  margin-bottom: $spacing-md;
}
.action-item {
  display: flex; flex-direction: column; align-items: center; padding: $spacing-sm 0;
}
.action-icon { font-size: 44rpx; margin-bottom: $spacing-xs; }
.action-text { font-size: $font-xs; color: $text-secondary; }
.section { background: $bg-white; margin: 0 $spacing-md; border-radius: $border-radius-lg; padding: $spacing-md; }
.section-header { display: flex; justify-content: space-between; margin-bottom: $spacing-md; }
.section-title { font-size: $font-lg; font-weight: 600; }
.section-more { font-size: $font-sm; color: $primary; }
.empty-state { display: flex; flex-direction: column; align-items: center; padding: $spacing-xl 0; }
.empty-icon { font-size: 64rpx; }
.empty-text { font-size: $font-md; color: $text-secondary; margin-top: $spacing-sm; }
.empty-sub { font-size: $font-xs; color: $text-muted; margin-top: $spacing-xs; }
</style>
