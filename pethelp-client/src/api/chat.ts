import { api } from './request';

export const chatApi = {
  getConversations: () => api.get('/chat/conversations'),
  getMessages: (matchId: number, page = 1, limit = 50) =>
    api.get(`/chat/matches/${matchId}/messages?page=${page}&limit=${limit}`),
  sendMessage: (matchId: number, receiverId: number, content: string, msgType = 'text') =>
    api.post(`/chat/matches/${matchId}/messages`, { content, receiverId, msgType }),
  markRead: (messageId: number) => api.patch(`/chat/messages/${messageId}/read`),
};
