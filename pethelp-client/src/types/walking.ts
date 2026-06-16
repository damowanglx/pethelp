export type WalkingStatus = 'open' | 'matched' | 'in_progress' | 'completed' | 'cancelled';
export type MatchStatus = 'applied' | 'accepted' | 'rejected' | 'cancelled' | 'in_progress' | 'completed' | 'disputed';
export type RewardType = 'free' | 'points' | 'cash';

export interface WalkingRequest {
  id: number;
  ownerId: number;
  petId: number;
  status: WalkingStatus;
  walkDate: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  address: string;
  latitude: number;
  longitude: number;
  rewardType: RewardType;
  rewardAmount: number;
  description: string | null;
  requireExperience: boolean;
  applyCount: number;
  matchedHelperId: number | null;
  owner?: { id: number; nickname: string; avatarUrl: string; ratingAvg: number };
  pet?: { id: number; name: string; breed: string; avatarUrl: string };
  createdAt: string;
}

export interface Match {
  id: number;
  requestId: number;
  helperId: number;
  status: MatchStatus;
  ownerMessage: string | null;
  helperMessage: string | null;
  helper?: { id: number; nickname: string; avatarUrl: string; creditScore: number; ratingAvg: number };
  request?: WalkingRequest;
  createdAt: string;
}
