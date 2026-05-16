import { useState, useCallback, useEffect, useRef } from 'react';

const BOT_TAUNTS = {
    SINGLE_PLAYER: [
        'Processing your defeat... ETA: 3 moves.',
        'ANALYSIS COMPLETE: You have a 3% win probability.',
        'ERROR 404: Threat not found.',
        'My neural net has not been this bored since tutorial mode.',
        'I have seen better strategies from my error logs.',
        'Calculating optimal humiliation sequence...',
        'You play like a random number generator.',
        'Initiating mercy protocol... just kidding.',
    ],
    ONLINE_MATCH: [
        'Bold strategy. Let us see if it pays off.',
        'I have studied your move pattern. It is... something.',
        'You sure about that one?',
        'That is a move alright.',
        'Interesting. Very interesting.',
        'Did you mean to do that?',
        'One of us is having fun.',
    ],
    LOCAL_MULTIPLAYER: [
        'One of you is clearly better. We all know who.',
        'The tension here is palpable.',
        'Plot twist incoming.',
        'Someone is getting carried.',
    ],
};

const BOT_FIRST_DELAY_MS    = 5_000;
const BOT_INTERVAL_MS       = 18_000;
const CHAT_ENABLED_MODES    = new Set(['SINGLE_PLAYER', 'ONLINE_MATCH']);

let _msgId = 0;
const makeMessage = (sender, text) => ({
    id:     ++_msgId,
    sender,
    text,
    ts:     new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
});

/**
 * useChatManager — manages all chat state and bot behaviour.
 * @param {string} gameMode  - 'SINGLE_PLAYER' | 'ONLINE_MATCH' | 'LOCAL_MULTIPLAYER' | 'TWO_PLAYERS'
 * @param {string} playerMark - 'X' (the human player's mark)
 * @param {boolean} gameOver
 */

export const useChatManager = (gameMode, playerMark, gameOver) => {
    const [messages,      setMessages]      = useState([]);
    const [typingPlayer,  setTypingPlayer]  = useState(null); // 'X' | 'O' | null
    const [chatOpen,      setChatOpen]      = useState(false);
    const [unreadCount,   setUnreadCount]   = useState(0);
    const tauntIndexRef = useRef(0);
    const isChatEnabled = CHAT_ENABLED_MODES.has(gameMode);

    // ── Bot taunts ────────────────────────────────────────────────────────────
    useEffect(() => {
        if (gameMode !== 'SINGLE_PLAYER' || gameOver || !isChatEnabled) return;

        const pool = BOT_TAUNTS.SINGLE_PLAYER;
        const fire = () => {
            const text = pool[tauntIndexRef.current % pool.length];
            tauntIndexRef.current++;
            setMessages(prev => [...prev, makeMessage('BOT', text)]);
            setChatOpen(prev => {
                if (!prev) setUnreadCount(count => count + 1);
                return prev;
            });
        };

        const first    = setTimeout(fire, BOT_FIRST_DELAY_MS);
        const interval = setInterval(fire,  BOT_INTERVAL_MS);
        return () => { clearTimeout(first); clearInterval(interval); };
    }, [gameMode, gameOver, isChatEnabled]);

    const sendMessage = useCallback((sender, text) => {
        const trimmed = text.trim();
        if (!trimmed) return;
        setMessages(prev => [...prev, makeMessage(sender, trimmed)]);
    }, []);

    const setTyping = useCallback((player, isTyping) => {
        setTypingPlayer(isTyping ? player : null);
    }, []);

    const toggleChat = useCallback(() => {
        setChatOpen(open => {
            if (!open) setUnreadCount(0);
            return !open;
        });
    }, []);

    return {
        messages,
        typingPlayer,
        chatOpen,
        unreadCount,
        isChatEnabled,
        sendMessage,
        setTyping,
        toggleChat,
    };
};
