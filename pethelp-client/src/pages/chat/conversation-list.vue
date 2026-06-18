<template>
  <view class="chat-list">
    <view v-if="conversations.length === 0" class="empty">
      <text class="empty-icon">💬</text>
      <text>暂无消息</text>
      <text class="empty-sub">匹配成功后即可开始聊天</text>
    </view>
    <view v-for="conv in conversations" :key="conv.matchId" class="conv-item" @click="openChat(conv.matchId)">
      <view class="conv-avatar">{{ conv.otherUser.avatarUrl || '🐶' }}</view>
      <view class="conv-info">
        <view class="conv-top">
          <text class="conv-name">{{ conv.otherUser.nickname || '用户' }}</text>
          <text class="conv-time">--</text>
        </view>
        <view class="conv-bottom">
          <text class="conv-preview">--</text>
          <view v-if="conv.unreadCount > 0" class="unread-badge">{{ conv.unreadCount }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { chatApi } from '@/api/chat';

const conversations = ref<Array<Record<string, unknown>>>([]);

onShow(async () => {
  try {
    const res = await chatApi.getConversations();
    if (res.success && res.data) {
      conversations.value = (res.data as Array<Record<string, unknown>>) || [];
    }
  } catch { /* empty */ }
});

function openChat(matchId: number) {
  uni.navigateTo({ url: `/pages/chat/chat-room?matchId=${matchId}` });
}
</script>

<style lang="scss" scoped>
.chat-list { background: $bg-white; }
.conv-item { display: flex; padding: $spacing-md; border-bottom: 1rpx solid $border-color; align-items: center; }
.conv-avatar { width: 96rpx; height: 96rpx; border-radius: 50%; background: $bg-primary; display: flex; align-items: center; justify-content: center; font-size: 40rpx; margin-right: $spacing-md; flex-shrink: 0; }
.conv-info { flex: 1; min-width: 0; }
.conv-top { display: flex; justify-content: space-between; margin-bottom: $spacing-xs; }
.conv-name { font-size: $font-md; font-weight: 500; }
.conv-time { font-size: $font-xs; color: $text-muted; }
.conv-bottom { display: flex; justify-content: space-between; align-items: center; }
.conv-preview { font-size: $font-sm; color: $text-muted; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 80%; }
.unread-badge { background: $danger; color: white; border-radius: 50%; min-width: 36rpx; height: 36rpx; display: flex; align-items: center; justify-content: center; font-size: $font-xs; padding: 0 6rpx; }
.empty { text-align: center; padding: $spacing-xl; }
.empty-icon { font-size: 64rpx; display: block; margin-bottom: $spacing-md; }
.empty-sub { font-size: $font-xs; color: $text-muted; display: block; margin-top: $spacing-xs; }
</style>
