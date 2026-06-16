<template>
  <view class="create-request">
    <form @submit.prevent="handleSubmit">
      <view class="form-section">
        <text class="section-label">选择宠物</text>
        <picker v-if="pets.length" mode="selector" :range="petNames" @change="onPetChange">
          <view class="form-picker">
            {{ selectedPet ? `${selectedPet.name} (${selectedPet.breed})` : '请选择' }}
          </view>
        </picker>
        <navigator v-else url="/pages/profile/pet-create" class="no-pet-hint">
          还没有宠物？点击添加 →
        </navigator>
      </view>

      <view class="form-section">
        <text class="section-label">遛狗日期</text>
        <picker mode="date" :value="form.walkDate" :start="today" @change="onDateChange">
          <view class="form-picker">{{ form.walkDate || '选择日期' }}</view>
        </picker>
      </view>

      <view class="form-row">
        <view class="form-section half">
          <text class="section-label">开始时间</text>
          <picker mode="time" :value="form.startTime" @change="onStartTimeChange">
            <view class="form-picker">{{ form.startTime || '开始' }}</view>
          </picker>
        </view>
        <view class="form-section half">
          <text class="section-label">结束时间</text>
          <picker mode="time" :value="form.endTime" @change="onEndTimeChange">
            <view class="form-picker">{{ form.endTime || '结束' }}</view>
          </picker>
        </view>
      </view>

      <view class="form-section" v-if="form.durationMinutes > 0">
        <text class="section-label">预计时长</text>
        <text class="duration-display">{{ form.durationMinutes }} 分钟</text>
      </view>

      <view class="form-section">
        <text class="section-label">遛狗地点</text>
        <view class="location-picker" @click="chooseLocation">
          <text v-if="form.address">{{ form.address }}</text>
          <text v-else class="placeholder">点击选择地点</text>
          <text class="location-icon">📍</text>
        </view>
      </view>

      <view class="form-section">
        <text class="section-label">备注说明</text>
        <textarea v-model="form.description" placeholder="如：只能在小花园遛，不能去马路边..."
          class="form-textarea" maxlength="500" />
        <text class="char-count">{{ form.description?.length || 0 }}/500</text>
      </view>

      <view class="form-section">
        <text class="section-label">互助类型</text>
        <view class="reward-options">
          <view v-for="opt in rewardOptions" :key="opt.value"
            class="reward-option" :class="{ active: form.rewardType === opt.value }"
            @click="form.rewardType = opt.value; form.rewardAmount = 0">
            {{ opt.label }}
          </view>
        </view>
      </view>

      <button class="submit-btn" :disabled="!isValid" @click="handleSubmit">
        发布遛狗请求
      </button>
    </form>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { petApi } from '@/api/pet';
import { walkingApi } from '@/api/walking';
import type { Pet } from '@/types/pet';

const pets = ref<Pet[]>([]);
const selectedPet = ref<Pet | null>(null);
const today = new Date().toISOString().split('T')[0];

const form = ref({
  petId: 0, walkDate: '', startTime: '', endTime: '',
  durationMinutes: 0, address: '', latitude: 0, longitude: 0,
  rewardType: 'free', rewardAmount: 0, description: '', requireExperience: false,
});

const rewardOptions = [
  { label: '🐾 免费互助', value: 'free' },
  { label: '⭐ 积分感谢', value: 'points' },
];

const petNames = computed(() => pets.value.map((p) => `${p.name} (${p.breed})`));

const isValid = computed(() =>
  form.value.petId > 0 && form.value.walkDate && form.value.startTime
  && form.value.endTime && form.value.address && form.value.durationMinutes >= 15
);

function onPetChange(e: { detail: { value: number } }) {
  selectedPet.value = pets.value[e.detail.value];
  form.value.petId = selectedPet.value.id;
  form.value.durationMinutes = selectedPet.value.walkDurationMin || 30;
}
function onDateChange(e: { detail: { value: string } }) { form.value.walkDate = e.detail.value; }
function onStartTimeChange(e: { detail: { value: string } }) { form.value.startTime = e.detail.value; calcDuration(); }
function onEndTimeChange(e: { detail: { value: string } }) { form.value.endTime = e.detail.value; calcDuration(); }

function calcDuration() {
  if (form.value.startTime && form.value.endTime) {
    const [sh, sm] = form.value.startTime.split(':').map(Number);
    const [eh, em] = form.value.endTime.split(':').map(Number);
    form.value.durationMinutes = Math.max(0, (eh * 60 + em) - (sh * 60 + sm));
  }
}

function chooseLocation() {
  uni.chooseLocation({
    success: (res) => {
      form.value.address = res.name || res.address;
      form.value.latitude = res.latitude;
      form.value.longitude = res.longitude;
    },
    fail: () => uni.showToast({ title: '需要选择地点', icon: 'none' }),
  });
}

async function handleSubmit() {
  if (!isValid.value) return;
  try {
    const res = await walkingApi.createRequest(form.value);
    if (res.success) {
      uni.showToast({ title: '发布成功!', icon: 'success' });
      setTimeout(() => uni.navigateBack(), 1500);
    }
  } catch (e: unknown) {
    uni.showToast({ title: (e as Error).message || '发布失败', icon: 'none' });
  }
}

onMounted(async () => {
  try {
    const res = await petApi.list();
    if (res.success && res.data) pets.value = res.data;
  } catch { /* no pets */ }
});
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
.create-request { padding: $spacing-md; padding-bottom: 160rpx; }
.form-section { margin-bottom: $spacing-md; }
.section-label { font-size: $font-sm; color: $text-secondary; display: block; margin-bottom: $spacing-xs; }
.form-picker { padding: $spacing-sm $spacing-md; background: $bg-white; border-radius: $border-radius; font-size: $font-md; border: 1rpx solid $border-color; }
.form-textarea { width: 100%; min-height: 160rpx; padding: $spacing-sm; background: $bg-white; border-radius: $border-radius; font-size: $font-sm; border: 1rpx solid $border-color; }
.char-count { text-align: right; font-size: $font-xs; color: $text-muted; }
.form-row { display: flex; gap: $spacing-sm; }
.half { flex: 1; }
.duration-display { font-size: $font-xl; font-weight: 600; color: $primary; }
.location-picker { display: flex; align-items: center; padding: $spacing-sm $spacing-md; background: $bg-white; border: 1rpx dashed $primary; border-radius: $border-radius; }
.location-icon { margin-left: auto; font-size: 32rpx; }
.placeholder { color: $text-muted; }
.reward-options { display: flex; gap: $spacing-sm; }
.reward-option { flex: 1; text-align: center; padding: $spacing-sm; border-radius: $border-radius; border: 2rpx solid $border-color; font-size: $font-sm; }
.reward-option.active { border-color: $primary; color: $primary; background: rgba(255,107,53,0.05); }
.submit-btn { width: 100%; padding: $spacing-md; background: $primary; color: white; border-radius: $border-radius; font-size: $font-md; margin-top: $spacing-lg; }
.submit-btn[disabled] { background: #ccc; }
.no-pet-hint { color: $primary; font-size: $font-sm; padding: $spacing-sm 0; }
</style>
