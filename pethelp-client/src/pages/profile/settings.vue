<template>
  <view class="settings">
    <view class="menu-item" @click="handleClearCache">
      <text>🗑️ 清除缓存</text><text>›</text>
    </view>
    <view class="menu-item" @click="handleLogout" v-if="userStore.isLoggedIn">
      <text>🚪 退出登录</text><text>›</text>
    </view>
    <view class="menu-item" @click="showPrivacy">
      <text>🔒 隐私政策</text><text>›</text>
    </view>
    <view class="menu-item">
      <text>📱 关于 PetHelp</text><text>v0.1.0</text>
    </view>
    <view class="footer-note">
      <text>PetHelp 宠物互助平台</text>
      <text>AI建议仅供参考，不替代兽医诊断</text>
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

function showPrivacy() {
  uni.showModal({
    title: '隐私政策',
    content: 'PetHelp 仅收集微信公开信息（昵称、头像）用于用户展示。位置信息仅在遛狗过程中使用，结束后不再追踪。所有聊天消息经加密传输。不会向第三方分享您的个人信息。',
    showCancel: false,
    confirmText: '我知道了',
  });
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
.settings { background: $bg-white; margin: $spacing-md; border-radius: $border-radius-lg; overflow: hidden; }
.menu-item { display: flex; justify-content: space-between; padding: $spacing-md; border-bottom: 1rpx solid $border-color; font-size: $font-md; }
.menu-item:last-child { border-bottom: none; }
.footer-note { text-align: center; padding: $spacing-xl; }
.footer-note text { display: block; font-size: $font-xs; color: $text-muted; }
</style>
