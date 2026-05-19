import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useSocketStore } from '@/stores/socket/SocketStore';
import { useCustomizationStore } from '@/stores/game/CustomizationStore';
import { useAuthStore } from '@/stores/auth/AuthStore';
import { notifyError, notifySuccess } from '@/utils/toast.util';

export const useGameOnline = () => {
    const location = useLocation();
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { socket, isConnected, connectSocket } = useSocketStore();
    const { setCustomization } = useCustomizationStore();
    const { user } = useAuthStore();
    const currentUserId = user?.id;

    const [roomData, setRoomData] = useState(null);
    const [isConnecting, setIsConnecting] = useState(true);
    const [error, setError] = useState(null);
    const [isHydrated, setIsHydrated] = useState(false);
    const [disconnectCountdown, setDisconnectCountdown] = useState(null);
    const [hasCompletedMatch, setHasCompletedMatch] = useState(false);
    const [completedMatch, setCompletedMatch] = useState(null);

    const disconnectIntervalRef = useRef(null);
    const disconnectCountdownRef = useRef(null);
    const roomDataRef = useRef(null);
    const prevParticipantCountRef = useRef(0);

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
        setHasCompletedMatch(false);
        setCompletedMatch(null);
        joinedRoomIdRef.current = null; // commented out idk why but does this will work
    }, [roomId]);

    useEffect(() => {
        const initialData = location.state?.initialRoomData;
        if (initialData && (initialData.id === roomId || initialData.roomId === roomId)) {
            console.log('[useGameOnline] Using initialRoomData from router state');
            setRoomData(initialData);
            setIsConnecting(false);
            joinedRoomIdRef.current = roomId;
        }
    }, [location.state, roomId]);

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

            const newRoom = payload.room;
            const prevCount = prevParticipantCountRef.current;
            const newCount = newRoom?.participants?.length || 0;

          
            if (prevCount === 1 && newCount === 2) {
                const opponent = newRoom.participants.find(p => p.userId !== currentUserId);
                const opponentName = opponent?.usernameSnapshot || 'OPPONENT';
                notifySuccess(`${opponentName} JOINED THE ROOM`, { duration: 3000 });
            }

            prevParticipantCountRef.current = newCount;
            setRoomData(newRoom);
            if (newRoom?.status === 'PLAYING') {
                setHasCompletedMatch(false);
            }
            setIsConnecting(false);
            setError(null);
        }

        function handleGameEnded(payload) {
            if (payload?.result === 'ADMIN_FORCE_CLOSE') {
                notifyError('The room was closed by the administrator. Returned to lobby...', {
                    duration: 5000,
                });
                return;
            }

            if (payload?.result === 'WIN' || payload?.result === 'DRAW') {
                setHasCompletedMatch(true);
                setCompletedMatch({
                    result: payload.result,
                    winnerParticipantIndex: payload.winnerParticipantIndex ?? null,
                    winningLine: Array.isArray(payload.winningLine) ? payload.winningLine : [],
                });
            }
        }

        function handleRoomRemoved() {
            // Guard using the ref, not roomDataRef, because roomData can be stale
            // at the time this event fires (e.g. during component unmount timing).
            if (roomDataRef.current?.status === 'PLAYING') {
                return;
            }

            if (disconnectCountdownRef.current !== null) return;
            navigate('/lobby');
        }

        // useGameOnline only seeds the initial countdown value.
        // The tick interval lives exclusively in OnlineArena.jsx to avoid
        // a double-decrement race condition.
        function handlePlayerDisconnected(payload) {
            disconnectCountdownRef.current = payload.timeLeft ?? 60;
            setDisconnectCountdown(payload.timeLeft ?? 60);
        }

        function handlePlayerReconnected() {
            disconnectCountdownRef.current = null;
            setDisconnectCountdown(null);
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

        function handleGameState() {
            // On the rejoin path the backend sends room:updated then game:state.
            // Clear the ghost-room timeout and connecting spinner here as a safety net
            // in case room:updated already cleared them (idempotent — safe to call twice).
            if (joinTimeoutId) {
                clearTimeout(joinTimeoutId);
                joinTimeoutId = null;
            }
            setIsConnecting(false);
            setError(null);
            // Force hydration so the arena renders immediately.
            // The normal hydration useEffect only triggers when roomData?.status changes
            // to 'PLAYING', but on rejoin the status is already PLAYING when roomData
            // first arrives, so the useEffect dependency may not re-fire.
            setIsHydrated(true);
        }

        // Listeners setup
        socket.on('room:updated', handleRoomUpdated);
        socket.on('game:ended', handleGameEnded);
        socket.on('room:removed', handleRoomRemoved);
        socket.on('player:disconnected', handlePlayerDisconnected);
        socket.on('player:reconnected', handlePlayerReconnected);
        socket.on('error', handleServerError);
        socket.on('game:state', handleGameState);

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
            socket.off('game:ended', handleGameEnded);
            socket.off('room:removed', handleRoomRemoved);
            socket.off('player:disconnected', handlePlayerDisconnected);
            socket.off('player:reconnected', handlePlayerReconnected);
            socket.off('error', handleServerError);
            socket.off('game:state', handleGameState);
        };
    }, [socket, isConnected, roomId, navigate]);

    // Hydration — also triggers on rejoin when roomData arrives with status PLAYING.
    // We use roomData?.id as an additional dependency so the effect re-runs when a
    // completely new roomData object arrives (e.g. after a rejoin resets roomData to null
    // then sets it again with the same status value, which would NOT re-trigger
    // if we only depend on roomData?.status).
    useEffect(() => {
        if (roomData?.status === 'PLAYING' && !isHydrated) {
            const sizeStr = `${roomData.boardSize}x${roomData.boardSize}`;
            const styleMap = { CLASSIC: 'classic', NEON: 'neon', DARK: 'block' };
            setCustomization(sizeStr, styleMap[roomData.boardStyle] || 'classic', 3);
            setIsHydrated(true);
        }
    }, [roomData?.status, roomData?.id, isHydrated, setCustomization]);

    // Cleanup when user leaves page or gets disconnected
    useEffect(() => {
        return () => {
            const currentRoom = roomDataRef.current;
            const activeStatuses = ['WAITING', 'READY', 'PLAYING'];
            if (socket && activeStatuses.includes(currentRoom?.status)) {
                // SPA navigation: socket stays alive so the 'disconnect' handler
                // never fires. Send intent so backend starts the grace period
                // instead of aborting instantly.
                socket.emit('room:leave', {
                    roomId: currentRoom?.id || roomId,
                    intent: 'navigate_away',
                });
            }
        };
    }, [socket, roomId]);

    const handleReady = useCallback(() => {
        if (!socket || !roomData?.id) return;
        socket.emit('room:ready', { roomId: roomData.id });
    }, [socket, roomData?.id]);

    const handleLeaveRoom = useCallback(() => {
        if (socket) {
            socket.emit('room:leave', {
                roomId: roomData?.id || roomId,
                // Leave Room button in the pre-game lobby (WAITING/READY).
                // Treat as navigate_away — there is no active match to abort.
                intent: 'navigate_away',
            });
        }
        navigate('/lobby');
    }, [socket, roomData?.id, roomId, navigate]);

    const handlePlayAgain = useCallback(() => {
        setHasCompletedMatch(false);
        setCompletedMatch(null);
    }, []);

    const handleSetFirstTurn = useCallback((firstTurnParticipantIndex) => {
        if (!socket || !roomData?.id) return;
        socket.emit('room:set_first_turn', { roomId: roomData.id, firstTurnParticipantIndex });
    }, [socket, roomData?.id]);

    return {
        roomData,
        isConnecting,
        isHydrated,
        error,
        disconnectCountdown,
        hasCompletedMatch,
        completedMatch,
        handleReady,
        handlePlayAgain,
        handleLeaveRoom,
        handleSetFirstTurn,
    };
};