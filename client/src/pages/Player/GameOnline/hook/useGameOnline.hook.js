import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSocketStore } from '@/stores/socket/SocketStore';
import { useCustomizationStore } from '@/stores/game/CustomizationStore';

export const useGameOnline = () => {
  const [roomData, setRoomData] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [disconnectCountdown, setDisconnectCountdown] = useState(null);

  const disconnectIntervalRef = useRef(null);
  const roomDataRef = useRef(null);

  const { socket, isConnected, connectSocket } = useSocketStore();
  const { setCustomization } = useCustomizationStore();
  const { roomId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    roomDataRef.current = roomData;
  }, [roomData]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      const currentRoom = roomDataRef.current;
      if (currentRoom?.status !== 'PLAYING') {
        return;
      }
      e.preventDefault();
      e.returnValue = '';
      const { socket: currentSocket } = useSocketStore.getState();
      if (currentSocket?.connected && currentRoom?.id) {
        currentSocket.emit('room:leave', { roomId: currentRoom.id });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (!isConnected) connectSocket();
  }, [isConnected, connectSocket]);

  useEffect(() => {
    if (!socket || !isConnected || !roomId) return;

    const joinTimeoutId = setTimeout(() => {
      setError('Room not available or has been closed.');
      setTimeout(() => navigate('/lobby'), 2000);
    }, 10000);

    socket.emit('room:join', { roomId });

    const handleFirstUpdate = () => {
      clearTimeout(joinTimeoutId);
      setIsConnecting(false);
    };

    socket.once('room:updated', handleFirstUpdate);

    return () => {
      clearTimeout(joinTimeoutId);
      socket.off('room:updated', handleFirstUpdate);
    };
  }, [socket, isConnected, roomId, navigate]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    function handleRoomUpdated(payload) {
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
        setDisconnectCountdown((previousValue) => {
          if (previousValue <= 1) {
            clearInterval(disconnectIntervalRef.current);
            disconnectIntervalRef.current = null;
            return null;
          }

          return previousValue - 1;
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
      const msg = payload?.message || '';
      const normalizedMessage = msg.toLowerCase();
      const isRoomError =
        normalizedMessage.includes('not found') ||
        normalizedMessage.includes('is full') ||
        normalizedMessage.includes('is closed') ||
        normalizedMessage.includes('does not exist');

      if (!isRoomError) {
        return;
      }

      setError(msg);
      setTimeout(() => navigate('/lobby'), 2000);
    }

    socket.on('room:updated', handleRoomUpdated);
    socket.on('room:removed', handleRoomRemoved);
    socket.on('player:disconnected', handlePlayerDisconnected);
    socket.on('player:reconnected', handlePlayerReconnected);
    socket.on('error', handleServerError);

    return () => {
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
  }, [socket, isConnected, navigate]);

  useEffect(() => {
    if (roomData?.status === 'PLAYING' && !isHydrated) {
      const sizeStr = `${roomData.boardSize}x${roomData.boardSize}`;
      const styleMap = { CLASSIC: 'classic', NEON: 'neon', DARK: 'block' };
      setCustomization(sizeStr, styleMap[roomData.boardStyle] || 'classic', 3);
      setIsHydrated(true);
    }
  }, [roomData?.status, isHydrated, setCustomization]);

  useEffect(() => {
    return () => {
      const currentRoom = roomDataRef.current;
      if (
        socket &&
        currentRoom?.status !== 'CLOSED' &&
        currentRoom?.status !== 'ABORTED'
      ) {
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
