<template>
  <view class="cert-apply">
    <view class="step-header">
      <text class="step-title">🐾 帮养人经验认证</text>
      <text class="step-desc">完成认证后，你的申请将更容易被宠主接受</text>
    </view>

    <view class="form-section">
      <text class="section-label">认证类型</text>
      <picker mode="selector" :range="certTypes" @change="(e: any) => form.certType = ['pet_experience','medical','first_aid'][e.detail.value]">
        <view class="form-picker">{{ certTypes.find(c => c.value === form.certType)?.label || '选择' }}</view>
      </picker>
    </view>

    <view class="form-section">
      <text class="section-label">养宠经验 (年)</text>
      <view class="year-picker">
        <input v-model.number="form.years" class="form-input" type="number" placeholder="0" />
        <text class="year-unit">年</text>
      </view>
    </view>

    <view class="form-section">
      <text class="section-label">养过哪些品种</text>
      <view class="species-tags">
        <view v-for="s in form.speciesExperience" :key="s.species" class="species-tag" @click="removeSpecies(s.species)">
          {{ s.species }} {{ s.years }}年 ✕
        </view>
        <view class="add-species" @click="addSpecies">+ 添加品种</view>
      </view>
    </view>

    <view class="form-section">
      <text class="section-label">自我介绍</text>
      <textarea v-model="form.selfDescription" class="form-textarea" placeholder="介绍一下你的养宠经历，让宠主更了解你..." maxlength="2000" />
    </view>

    <button class="submit-btn" :disabled="!isValid" @click="handleSubmit">
      提交认证申请
    </button>
    <text class="hint">提交后由管理员审核，1-3个工作日内回复</text>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { trustApi } from '@/api/trust';

interface SpeciesExp { species: string; years: number; count: number }

const form = ref({
  certType: 'pet_experience',
  years: 0,
  speciesExperience: [] as SpeciesExp[],
  selfDescription: '',
  proofPhotos: [] as string[],
});

const certTypes = [
  { label: '🐾 养宠经验认证', value: 'pet_experience' },
  { label: '💊 医疗护理认证', value: 'medical' },
  { label: '🏥 急救知识认证', value: 'first_aid' },
];

const isValid = computed(() => form.value.years > 0 || form.value.speciesExperience.length > 0);

function addSpecies() {
  uni.showModal({ title: '添加品种', content: '请输入品种名称和饲养年数', editable: true, placeholderText: '金毛 3' })
    .then((res) => {
      if (res.confirm && res.content) {
        const parts = res.content.trim().split(/\s+/);
        const species = parts[0];
        const years = parseInt(parts[1]) || 0;
        if (species) {
          form.value.speciesExperience.push({ species, years, count: 1 });
        }
      }
    });
}

function removeSpecies(species: string) {
  form.value.speciesExperience = form.value.speciesExperience.filter(s => s.species !== species);
}

async function handleSubmit() {
  if (!isValid.value) return;
  try {
    const res = await trustApi.applyCertification({
      certType: form.value.certType,
      speciesExperience: form.value.speciesExperience.length > 0 ? form.value.speciesExperience : undefined,
      years: form.value.years,
      selfDescription: form.value.selfDescription,
    });
    if (res.success) {
      uni.showToast({ title: '申请已提交', icon: 'success' });
      setTimeout(() => uni.navigateBack(), 1500);
    }
  } catch (e: unknown) {
    uni.showToast({ title: (e as Error).message, icon: 'none' });
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
.cert-apply { padding: $spacing-md; }
.step-header { margin-bottom: $spacing-lg; }
.step-title { font-size: $font-xl; font-weight: 700; display: block; }
.step-desc { font-size: $font-sm; color: $text-muted; margin-top: $spacing-xs; display: block; }
.form-section { margin-bottom: $spacing-md; }
.section-label { font-size: $font-sm; color: $text-secondary; display: block; margin-bottom: $spacing-xs; }
.form-input { padding: $spacing-sm $spacing-md; background: $bg-white; border-radius: $border-radius; font-size: $font-md; border: 1rpx solid $border-color; }
.form-picker { padding: $spacing-sm $spacing-md; background: $bg-white; border-radius: $border-radius; border: 1rpx solid $border-color; }
.form-textarea { width: 100%; min-height: 160rpx; padding: $spacing-sm; background: $bg-white; border-radius: $border-radius; font-size: $font-sm; border: 1rpx solid $border-color; }
.year-picker { display: flex; align-items: center; gap: $spacing-sm; }
.year-picker .form-input { width: 120rpx; }
.year-unit { font-size: $font-md; color: $text-secondary; }
.species-tags { display: flex; flex-wrap: wrap; gap: $spacing-sm; }
.species-tag { padding: $spacing-xs $spacing-sm; background: rgba(255,107,53,0.1); color: $primary; border-radius: 20rpx; font-size: $font-sm; }
.add-species { padding: $spacing-xs $spacing-sm; border: 1rpx dashed $primary; color: $primary; border-radius: 20rpx; font-size: $font-sm; }
.submit-btn { width: 100%; padding: $spacing-md; background: $primary; color: white; border-radius: $border-radius; font-size: $font-md; margin-top: $spacing-lg; }
.submit-btn[disabled] { background: #ccc; }
.hint { text-align: center; font-size: $font-xs; color: $text-muted; margin-top: $spacing-sm; display: block; }
</style>
