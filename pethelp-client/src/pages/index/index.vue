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

    <!-- Stats Dashboard -->
    <view class="stats-row">
      <view class="stat-item" @click="navigateTo('/pages/knowledge/category-list')">
        <text class="stat-num">{{ stats.articles }}</text>
        <text class="stat-label">知识文章</text>
      </view>
      <view class="stat-item" @click="navigateTo('/pages/walking/market')">
        <text class="stat-num">{{ stats.requests }}</text>
        <text class="stat-label">遛狗请求</text>
      </view>
      <view class="stat-item" @click="navigateTo('/pages/trust/badge-wall')">
        <text class="stat-num">{{ stats.badges }}</text>
        <text class="stat-label">可获徽章</text>
      </view>
      <view class="stat-item">
        <text class="stat-num">🐶</text>
        <text class="stat-label">爱心互助</text>
      </view>
    </view>

    <!-- Nearby Walking Requests -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">附近遛狗请求</text>
        <text class="section-more" @click="navigateTo('/pages/walking/market')">更多 ›</text>
      </view>
      <view v-if="nearbyRequests.length" class="request-list">
        <view v-for="r in nearbyRequests" :key="r.id" class="request-item" @click="viewRequest(r.id)">
          <view class="req-left">
            <text class="req-pet">{{ r.pet?.name || '未知' }}</text>
            <text class="req-breed">{{ r.pet?.breed }}</text>
          </view>
          <view class="req-mid">
            <text class="req-date">{{ r.walkDate }}</text>
            <text class="req-addr">{{ r.address }}</text>
          </view>
          <text class="req-type">{{ r.rewardType === 'free' ? '🐾 免费' : '⭐ 积分' }}</text>
        </view>
      </view>
      <view v-else class="empty-state">
        <text class="empty-icon">🐕</text>
        <text class="empty-text">暂无附近请求</text>
        <text class="empty-sub">点击上方"发布遛狗"成为第一个</text>
      </view>
    </view>

    <!-- Hot Knowledge -->
    <view class="section" style="margin-top:24rpx">
      <view class="section-header">
        <text class="section-title">🔥 热门知识</text>
        <text class="section-more" @click="navigateTo('/pages/knowledge/category-list')">更多 ›</text>
      </view>
      <view v-if="hotArticles.length" class="hot-list">
        <view v-for="a in hotArticles" :key="a.id" class="hot-item" @click="viewArticle(a.id)">
          <text class="hot-title">{{ a.title }}</text>
          <text class="hot-views">👀 {{ a.viewCount }}</text>
        </view>
      </view>
    </view>
    <PrivacyPopup />
  </view>
</template>

<script setup lang="ts">
import PrivacyPopup from '@/components/privacy-popup.vue';
import { computed, ref, reactive } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { useUserStore } from '@/stores/user';
import { api } from '@/api/request';

const userStore = useUserStore();
const stats = reactive({ articles: 0, requests: 0, badges: 12 });
const nearbyRequests = ref<Array<Record<string, unknown>>>([]);
const hotArticles = ref<Array<Record<string, unknown>>>([]);

const roleLabel = computed(() => {
  const labels = { pet_owner: '🐶 宠主', helper: '🤝 帮养人', both: '🐶🤝 双角色' };
  return labels[userStore.currentRole] || '双角色';
});

async function fetchStats() {
  try {
    const [artRes, walkRes] = await Promise.all([
      api.get('/knowledge/articles?limit=1'),
      api.get('/walking/requests?limit=1'),
    ]);
    if (artRes.success) stats.articles = (artRes.data as { total?: number })?.total || 85;
    if (walkRes.success) stats.requests = (walkRes.data as { total?: number })?.total || 0;
  } catch { /* */ }
}

async function fetchNearby() {
  try {
    const res = await api.get('/walking/requests/nearby?latitude=39.9042&longitude=116.4074&radius=50');
    if (res.success) nearbyRequests.value = ((res.data as { items?: Array<Record<string, unknown>> })?.items || []);
  } catch { /* */ }
}

async function fetchHotArticles() {
  try {
    const res = await api.get('/knowledge/articles?limit=5&sort=views');
    if (res.success) hotArticles.value = ((res.data as { items?: Array<Record<string, unknown>> })?.items || []).slice(0, 3);
  } catch { /* */ }
}

onShow(() => {
  fetchStats();
  fetchNearby();
  fetchHotArticles();
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

function viewRequest(id: number) {
  uni.navigateTo({ url: `/pages/walking/request-detail?id=${id}` });
}

function viewArticle(id: number) {
  uni.navigateTo({ url: `/pages/knowledge/article-detail?id=${id}` });
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
.stats-row {
  display: grid; grid-template-columns: repeat(4, 1fr);
  padding: $spacing-md; gap: $spacing-sm; background: $bg-white; margin-bottom: $spacing-md;
}
.stat-item {
  display: flex; flex-direction: column; align-items: center; padding: $spacing-sm 0;
}
.stat-num { font-size: $font-xl; font-weight: 700; color: $primary; }
.stat-label { font-size: $font-xs; color: $text-muted; margin-top: 4rpx; }
.request-list { }
.request-item {
  display: flex; align-items: center; padding: $spacing-sm 0;
  border-bottom: 1rpx solid $border-color;
}
.request-item:last-child { border-bottom: none; }
.req-left { width: 140rpx; }
.req-pet { font-size: $font-sm; font-weight: 600; display: block; }
.req-breed { font-size: $font-xs; color: $text-muted; }
.req-mid { flex: 1; }
.req-date { font-size: $font-sm; display: block; }
.req-addr { font-size: $font-xs; color: $text-muted; }
.req-type { font-size: $font-xs; color: $primary; }
.hot-list { }
.hot-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: $spacing-sm 0; border-bottom: 1rpx solid $border-color;
}
.hot-item:last-child { border-bottom: none; }
.hot-title { font-size: $font-sm; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.hot-views { font-size: $font-xs; color: $text-muted; margin-left: $spacing-sm; }
</style>
