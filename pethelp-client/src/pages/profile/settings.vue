<template>
  <view class="settings">
    <view class="menu-item" @click="handleClearCache">
      <text>🗑️ 清除缓存</text><text>›</text>
    </view>
    <view class="menu-item" @click="handleLogout" v-if="userStore.isLoggedIn">
      <text>🚪 退出登录</text><text>›</text>
    </view>
    <view class="menu-item">
      <text>📱 关于 PetHelp</text><text>v0.1.0</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();

function handleClearCache() {
  uni.clearStorage({ success: () => uni.showToast({ title: '已清除', icon: 'success' }) });
}

function handleLogout() {
  uni.showModal({
    title: '确认退出?',
    success: (res) => {
      if (res.confirm) {
        userStore.logout();
        uni.reLaunch({ url: '/pages/index/index' });
      }
    },
  });
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
.settings { background: $bg-white; margin: $spacing-md; border-radius: $border-radius-lg; overflow: hidden; }
.menu-item { display: flex; justify-content: space-between; padding: $spacing-md; border-bottom: 1rpx solid $border-color; font-size: $font-md; }
.menu-item:last-child { border-bottom: none; }
</style>
