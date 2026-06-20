const BASE_URL = 'http://43.138.0.88:3000/api/v1';
// TODO: switch to https://pethelp.cloud/api/v1 after ICP filing approved

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
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.header,
  };

  if (!options.skipAuth) {
    const token = uni.getStorageSync('pethelp_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  // Manually stringify to avoid mini program data serialization issues
  const payload = options.data ? JSON.stringify(options.data) : undefined;

  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}${options.url}`,
      method: options.method || 'GET',
      data: payload,
      header: headers,
      success: (res) => {
        const statusCode = res.statusCode;
        if (statusCode >= 200 && statusCode < 300) {
          resolve(res.data as ApiResponse<T>);
        } else if (statusCode === 401) {
          uni.removeStorageSync('pethelp_token');
          uni.showToast({ title: '请先登录', icon: 'none' });
          // Navigate to profile for login after short delay
          setTimeout(() => {
            uni.switchTab({ url: '/pages/profile/profile' });
          }, 800);
          reject(new Error('请先登录'));
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
