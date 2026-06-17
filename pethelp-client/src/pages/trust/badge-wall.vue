<template>
  <view class="badge-wall">
    <view v-if="badges.length === 0" class="empty"><text>暂无徽章</text><text class="hint">完成遛狗任务、通过认证后自动获得</text></view>
    <view class="badge-grid" v-else>
      <view v-for="b in badges" :key="b.badgeKey" class="badge-item" :class="{ locked: !b.earned }">
        <text class="badge-icon">{{ b.badge?.icon || '🏅' }}</text>
        <text class="badge-name">{{ b.badge?.name || b.badgeKey }}</text>
        <text class="badge-desc">{{ b.badge?.description || '' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { trustApi } from '@/api/trust';

const badges = ref<Array<{ badgeKey: string; earned?: boolean; badge?: { icon: string; name: string; description: string } }>>([]);

onLoad((options: Record<string, string>) => {
  const uid = options?.userId ? Number(options.userId) : null;
  fetchBadges(uid);
});

async function fetchBadges(userId: number | null) {
  try {
    const [userBadges, allBadges] = await Promise.all([
      userId ? trustApi.getUserBadges(userId) : Promise.resolve({ success: true, data: [] }),
      trustApi.getAllBadges(),
    ]);
    const earned: string[] = (userBadges.success && Array.isArray(userBadges.data))
      ? (userBadges.data as Array<{ badgeKey: string }>).map((b) => b.badgeKey) : [];
    if (allBadges.success && Array.isArray(allBadges.data)) {
      badges.value = (allBadges.data as Array<{ badgeKey: string; name: string; icon: string; description: string }>).map((b) => ({
        ...b,
        earned: earned.includes(b.badgeKey),
      }));
    }
  } catch { /* */ }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
.badge-wall { padding: $spacing-md; }
.badge-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: $spacing-sm; }
.badge-item { background: $bg-white; border-radius: $border-radius; padding: $spacing-md; text-align: center; }
.badge-item.locked { opacity: 0.4; }
.badge-icon { font-size: 48rpx; display: block; }
.badge-name { font-size: $font-sm; font-weight: 600; display: block; margin-top: $spacing-xs; }
.badge-desc { font-size: $font-xs; color: $text-muted; display: block; }
.empty { text-align: center; padding: $spacing-xl; }
.hint { font-size: $font-xs; color: $text-muted; display: block; margin-top: $spacing-xs; }
</style>
