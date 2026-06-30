import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User, UserRole, LoginResult } from '@/types/user';
import { api } from '@/api/request';

export const useUserStore = defineStore('user', () => {
  const profile = ref<User | null>(null);
  const accessToken = ref<string | null>(null);
  const isLoggedIn = ref(false);
  const currentRole = ref<UserRole>('both');

  const isHelper = computed(() =>
    isLoggedIn.value && (currentRole.value === 'helper' || currentRole.value === 'both')
  );

  function checkLogin() {
    const stored = uni.getStorageSync('pethelp_token');
    if (stored) {
      accessToken.value = stored;
      isLoggedIn.value = true;
      fetchProfile();
    }
  }

  async function login(code: string, nickname?: string, avatarUrl?: string) {
    try {
      const res = await api.post<LoginResult>('/auth/login', { code, nickname, avatarUrl }, true);
      if (res.success && res.data) {
        accessToken.value = res.data.accessToken;
        isLoggedIn.value = true;
        profile.value = res.data.user as User;
        currentRole.value = res.data.user.role;
        uni.setStorageSync('pethelp_token', res.data.accessToken);
        uni.showToast({ title: '登录成功', icon: 'success' });
        // Switch to home after login
        setTimeout(() => uni.reLaunch({ url: '/pages/index/index' }), 800);
      } else {
        uni.showToast({ title: '登录失败', icon: 'none' });
      }
    } catch (e: unknown) {
      uni.showToast({ title: (e as Error).message || '登录失败', icon: 'none' });
    }
  }

  async function fetchProfile() {
    try {
      const res = await api.get<User>('/users/me');
      if (res.success && res.data) {
        profile.value = res.data;
        currentRole.value = res.data.role as UserRole;
      }
    } catch {
      // Token expired or invalid — handled by interceptor
    }
  }

  async function switchRole(role: UserRole) {
    await api.patch('/users/me/role', { activeRole: role });
    currentRole.value = role;
  }

  function logout() {
    accessToken.value = null;
    isLoggedIn.value = false;
    profile.value = null;
    currentRole.value = 'both';
    uni.removeStorageSync('pethelp_token');
  }

  return {
    profile, accessToken, isLoggedIn, currentRole, isHelper,
    checkLogin, login, fetchProfile, switchRole, logout,
  };
});
