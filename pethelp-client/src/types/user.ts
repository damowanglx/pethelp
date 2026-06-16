export type UserRole = 'pet_owner' | 'helper' | 'both';

export interface User {
  id: number;
  openid: string;
  nickname: string | null;
  avatarUrl: string | null;
  phone: string | null;
  role: UserRole;
  gender: number;
  city: string | null;
  province: string | null;
  creditScore: number;
  completionCount: number;
  cancellationCount: number;
  completionRate: number;
  isHelper: boolean;
  hasDeposit: boolean;
  completedWalks: number;
  ratingAvg: number;
  createdAt: string;
}

export interface LoginResult {
  accessToken: string;
  user: Pick<User, 'id' | 'nickname' | 'avatarUrl' | 'role' | 'creditScore'>;
}
