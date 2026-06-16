import { useUserStore } from '@/stores/user';

const BASE_URL = process.env.VITE_API_BASE || 'http://localhost:3000/api/v1';

interface RequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  data?: Record<string, unknown>;
  header?: Record<string, string>;
  skipAuth?: boolean;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

async function request<T = unknown>(options: RequestOptions): Promise<ApiResponse<T>> {
  const userStore = useUserStore();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.header,
  };

  if (!options.skipAuth && userStore.accessToken) {
    headers['Authorization'] = `Bearer ${userStore.accessToken}`;
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}${options.url}`,
      method: options.method || 'GET',
      data: options.data,
      header: headers,
      success: (res) => {
        const statusCode = res.statusCode;
        if (statusCode >= 200 && statusCode < 300) {
          resolve(res.data as ApiResponse<T>);
        } else if (statusCode === 401) {
          userStore.logout();
          uni.reLaunch({ url: '/pages/index/index' });
          reject(new Error('Authentication required'));
        } else {
          const errorData = res.data as ApiResponse;
          reject(new Error(errorData?.error || `Request failed with status ${statusCode}`));
        }
      },
      fail: (err) => {
        uni.showToast({ title: '网络请求失败', icon: 'none' });
        reject(err);
      },
    });
  });
}

export const api = {
  get: <T = unknown>(url: string, skipAuth?: boolean) =>
    request<T>({ url, method: 'GET', skipAuth }),

  post: <T = unknown>(url: string, data?: Record<string, unknown>, skipAuth?: boolean) =>
    request<T>({ url, method: 'POST', data, skipAuth }),

  patch: <T = unknown>(url: string, data?: Record<string, unknown>) =>
    request<T>({ url, method: 'PATCH', data }),

  delete: <T = unknown>(url: string) =>
    request<T>({ url, method: 'DELETE' }),
};

export type { ApiResponse, RequestOptions };
export { request, BASE_URL };
