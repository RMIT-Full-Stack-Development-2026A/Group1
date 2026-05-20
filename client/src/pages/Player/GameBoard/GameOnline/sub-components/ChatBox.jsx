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
    <div className="fixed top-20 left-6 z-[60] flex flex-col items-start gap-2">
      {isChatOpen && (
        <div
          className="
            flex flex-col
            w-[380px]
            max-h-[500px]
            bg-[#12121f]/95
            backdrop-blur-md
            border border-[#3d484d]
            shadow-[0_0_25px_rgba(0,0,0,0.5)]
            "
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#3d484d]">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-[#4cc9f0]" />
              <span className="font-headline text-[10px] text-[#4cc9f0] tracking-widest">MATCH CHAT</span>
            </div>
            <button onClick={toggleChat} className="text-[#879398] hover:text-on-surface text-xs transition-colors font-mono">✕</button>
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
                  className={`px-3 py-2 font-mono text-[11px] leading-relaxed max-w-[80%] break-words text-on-surface ${msg.isOwn ? 'bg-[#123348]/90 border border-[#4cc9f0]/40 shadow-[0_0_10px_rgba(76,201,240,0.15)]'
                    : 'bg-[#232337]/90 border border-[#3d484d] shadow-[2px_2px_0px_#161621]'}`}
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
              className="
                flex-1
                bg-[#1a1a2b]
                border border-[#3d484d]
                text-[#d7e3ea]
                font-mono text-[11px]
                px-3 py-2
                placeholder:text-[#6f7b80]
                focus:outline-none
                focus:border-[#4cc9f0]
                transition-colors
                "
            />
            <button
              onClick={handleSend}
              className="
                border border-[#4cc9f0]
                text-[#4cc9f0]
                bg-[#4cc9f0]/5
                font-headline text-[9px]
                px-4 py-2
                hover:bg-[#4cc9f0]/15
                hover:shadow-[0_0_10px_rgba(76,201,240,0.2)]
                transition-all
                "
            >
              SEND
            </button>
          </div>
        </div>
      )}

      <button
        onClick={toggleChat}
        type="button"
        className="relative flex items-center text-[#3b2f00] cursor-pointer gap-2 border border-[#3d484d] bg-[#1e1e2c] px-4 py-2 font-headline text-[11px] text-[#bcc8ce] hover:border-[#4cc9f0] hover:text-[#4cc9f0] transition-all shadow-[2px_2px_0px_#343342]"
      >
        CHAT
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-[#fad100] text-[#3b2f00] font-headline text-[8px] px-1.5 py-0.5 min-w-[18px] text-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}
