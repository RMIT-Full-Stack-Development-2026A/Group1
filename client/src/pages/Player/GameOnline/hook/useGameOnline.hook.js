import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useSocketStore } from '@/stores/socket/SocketStore';
import { useCustomizationStore } from '@/stores/game/CustomizationStore';

export const useGameOnline = () => {
    const location = useLocation();
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

    const joinedRoomIdRef = useRef(null);

    useEffect(() => {
        roomDataRef.current = roomData;
    }, [roomData]);

    useEffect(() => {
        setIsHydrated(false);
        setRoomData(null);
        setIsConnecting(true);
        setError(null);
        setDisconnectCountdown(null);
        // joinedRoomIdRef.current = null; // commented out idk why but does this will work
    }, [roomId]);

    useEffect(() => {
        const initialData = location.state?.initialRoomData;
        if (initialData && (initialData.id === roomId || initialData.roomId === roomId)) {
            console.log('[useGameOnline] Using initialRoomData from router state');
            setRoomData(initialData);
            setIsConnecting(false);
        }
    }, [location.state, roomId]);

    useEffect(() => {
        const handleBeforeUnload = () => {
            const currentRoom = roomDataRef.current;
            const activeStatuses = ['WAITING', 'READY', 'PLAYING'];
            const { socket: currentSocket } = useSocketStore.getState();

            if (currentSocket?.connected && currentRoom?.id && activeStatuses.includes(currentRoom?.status)) {
                currentSocket.emit('room:leave', { roomId: currentRoom.id });
            }
        };

        // Listen to both pagehide and beforeunload for better reliability across browsers
        window.addEventListener('pagehide', handleBeforeUnload);
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('pagehide', handleBeforeUnload);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    // init socket connection on mount
    useEffect(() => {
        if (!isConnected) connectSocket();
    }, [isConnected, connectSocket]);

    useEffect(() => {
        if (!socket || !isConnected || !roomId) return;
        console.log('[useGameOnline] Socket ready, attempting to join:', roomId);
        // join logic 

        let joinTimeoutId = null;

        function handleRoomUpdated(payload) {
            console.log('[useGameOnline] RECEIVED room:updated:', payload);
            // Delete this log after confirming payload structure is correct and consistent with backend
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
            const msg = payload?.message || payload?.error || '';

            // If is "already in this room" error, it means we successfully rejoined after a disconnect, so we can clear the timeout and just set connecting to false without showing an error
            if (msg.includes('already in this room')) {
                console.log('[useGameOnline] Already in room, forcing connection state to ready');
                setIsConnecting(false);
                return;
            }

            // any other error related to joining should be shown as error message and redirect after a delay
            const lower = msg.toLowerCase();
            const isFatalError =
                lower.includes('not found') ||
                lower.includes('is full') ||
                lower.includes('is closed') ||
                lower.includes('does not exist');

            if (isFatalError) {
                if (joinTimeoutId) {
                    clearTimeout(joinTimeoutId);
                    joinTimeoutId = null;
                }
                setIsConnecting(false);
                setError(msg);
                setTimeout(() => navigate('/lobby'), 2000);
            }
        }

        // Listeners setup
        socket.on('room:updated', handleRoomUpdated);
        socket.on('room:removed', handleRoomRemoved);
        socket.on('player:disconnected', handlePlayerDisconnected);
        socket.on('player:reconnected', handlePlayerReconnected);
        socket.on('error', handleServerError);

        if (joinedRoomIdRef.current !== roomId && socket.connected) {
            joinedRoomIdRef.current = roomId;

            // Ghost Room Timeout: nếu 10s không nhận room:updated → redirect
            joinTimeoutId = setTimeout(() => {
                setError('Phòng không tồn tại hoặc đã đóng.');
                setTimeout(() => navigate('/lobby'), 2000);
            }, 10000);

            console.log('[useGameOnline] Emitting room:join with Socket ID:', socket.id);
            socket.emit('room:join', { roomId });
            console.log('[useGameOnline] Emitting room:join...');
        }

        // Clean up function chỉ remove listeners của game này, không ảnh hưởng đến listeners khác (nếu có)
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

    // Hydration
    useEffect(() => {
        if (roomData?.status === 'PLAYING' && !isHydrated) {
            const sizeStr = `${roomData.boardSize}x${roomData.boardSize}`;
            const styleMap = { CLASSIC: 'classic', NEON: 'neon', DARK: 'block' };
            setCustomization(sizeStr, styleMap[roomData.boardStyle] || 'classic', 3);
            setIsHydrated(true);
        }
    }, [roomData?.status, isHydrated, setCustomization]);

    // Cleanup when user leaves page or gets disconnected
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