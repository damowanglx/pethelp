<template>
  <view class="profile">
    <!-- User Info Card -->
    <view class="user-card">
      <view class="user-avatar" @click="handleLogin">
        {{ userStore.profile?.nickname?.[0] || '👤' }}
      </view>
      <view class="user-info" v-if="userStore.isLoggedIn">
        <text class="user-name">{{ userStore.profile?.nickname || '用户' }}</text>
        <view class="credit-row">
          <text class="credit-score">信用分 {{ userStore.profile?.creditScore || 0 }}</text>
          <view class="helper-badge" v-if="userStore.profile?.isHelper">已认证</view>
        </view>
      </view>
      <view class="user-info" v-else>
        <input v-model="devCode" class="login-input" placeholder="dev / dev_昵称" maxlength="32" />
        <button class="login-btn" @click="handleLogin">Dev 登录</button>
      </view>
    </view>

    <!-- Menu -->
    <view class="menu-section">
      <view class="menu-item" @click="navigateTo('/pages/profile/my-pets')">
        <text>🐕 我的宠物</text><text>›</text>
      </view>
      <view class="menu-item" @click="navigateTo('/pages/profile/my-walks')">
        <text>🐾 遛狗记录</text><text>›</text>
      </view>
      <view class="menu-item" @click="navigateTo('/pages/trust/certification-apply')">
        <text>🎖️ 帮养人认证</text><text>›</text>
      </view>
      <view class="menu-item" @click="navigateTo('/pages/trust/credit-showcase')">
        <text>⭐ 信用档案</text><text>›</text>
      </view>
      <view class="menu-item" @click="navigateTo('/pages/trust/badge-wall')">
        <text>🏅 徽章墙</text><text>›</text>
      </view>
      <view class="menu-item" @click="navigateTo('/pages/knowledge/favorites')">
        <text>⭐ 我的收藏</text><text>›</text>
      </view>
      <view class="menu-item" @click="navigateTo('/pages/ai-health/history')">
        <text>🤖 AI问诊记录</text><text>›</text>
      </view>
      <view class="menu-item" @click="navigateTo('/pages/profile/settings')">
        <text>⚙️ 设置</text><text>›</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
const devCode = ref('dev');

function handleLogin() {
  if (userStore.isLoggedIn) return;
  const code = devCode.value.trim() || 'dev';
  const name = code === 'dev' ? 'DevUser' : code.replace('dev_', '');
  userStore.login(code, name);
}

function navigateTo(url: string) {
  uni.navigateTo({ url });
}
</script>

<style lang="scss" scoped>
.profile { padding-bottom: $spacing-xl; }
.user-card {
  background: linear-gradient(135deg, $primary, $primary-light);
  padding: $spacing-xl $spacing-md; display: flex; align-items: center; gap: $spacing-md;
}
.user-avatar { width: 120rpx; height: 120rpx; border-radius: 50%; background: rgba(255,255,255,0.3); display: flex; align-items: center; justify-content: center; font-size: 48rpx; color: white; }
.user-name { font-size: $font-xl; color: white; font-weight: 600; }
.credit-row { display: flex; align-items: center; gap: $spacing-sm; margin-top: $spacing-xs; }
.credit-score { font-size: $font-sm; color: rgba(255,255,255,0.9); }
.helper-badge { padding: 2rpx 16rpx; background: rgba(255,255,255,0.3); border-radius: 20rpx; font-size: $font-xs; color: white; }
.login-hint { color: white; font-size: $font-lg; }
.login-input { background: rgba(255,255,255,0.9); border-radius: 8rpx; padding: 8rpx 16rpx; font-size: $font-sm; margin-bottom: 12rpx; width: 300rpx; }
.login-btn { background: white; color: $primary; padding: 8rpx 24rpx; border-radius: 32rpx; font-size: $font-sm; }
.menu-section { background: $bg-white; margin: $spacing-md; border-radius: $border-radius-lg; overflow: hidden; }
.menu-item { display: flex; justify-content: space-between; padding: $spacing-md; border-bottom: 1rpx solid $border-color; font-size: $font-md; }
.menu-item:last-child { border-bottom: none; }
</style>
