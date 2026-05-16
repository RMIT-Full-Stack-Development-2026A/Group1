import { useState, useEffect, useRef } from 'react';

const MAX_CHARS = 120;

export default function ChatOverlay({
    isOpen,
    onClose,
    messages,
    typingPlayer,
    playerMark,        
    playerName,
    opponentName,
    onSend,
    onTyping,
    gameOver,
    unreadCount,
    onToggle,
}) {
    const [input, setInput] = useState('');
    const bottomRef = useRef(null);
    const inputRef  = useRef(null);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isOpen]);
    useEffect(() => { if (isOpen) inputRef.current?.focus(); }, [isOpen]);

    const getSenderLabel = (sender) => (sender === playerMark ? playerName : opponentName);
    const isOwn = (sender) => sender === playerMark;
    const opponentIsTyping = typingPlayer !== null && typingPlayer !== playerMark;

    const handleChange = (e) => {
        setInput(e.target.value);
        onTyping(e.target.value.length > 0);
    };

    const handleSend = () => {
        if (!input.trim()) return;
        onSend(playerMark, input);
        setInput('');
        onTyping(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    return (
        <div
            className="fixed my-12 bottom-8 left-6 z-50 flex flex-col items-start gap-2"
        >
            {isOpen && (
                <div
                    className="flex flex-col w-[360px] max-h-[420px]"
                    style={{
                        background: 'rgba(12,12,26,0.96)',
                        border:     '1px solid rgba(76,201,240,0.35)',
                        boxShadow:  '0 0 32px rgba(76,201,240,0.12)',
                    }}
                >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2a30]">
                        <span className="text-[10px] font-bold tracking-widest text-[#4cc9f0] uppercase font-mono">
                            Match Chat
                        </span>
                        <button onClick={onClose} className="text-[#879398] hover:text-[#e3e0f4] text-xs transition-colors">✕</button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0" style={{ maxHeight: '280px' }}>
                        {messages.length === 0 && (
                            <p className="text-[10px] text-[#3d484d] text-center pt-8 uppercase tracking-widest font-mono">
                                No messages yet...
                            </p>
                        )}
                        {messages.map(msg => (
                            <div key={msg.id} className={`flex flex-col ${isOwn(msg.sender) ? 'items-end' : 'items-start'}`}>
                                <span className="text-[8px] text-[#3d484d] mb-1 uppercase tracking-wider font-mono">
                                    {getSenderLabel(msg.sender)} · {msg.ts}
                                </span>
                                <div
                                    className="px-3 py-2 text-[11px] leading-relaxed max-w-[80%] font-mono break-words"
                                    style={{
                                        background: isOwn(msg.sender)
                                            ? 'rgba(123,97,255,0.22)'
                                            : msg.sender === 'BOT'
                                                ? 'rgba(255,61,0,0.15)'
                                                : 'rgba(76,201,240,0.10)',
                                        border: `1px solid ${
                                            isOwn(msg.sender) ? 'rgba(123,97,255,0.4)'
                                            : msg.sender === 'BOT' ? 'rgba(255,61,0,0.3)'
                                            : 'rgba(76,201,240,0.25)'
                                        }`,
                                        color: '#e3e0f4',
                                    }}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}

                        {opponentIsTyping && (
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] text-[#4cc9f0] uppercase tracking-wider font-mono">
                                    {opponentName} is typing
                                </span>
                                {[0, 1, 2].map(i => (
                                    <span
                                        key={i}
                                        className="w-1.5 h-1.5 rounded-full bg-[#4cc9f0] inline-block animate-typing-bounce"
                                        style={{ '--bounce-delay': `${i * 0.2}s` }}
                                    />
                                ))}
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {!gameOver && (
                        <div className="flex items-center gap-2 px-3 py-3 border-t border-[#1e2a30]">
                            <input
                                ref={inputRef}
                                value={input}
                                onChange={handleChange}
                                onKeyDown={handleKeyDown}
                                placeholder="TYPE MSG..."
                                maxLength={MAX_CHARS}
                                className="flex-1 bg-transparent text-[11px] text-[#e3e0f4] placeholder-[#3d484d] outline-none uppercase tracking-wider font-mono"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim()}
                                className="text-[#4cc9f0] text-[10px] font-bold uppercase tracking-widest font-mono disabled:opacity-30 hover:text-white transition-colors"
                            >
                                SEND
                            </button>
                        </div>
                    )}
                </div>
            )}

            <button
                onClick={onToggle}
                className="flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-widest font-mono transition-all hover:scale-105 relative"
                style={{
                    background: unreadCount > 0 ? 'rgba(255,61,0,0.18)' : 'rgba(76,201,240,0.08)',
                    border:     `1px solid ${unreadCount > 0 ? 'rgba(255,61,0,0.6)' : 'rgba(76,201,240,0.3)'}`,
                    color:      unreadCount > 0 ? '#ff3d00' : '#4cc9f0',
                }}
            >
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                    {isOpen ? 'chat_bubble' : 'chat_bubble_outline'}
                </span>
                CHAT
                {unreadCount > 0 && !isOpen && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] rounded-full bg-[#ff3d00] text-white text-[8px] font-bold flex items-center justify-center px-1">
                        {unreadCount}
                    </span>
                )}
            </button>
        </div>
    );
}
