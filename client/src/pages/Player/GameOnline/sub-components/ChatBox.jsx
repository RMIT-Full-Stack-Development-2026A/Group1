import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/auth/AuthStore';
import { useChat } from '../hook/useChat.hook';

export default function ChatBox({ roomId, currentUserId, currentUsername }) {
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const { user } = useAuthStore();
  const { messages, isChatOpen, unreadCount, sendError, toggleChat, sendMessage } = useChat(roomId);

  const formatTimestamp = (iso) => {
    try {
      return new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--:--';
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isChatOpen]);

  useEffect(() => {
    if (isChatOpen) inputRef.current?.focus();
  }, [isChatOpen]);

  return (
    <div className="fixed top-20 left-6 z-40 flex flex-col items-start gap-2">
      {isChatOpen && (
        <div
          className="flex flex-col w-[360px] max-h-[420px] bg-surface-container-lowest border border-outline-variant shadow-glow-primary-sm"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant">
            <span className="font-headline text-[9px] text-primary tracking-widest">MATCH CHAT</span>
            <button onClick={toggleChat} className="text-on-surface-variant hover:text-on-surface text-xs transition-colors">✕</button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0 max-h-[260px]">
            {messages.length === 0 && (
              <p className="font-mono text-[9px] text-outline text-center pt-8 uppercase tracking-widest">No messages yet...</p>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.isOwn ? 'items-end' : 'items-start'}`}>
                <span className="font-mono text-[8px] text-outline mb-1 uppercase tracking-wider">
                  {msg.senderName} · {formatTimestamp(msg.timestamp)}
                </span>
                <div
                    className={`px-3 py-2 font-mono text-[11px] leading-relaxed max-w-[80%] break-words text-on-surface ${msg.isOwn ? 'bg-own-purple border border-own-purple-border' : 'bg-chat-bubble border border-chat-border'}`}
                >
                  {msg.message}
                </div>
              </div>
            ))}

            <div ref={bottomRef} />
          </div>

          {sendError && (
            <div className="px-4 py-2 border-t border-error/30 bg-error-container/20">
              <p className="font-mono text-[9px] text-error uppercase tracking-widest">{sendError}</p>
            </div>
          )}

          <div className="flex items-center gap-2 px-3 py-3 border-t border-outline-variant">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={user?.isPremium ? 'TYPE MSG...' : 'VIP ONLY — UPGRADE TO CHAT'}
              maxLength={500}
              className="flex-1 bg-surface-container-high border border-outline-variant text-on-surface font-mono text-[11px] px-3 py-2 placeholder:text-outline focus:outline-none focus:border-primary"
            />
            <button
              onClick={handleSend}
              className="border border-primary text-primary font-headline text-[8px] px-3 py-2 hover:bg-primary/10 transition-all"
            >
              SEND
            </button>
          </div>
        </div>
      )}

      <button
        onClick={toggleChat}
        className="relative flex items-center gap-2 border border-outline-variant bg-surface-container px-4 py-2 font-mono text-[10px] text-on-surface-variant hover:border-primary hover:text-primary transition-all"
      >
        CHAT
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-secondary-container text-on-secondary font-headline text-[7px] px-1.5 py-0.5 min-w-[18px] text-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}
