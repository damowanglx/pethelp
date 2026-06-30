<template>
  <view v-if="visible" class="privacy-overlay">
    <view class="privacy-modal">
      <text class="privacy-title">PetHelp 隐私政策与用户协议</text>
      <scroll-view class="privacy-body" scroll-y>
        <text class="privacy-content">
本小程序 PetHelp（宠物互助平台）尊重并保护您的个人隐私。请仔细阅读以下条款：

一、信息收集
1. 我们仅收集您在微信平台公开的基本信息（昵称、头像），用于在应用内展示用户身份。
2. 位置信息仅在遛狗过程中临时采集，用于实时位置共享与轨迹记录。遛狗结束后停止采集。
3. 聊天消息仅用于实现即时通讯功能，不会用于其他目的。

二、信息使用
1. 您的个人信息仅用于本小程序内的核心功能：用户匹配、遛狗追踪、信用评价。
2. 信用评分基于公开的遛狗记录和评价数据自动计算。
3. AI 问诊内容仅用于生成健康建议，不会用于其他用途。

三、信息安全
1. 所有数据传输采用 HTTPS 加密。
2. 聊天消息和位置数据仅存储在安全的云服务器中。
3. 我们采取合理的安全措施保护您的信息不被未经授权的访问。

四、信息共享
1. 我们不会向任何第三方出售或分享您的个人信息。
2. 法律法规要求披露的情况除外。

五、您的权利
1. 您可以在"设置"页面查看隐私政策。
2. 您可以随时清除缓存退出登录，相关数据将被清除。
3. 如有隐私相关问题，可通过小程序内反馈渠道联系我们。

六、免责声明
1. AI 宠物健康建议仅供参考，不能替代专业兽医诊断。
2. 遛狗过程中的人身和财产安全由用户自行负责。
3. 用户间交流产生的纠纷，平台提供调解但不承担连带责任。

点击"同意并继续"即表示您已阅读并同意上述条款。
        </text>
      </scroll-view>
      <view class="privacy-actions">
        <button class="btn-agree" @click="handleAgree">同意并继续</button>
        <button class="btn-reject" @click="handleReject">不同意并退出</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const visible = ref(false);

onMounted(() => {
  const agreed = uni.getStorageSync('pethelp_privacy_agreed');
  if (!agreed) {
    visible.value = true;
  }
});

function handleAgree() {
  uni.setStorageSync('pethelp_privacy_agreed', Date.now());
  visible.value = false;
}

function handleReject() {
  uni.showModal({
    title: '提示',
    content: '需要同意隐私政策才能使用 PetHelp。',
    showCancel: false,
    confirmText: '重新查看',
    success: () => {
      // Keep modal visible
    },
  });
}
</script>

<style lang="scss" scoped>
.privacy-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5); z-index: 9999;
  display: flex; align-items: center; justify-content: center;
}
.privacy-modal {
  width: 640rpx; max-height: 80vh;
  background: white; border-radius: 24rpx; overflow: hidden;
  display: flex; flex-direction: column;
}
.privacy-title {
  display: block; text-align: center; font-size: 32rpx; font-weight: 700;
  padding: 32rpx 24rpx 16rpx; border-bottom: 1rpx solid #eee;
}
.privacy-body {
  flex: 1; padding: 24rpx; max-height: 600rpx;
}
.privacy-content {
  font-size: 26rpx; line-height: 1.8; color: #333; white-space: pre-wrap;
}
.privacy-actions {
  padding: 24rpx; display: flex; flex-direction: column; gap: 16rpx;
  border-top: 1rpx solid #eee;
}
.btn-agree {
  width: 100%; padding: 24rpx; background: #FF6B35; color: white;
  border-radius: 44rpx; font-size: 28rpx; text-align: center;
}
.btn-reject {
  width: 100%; padding: 16rpx; background: transparent; color: #999;
  font-size: 24rpx; text-align: center;
}
</style>
