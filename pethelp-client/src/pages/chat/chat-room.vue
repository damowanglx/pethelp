<template>
  <view class="chat-room">
    <scroll-view class="message-list" scroll-y :scroll-into-view="lastMsgId">
      <view v-for="msg in messages" :key="msg.id" :id="'msg-' + msg.id">
        <view class="msg-date-divider" v-if="msg.showDate">
          <text>{{ msg.showDate }}</text>
        </view>
        <view class="msg-row" :class="{ 'msg-self': msg.senderId === userId }">
          <view class="msg-bubble" :class="msg.senderId === userId ? 'bubble-self' : 'bubble-other'">
            <text v-if="msg.msgType === 'system'" class="system-msg">{{ msg.content }}</text>
            <text v-else>{{ msg.content }}</text>
          </view>
        </view>
      </view>
      <view id="chat-bottom" />
    </scroll-view>

    <view class="chat-input-bar">
      <input v-model="inputText" class="chat-input" placeholder="输入消息..." confirm-type="send" @confirm="sendMessage" />
      <button class="send-btn" @click="sendMessage" :disabled="!inputText.trim()">发送</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useUserStore } from '@/stores/user';
import { chatApi } from '@/api/chat';

const userStore = useUserStore();
const matchId = ref(0);
const userId = ref(0);
const messages = ref<Array<{ id: number; matchId: number; senderId: number; content: string; msgType: string; createdAt: string; showDate?: string }>>([]);
const inputText = ref('');
const lastMsgId = ref('chat-bottom');

onLoad((options: Record<string, string>) => {
  if (options?.matchId) {
    matchId.value = Number(options.matchId);
    fetchMessages();
  }
  userId.value = userStore.profile?.id || 0;
});

async function fetchMessages() {
  try {
    const res = await chatApi.getMessages(matchId.value);
    if (res.success && res.data) {
      const items = (res.data as unknown as { items: Array<Record<string, unknown>> }).items || [];
      messages.value = items.map((m: Record<string, unknown>, i: number) => {
        const prev = items[i - 1] as Record<string, string> | undefined;
        const currDate = (m.createdAt as string)?.split('T')[0];
        const prevDate = prev?.createdAt?.split('T')[0];
        return { ...m, showDate: currDate !== prevDate ? currDate : undefined } as typeof messages.value[0];
      });
      nextTick(() => { lastMsgId.value = 'chat-bottom'; });
    }
  } catch { /* offline */ }
}

async function sendMessage() {
  if (!inputText.value.trim()) return;
  const content = inputText.value.trim();
  inputText.value = '';

  // Optimistic UI
  messages.value.push({ id: Date.now(), matchId: matchId.value, senderId: userId.value, content, msgType: 'text', createdAt: new Date().toISOString() });
  lastMsgId.value = 'chat-bottom';

  try {
    const otherUserId = 0; // TODO: get from match info
    await chatApi.sendMessage(matchId.value, otherUserId, content);
  } catch (e: unknown) {
    uni.showToast({ title: '发送失败', icon: 'none' });
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
.chat-room { display: flex; flex-direction: column; height: 100vh; background: $bg-primary; }
.message-list { flex: 1; padding: $spacing-sm $spacing-md; }
.msg-row { margin-bottom: $spacing-sm; display: flex; }
.msg-self { justify-content: flex-end; }
.msg-bubble { max-width: 75%; padding: $spacing-sm $spacing-md; border-radius: $border-radius; font-size: $font-md; }
.bubble-self { background: $primary; color: white; border-bottom-right-radius: 4rpx; }
.bubble-other { background: $bg-white; color: $text-primary; border-bottom-left-radius: 4rpx; }
.system-msg { color: $text-muted; font-size: $font-xs; font-style: italic; }
.msg-date-divider { text-align: center; margin: $spacing-sm 0; }
.msg-date-divider text { font-size: $font-xs; color: $text-muted; background: $bg-primary; padding: 4rpx 16rpx; }
.chat-input-bar { display: flex; padding: $spacing-sm $spacing-md; background: $bg-white; border-top: 1rpx solid $border-color; align-items: center; gap: $spacing-sm; }
.chat-input { flex: 1; padding: $spacing-sm; background: $bg-primary; border-radius: 40rpx; font-size: $font-md; }
.send-btn { padding: $spacing-xs $spacing-lg; background: $primary; color: white; border-radius: 40rpx; font-size: $font-sm; }
.send-btn[disabled] { background: #ccc; }
</style>
