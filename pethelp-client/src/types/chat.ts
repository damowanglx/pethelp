export type MessageType = 'text' | 'image' | 'location' | 'system';

export interface ChatMessage {
  id: number;
  matchId: number;
  senderId: number;
  receiverId: number;
  msgType: MessageType;
  content: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  sender?: {
    id: number;
    nickname: string;
    avatarUrl: string;
  };
}

export interface Conversation {
  matchId: number;
  matchStatus: string;
  otherUser: {
    id: number;
    nickname: string;
    avatarUrl: string;
  };
  lastMessage: ChatMessage | null;
  unreadCount: number;
  updatedAt: string;
}
