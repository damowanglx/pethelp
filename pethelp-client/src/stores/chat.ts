import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { ChatMessage, Conversation } from '@/types/chat';

export const useChatStore = defineStore('chat', () => {
  const conversations = ref<Conversation[]>([]);
  const activeMessages = ref<Record<string, ChatMessage[]>>({});
  const unreadCount = ref(0);

  function setConversations(list: Conversation[]) {
    conversations.value = list;
    unreadCount.value = list.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  }

  function setMessages(matchId: number, messages: ChatMessage[]) {
    activeMessages.value[String(matchId)] = messages;
  }

  function addMessage(matchId: number, message: ChatMessage) {
    const key = String(matchId);
    if (!activeMessages.value[key]) {
      activeMessages.value[key] = [];
    }
    activeMessages.value[key].push(message);
  }

  function decrementUnread() {
    if (unreadCount.value > 0) unreadCount.value--;
  }

  return { conversations, activeMessages, unreadCount, setConversations, setMessages, addMessage, decrementUnread };
});
