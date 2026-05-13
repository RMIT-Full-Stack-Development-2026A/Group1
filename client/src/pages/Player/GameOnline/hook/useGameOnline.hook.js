import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSocketStore } from '@/stores/socket/SocketStore';
import { useCustomizationStore } from '@/stores/game/CustomizationStore';

export const useGameOnline = () => {

    const { roomId } = useParams();
    const navigate = useNavigate();
    const { socket, isConnected, connectSocket } = useSocketStore();
    const { setCustomization } = useCustomizationStore();

    const [roomData, setRoomData] = useState(null);
    const [isConnecting, setIsConnecting] = useState(true);
    const [error, setError] = useState(null);
    const [isHydrated, setIsHydrated] = useState(false);
    const [disconnectCountdown, setDisconnectCountdown] = useState(null);

    const disconnectIntervalRef = useRef(null);
    const roomDataRef = useRef(null);

    // ─────────────────────────────────────────────────────────────
    // FIX BUG #3: Không dùng hasJoinedRef để gate nữa.
    // Thay vào đó dùng joinedRoomIdRef để track roomId đã join.
    // Điều này tránh double-emit khi socket reconnect nhưng
    // roomId không đổi.
    // ─────────────────────────────────────────────────────────────
    const joinedRoomIdRef = useRef(null);

    // Sync roomDataRef với roomData state để dùng trong cleanup (không stale closure)
    useEffect(() => {
        roomDataRef.current = roomData;
    }, [roomData]);

    // Reset toàn bộ state khi roomId thay đổi (user vào phòng khác)
    useEffect(() => {
        setIsHydrated(false);
        setRoomData(null);
        setIsConnecting(true);
        setError(null);
        setDisconnectCountdown(null);
        joinedRoomIdRef.current = null; // Reset để phòng mới có thể join
    }, [roomId]);

    // ─────────────────────────────────────────────────────────────
    // FIX BUG #4: Xử lý beforeunload đúng — emit room:leave
    // cho cả WAITING, READY, PLAYING (bất kỳ active status nào).
    // ─────────────────────────────────────────────────────────────
    useEffect(() => {
        const handleBeforeUnload = () => {
            const currentRoom = roomDataRef.current;
            const activeStatuses = ['WAITING', 'READY', 'PLAYING'];
            const { socket: currentSocket } = useSocketStore.getState();

            if (currentSocket?.connected && currentRoom?.id && activeStatuses.includes(currentRoom?.status)) {
                currentSocket.emit('room:leave', { roomId: currentRoom.id });
            }
        };

        // Dùng 'pagehide' thay vì 'beforeunload' — reliable hơn trên mobile và một số browser
        window.addEventListener('pagehide', handleBeforeUnload);
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('pagehide', handleBeforeUnload);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    // Khởi động socket nếu chưa connect
    useEffect(() => {
        if (!isConnected) connectSocket();
    }, [isConnected, connectSocket]);

    // ─────────────────────────────────────────────────────────────
    // FIX BUG #1 + #2 + #3: Hợp nhất toàn bộ logic join + listeners
    // vào MỘT Effect duy nhất.
    //
    // Lý do:
    // - Tránh race condition giữa socket.once (Effect B) và socket.on (Effect C)
    // - Tránh cleanup của Effect này xóa nhầm listener của Effect kia
    // - Dùng joinedRoomIdRef để chỉ emit room:join đúng 1 lần per roomId,
    //   kể cả khi socket object thay đổi (reconnect)
    // ─────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!socket || !isConnected || !roomId) return;
        console.log('[useGameOnline] Socket ready, attempting to join:', roomId);
        // ── SETUP TẤT CẢ LISTENERS TRƯỚC ──
        // Quan trọng: đăng ký listeners TRƯỚC khi emit room:join
        // để không bao giờ bỏ lỡ response từ server

        let joinTimeoutId = null;

        function handleRoomUpdated(payload) {
            console.log('[useGameOnline] RECEIVED room:updated:', payload);
            // Xóa join timeout khi nhận được update đầu tiên
            if (joinTimeoutId) {
                clearTimeout(joinTimeoutId);
                joinTimeoutId = null;
            }
            setRoomData(payload.room);
            setIsConnecting(false);
            setError(null);
        }

        function handleRoomRemoved() {
            navigate('/lobby');
        }

        function handlePlayerDisconnected(payload) {
            setDisconnectCountdown(payload.timeLeft);
            if (disconnectIntervalRef.current) {
                clearInterval(disconnectIntervalRef.current);
            }
            disconnectIntervalRef.current = setInterval(() => {
                setDisconnectCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(disconnectIntervalRef.current);
                        disconnectIntervalRef.current = null;
                        return null;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        function handlePlayerReconnected() {
            setDisconnectCountdown(null);
            if (disconnectIntervalRef.current) {
                clearInterval(disconnectIntervalRef.current);
                disconnectIntervalRef.current = null;
            }
        }

        function handleServerError(payload) {
            console.error('[useGameOnline] SERVER ERROR:', payload);
            const msg = payload?.message || '';
            const lower = msg.toLowerCase();
            const isRoomError =
                lower.includes('not found') ||
                lower.includes('is full') ||
                lower.includes('is closed') ||
                lower.includes('does not exist');

            if (isRoomError) {
                if (joinTimeoutId) {
                    clearTimeout(joinTimeoutId);
                    joinTimeoutId = null;
                }
                setError(msg);
                setTimeout(() => navigate('/lobby'), 2000);
            }
            // Premium/chat errors: để useChat.hook.js xử lý riêng
        }

        // Đăng ký listeners
        socket.on('room:updated', handleRoomUpdated);
        socket.on('room:removed', handleRoomRemoved);
        socket.on('player:disconnected', handlePlayerDisconnected);
        socket.on('player:reconnected', handlePlayerReconnected);
        socket.on('error', handleServerError);

        // ── EMIT room:join SAU KHI LISTENERS ĐÃ ĐĂNG KÝ ──
        // FIX BUG #3: Chỉ emit nếu chưa join roomId này
        if (joinedRoomIdRef.current !== roomId) {
            joinedRoomIdRef.current = roomId;

            // Ghost Room Timeout: nếu 10s không nhận room:updated → redirect
            joinTimeoutId = setTimeout(() => {
                setError('Phòng không tồn tại hoặc đã đóng.');
                setTimeout(() => navigate('/lobby'), 2000);
            }, 10000);

            socket.emit('room:join', { roomId }); 
            console.log('[useGameOnline] Emitting room:join...');
        }

        // ── CLEANUP ──
        return () => {
            if (joinTimeoutId) clearTimeout(joinTimeoutId);

            socket.off('room:updated', handleRoomUpdated);
            socket.off('room:removed', handleRoomRemoved);
            socket.off('player:disconnected', handlePlayerDisconnected);
            socket.off('player:reconnected', handlePlayerReconnected);
            socket.off('error', handleServerError);

            if (disconnectIntervalRef.current) {
                clearInterval(disconnectIntervalRef.current);
                disconnectIntervalRef.current = null;
            }
        };
    }, [socket, isConnected, roomId, navigate]);

    // Hydration: bơm data vào CustomizationStore khi bắt đầu PLAYING
    // isHydrated flag đảm bảo OnlineArena không render trước khi store ready
    useEffect(() => {
        if (roomData?.status === 'PLAYING' && !isHydrated) {
            const sizeStr = `${roomData.boardSize}x${roomData.boardSize}`;
            const styleMap = { CLASSIC: 'classic', NEON: 'neon', DARK: 'block' };
            setCustomization(sizeStr, styleMap[roomData.boardStyle] || 'classic', 3);
            setIsHydrated(true);
        }
    }, [roomData?.status, isHydrated, setCustomization]);

    // Cleanup khi component unmount: emit room:leave
    useEffect(() => {
        return () => {
            const currentRoom = roomDataRef.current;
            const activeStatuses = ['WAITING', 'READY', 'PLAYING'];
            if (socket && activeStatuses.includes(currentRoom?.status)) {
                socket.emit('room:leave', { roomId: currentRoom?.id || roomId });
            }
        };
    }, [socket, roomId]);

    const handleReady = useCallback(() => {
        if (!socket || !roomData?.id) return;
        socket.emit('room:ready', { roomId: roomData.id });
    }, [socket, roomData?.id]);

    const handleLeaveRoom = useCallback(() => {
        if (socket) socket.emit('room:leave', { roomId: roomData?.id || roomId });
        navigate('/lobby');
    }, [socket, roomData?.id, roomId, navigate]);

    return {
        roomData,
        isConnecting,
        isHydrated,
        error,
        disconnectCountdown,
        handleReady,
        handleLeaveRoom,
    };
};