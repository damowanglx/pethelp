<template>
  <view class="consult-page">
    <view class="chat-area">
      <view v-for="(msg, i) in messages" :key="i" class="msg-item" :class="msg.role">
        <view class="msg-bubble">
          <text v-if="msg.role === 'assistant' && msg.response">
            <text class="urgency-badge" :class="msg.response.urgency_level">
              {{ urgencyLabel(msg.response.urgency_level) }}
            </text>
            <text class="condition-title" v-for="c in msg.response.possible_conditions" :key="c.name">
              {{ c.name }}: {{ c.description }}
            </text>
            <text class="care-title">居家护理:</text>
            <text v-for="c in msg.response.home_care" :key="c">- {{ c }}</text>
            <text class="vet-warning">{{ msg.response.when_to_see_vet }}</text>
            <text class="disclaimer">{{ msg.response.disclaimer }}</text>
          </text>
          <text v-else>{{ msg.content }}</text>
        </view>
      </view>
    </view>

    <view class="usage-bar">
      <text>今日剩余 {{ usage.remaining }}/{{ usage.limit }} 次</text>
    </view>

    <view class="input-bar">
      <input v-model="query" class="query-input" placeholder="描述宠物症状..." confirm-type="send" @confirm="sendQuery" />
      <button class="send-btn" :disabled="!query.trim() || loading" @click="sendQuery">发送</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { aiHealthApi, type ConsultationResponse } from '@/api/ai-health';

const messages = ref<Array<{ role: string; content: string; response?: ConsultationResponse }>>([]);
const query = ref('');
const loading = ref(false);
const usage = ref({ used: 0, limit: 10, remaining: 10 });

const urgencyLabel = (level: string) => {
  const labels: Record<string, string> = { low: '低风险', medium: '注意', high: '建议就医', emergency: '立即就医' };
  return labels[level] || level;
};

async function sendQuery() {
  if (!query.value.trim() || loading.value) return;
  loading.value = true;
  const text = query.value.trim();
  query.value = '';
  messages.value.push({ role: 'user', content: text });

  try {
    const res = await aiHealthApi.consult(text);
    if (res.success && res.data) {
      messages.value.push({ role: 'assistant', content: '', response: res.data });
    }
    await fetchUsage();
  } catch (e: unknown) {
    messages.value.push({ role: 'assistant', content: (e as Error).message });
  }
  loading.value = false;
}

async function fetchUsage() {
  try {
    const res = await aiHealthApi.getDailyUsage();
    if (res.success && res.data) usage.value = res.data;
  } catch { /* */ }
}

onMounted(() => fetchUsage());
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
.consult-page { display: flex; flex-direction: column; height: 100vh; background: $bg-primary; }
.chat-area { flex: 1; padding: $spacing-sm $spacing-md; overflow-y: auto; }
.msg-item { margin-bottom: $spacing-md; }
.msg-item.user { display: flex; justify-content: flex-end; }
.msg-item.assistant .msg-bubble { background: $bg-white; border-radius: $border-radius; padding: $spacing-md; }
.msg-item.user .msg-bubble { background: $primary; color: white; border-radius: $border-radius; padding: $spacing-sm $spacing-md; max-width: 75%; }
.urgency-badge { display: inline-block; padding: 4rpx 16rpx; border-radius: 20rpx; font-size: $font-xs; margin-bottom: $spacing-sm; }
.urgency-badge.low { background: #E8F5E9; color: $success; }
.urgency-badge.medium { background: #FFF8E1; color: #F57F17; }
.urgency-badge.high { background: #FFF3E0; color: #E65100; }
.urgency-badge.emergency { background: #FFEBEE; color: $danger; }
.condition-title { display: block; font-size: $font-sm; margin-bottom: 4rpx; }
.care-title { display: block; font-weight: 600; margin-top: $spacing-sm; font-size: $font-sm; }
.vet-warning { display: block; margin-top: $spacing-sm; color: $danger; font-weight: 600; font-size: $font-sm; }
.disclaimer { display: block; margin-top: $spacing-sm; font-size: $font-xs; color: $text-muted; font-style: italic; }
.usage-bar { text-align: center; padding: $spacing-xs; font-size: $font-xs; color: $text-muted; background: $bg-white; }
.input-bar { display: flex; padding: $spacing-sm $spacing-md; background: $bg-white; gap: $spacing-sm; align-items: center; border-top: 1rpx solid $border-color; }
.query-input { flex: 1; padding: $spacing-sm; background: $bg-primary; border-radius: 40rpx; font-size: $font-md; }
.send-btn { padding: $spacing-xs $spacing-lg; background: $primary; color: white; border-radius: 40rpx; font-size: $font-sm; }
.send-btn[disabled] { background: #ccc; }
</style>
