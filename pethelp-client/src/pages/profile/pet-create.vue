<template>
  <view class="pet-create">
    <view class="form-section">
      <text class="section-label">宠物名字 *</text>
      <input v-model="form.name" class="form-input" placeholder="给你的宠物取个名字" maxlength="32" />
    </view>

    <view class="form-section">
      <text class="section-label">种类 *</text>
      <view class="option-row">
        <view v-for="s in species" :key="s.value"
          class="option-btn" :class="{ active: form.species === s.value }"
          @click="form.species = s.value">{{ s.label }}</view>
      </view>
    </view>

    <view class="form-section">
      <text class="section-label">品种 *</text>
      <input v-model="form.breed" class="form-input" placeholder="如：金毛、泰迪、英短" maxlength="64" />
    </view>

    <view class="form-row">
      <view class="form-section half">
        <text class="section-label">性别</text>
        <picker mode="selector" :range="['未知','公','母']" @change="(e:any) => form.gender = ['unknown','male','female'][e.detail.value]">
          <view class="form-picker">{{ genderLabel }}</view>
        </picker>
      </view>
      <view class="form-section half">
        <text class="section-label">体重(kg)</text>
        <input v-model.number="form.weightKg" class="form-input" type="digit" placeholder="00.0" />
      </view>
    </view>

    <view class="form-section">
      <text class="section-label">性格特点</text>
      <input v-model="form.temperament" class="form-input" placeholder="如：活泼好动、安静粘人" maxlength="128" />
    </view>

    <view class="form-section">
      <text class="section-label">健康备注</text>
      <textarea v-model="form.medicalNotes" class="form-textarea" placeholder="过敏史、慢性病、用药情况等" maxlength="500" />
    </view>

    <view class="form-section">
      <text class="section-label">默认遛狗时长(分钟)</text>
      <input v-model.number="form.walkDurationMin" class="form-input" type="number" placeholder="30" />
    </view>

    <view class="form-switch">
      <text>已绝育</text>
      <switch :checked="form.isNeutered" @change="(e:any) => form.isNeutered = e.detail.value" color="#FF6B35" />
    </view>

    <button class="submit-btn" :disabled="!isValid" @click="handleSubmit">
      保存
    </button>
  </view>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue';
import { petApi } from '@/api/pet';

const form = reactive({
  name: '', species: 'dog' as string, breed: '',
  gender: 'unknown' as string, weightKg: null as number | null,
  temperament: '', medicalNotes: '', walkDurationMin: 30,
  isNeutered: false,
});

const species = [
  { label: '🐶 狗', value: 'dog' },
  { label: '🐱 猫', value: 'cat' },
  { label: '🐹 其他', value: 'other' },
];

const genderLabel = computed(() => {
  const labels: Record<string, string> = { unknown: '未知', male: '公', female: '母' };
  return labels[form.gender] || '未知';
});

const isValid = computed(() => form.name && form.breed);

async function handleSubmit() {
  if (!isValid.value) return;
  try {
    const res = await petApi.create({
      name: form.name,
      species: form.species,
      breed: form.breed,
      gender: form.gender,
      weightKg: form.weightKg,
      temperament: form.temperament,
      medicalNotes: form.medicalNotes,
      walkDurationMin: form.walkDurationMin,
      isNeutered: form.isNeutered,
    });
    if (res.success) {
      uni.showToast({ title: '添加成功!', icon: 'success' });
      setTimeout(() => uni.navigateBack(), 1500);
    } else {
      uni.showToast({ title: '保存失败', icon: 'none' });
    }
  } catch (e: unknown) {
    uni.showToast({ title: (e as Error).message || '保存失败', icon: 'none' });
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
.pet-create { padding: $spacing-md; padding-bottom: 120rpx; }
.form-section { margin-bottom: $spacing-md; }
.section-label { font-size: $font-sm; color: $text-secondary; display: block; margin-bottom: $spacing-xs; }
.form-input { padding: $spacing-sm $spacing-md; background: $bg-white; border-radius: $border-radius; font-size: $font-md; border: 1rpx solid $border-color; }
.form-picker { padding: $spacing-sm $spacing-md; background: $bg-white; border-radius: $border-radius; border: 1rpx solid $border-color; }
.form-textarea { width: 100%; min-height: 120rpx; padding: $spacing-sm; background: $bg-white; border-radius: $border-radius; font-size: $font-sm; border: 1rpx solid $border-color; }
.form-row { display: flex; gap: $spacing-sm; }
.half { flex: 1; }
.option-row { display: flex; gap: $spacing-sm; }
.option-btn { flex: 1; text-align: center; padding: $spacing-sm; border-radius: $border-radius; border: 2rpx solid $border-color; font-size: $font-md; }
.option-btn.active { border-color: $primary; color: $primary; background: rgba(255,107,53,0.05); }
.form-switch { display: flex; justify-content: space-between; align-items: center; padding: $spacing-sm 0; margin-bottom: $spacing-md; }
.submit-btn { width: 100%; padding: $spacing-md; background: $primary; color: white; border-radius: $border-radius; font-size: $font-md; }
.submit-btn[disabled] { background: #ccc; }
</style>
