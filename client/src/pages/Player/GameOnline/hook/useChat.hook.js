import { useState, useEffect, useCallback } from 'react';
import { useSocketStore } from '@/stores/socket/SocketStore';
import { useAuthStore } from '@/stores/auth/AuthStore';
import useChatStore from '@/stores/online/ChatStore';

export const useChat = (roomId) => {
  const { socket } = useSocketStore();
  const { user } = useAuthStore();
  const {
    messages,
    isChatOpen,
    unreadCount,
    addMessage,
    clearMessages,
    toggleChat,
  } = useChatStore();
  const [sendError, setSendError] = useState(null);

  useEffect(() => {
    if (!socket || !roomId) return;

    function handleChatMessage(payload) {
      const { sender, message, timestamp } = payload;

      addMessage({
        id: `${timestamp}-${sender.userId}`,
        senderId: sender.userId,
        senderName: sender.usernameSnapshot,
        message,
        timestamp,
        isOwn: sender.userId === user?.id,
      });
    }

    function handleChatError(payload) {
      const msg = payload?.message || '';
      if (msg.toLowerCase().includes('premium')) {
        setSendError(msg);
        setTimeout(() => setSendError(null), 4000);
      }
    }

    socket.on('chat:message', handleChatMessage);
    socket.on('error', handleChatError);

    return () => {
      socket.off('chat:message', handleChatMessage);
      socket.off('error', handleChatError);
    };
  }, [socket, roomId, user?.id, addMessage]);

  useEffect(() => {
    return () => {
      clearMessages();
    };
  }, [roomId, clearMessages]);

  const sendMessage = useCallback(
    (text) => {
      if (!text?.trim() || !roomId) return;

      if (!user?.isPremium) {
        setSendError('Chat is a Premium feature. Upgrade to unlock it!');
        setTimeout(() => setSendError(null), 4000);
        return;
      }

      if (!socket) return;

      socket.emit('chat:send', { roomId, message: text.trim() });
    },
    [socket, roomId, user?.isPremium]
  );

  return { messages, isChatOpen, unreadCount, sendError, toggleChat, sendMessage };
};