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
      setError('Phòng không tồn tại hoặc đã đóng.');
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
};
