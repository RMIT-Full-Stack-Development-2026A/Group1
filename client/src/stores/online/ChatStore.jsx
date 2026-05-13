import { create } from 'zustand';

const useChatStore = create((set) => ({
  messages: [],
  unreadCount: 0,
  isChatOpen: false,

  addMessage: (msg) =>
    set((state) => {
      const newMessages = [...state.messages, msg];
      const newUnreadCount =
        state.isChatOpen === false ? state.unreadCount + 1 : state.unreadCount;
      return {
        messages: newMessages,
        unreadCount: newUnreadCount,
      };
    }),

  clearMessages: () =>
    set({
      messages: [],
      unreadCount: 0,
    }),

  toggleChat: () =>
    set((state) => ({
      isChatOpen: !state.isChatOpen,
      unreadCount: !state.isChatOpen ? 0 : state.unreadCount,
    })),

  openChat: () =>
    set({
      isChatOpen: true,
      unreadCount: 0,
    }),

  closeChat: () =>
    set({
      isChatOpen: false,
    }),
}));

export default useChatStore;
