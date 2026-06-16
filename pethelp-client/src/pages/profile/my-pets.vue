<template>
  <view class="my-pets">
    <view v-if="pets.length === 0" class="empty">
      <text class="empty-icon">🐕</text>
      <text>还没有宠物</text>
      <navigator url="/pages/profile/pet-create" class="add-btn">+ 添加宠物</navigator>
    </view>
    <view v-for="pet in pets" :key="pet.id" class="pet-card">
      <view class="pet-avatar">🐶</view>
      <view class="pet-info">
        <text class="pet-name">{{ pet.name }}</text>
        <text class="pet-detail">{{ pet.breed }} · {{ genderLabel(pet.gender) }}</text>
        <text class="pet-detail" v-if="pet.temperament">{{ pet.temperament }}</text>
      </view>
      <navigator :url="`/pages/profile/pet-create?id=${pet.id}`" class="edit-btn">编辑</navigator>
    </view>
    <view class="fab" @click="addPet">+</view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { petApi } from '@/api/pet';
import type { Pet } from '@/types/pet';

const pets = ref<Pet[]>([]);

function genderLabel(g: string) {
  const labels: Record<string, string> = { male: '♂ 公', female: '♀ 母', unknown: '未知' };
  return labels[g] || '未知';
}

function addPet() { uni.navigateTo({ url: '/pages/profile/pet-create' }); }

onMounted(async () => {
  try {
    const res = await petApi.list();
    if (res.success && res.data) pets.value = res.data;
  } catch { /* no pets */ }
});
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
.my-pets { padding: $spacing-md; padding-bottom: 120rpx; }
.pet-card { display: flex; align-items: center; background: $bg-white; padding: $spacing-md; border-radius: $border-radius; margin-bottom: $spacing-sm; }
.pet-avatar { font-size: 64rpx; margin-right: $spacing-md; }
.pet-name { font-size: $font-md; font-weight: 600; }
.pet-detail { font-size: $font-sm; color: $text-secondary; display: block; }
.edit-btn { margin-left: auto; color: $primary; font-size: $font-sm; }
.empty { text-align: center; padding: $spacing-xl; }
.empty-icon { font-size: 80rpx; display: block; }
.add-btn { display: inline-block; margin-top: $spacing-md; padding: $spacing-sm $spacing-lg; background: $primary; color: white; border-radius: 40rpx; }
.fab { position: fixed; bottom: 160rpx; right: 40rpx; width: 96rpx; height: 96rpx; background: $primary; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 48rpx; box-shadow: $shadow-md; }
</style>
