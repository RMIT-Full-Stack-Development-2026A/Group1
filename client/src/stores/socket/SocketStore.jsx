import { create } from 'zustand';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useSocketStore = create((set, get) => ({
    socket: null,
    isConnected: false,

    connectSocket: () => {
        const currentSocket = get().socket;
        if (currentSocket?.connected) return;

        // 1. Point exactly to the Backend Namespace
        const socketInstance = io(`${SOCKET_URL}/ws/game`, {
            // 2. This send the HTTP-only cookie for auth
            withCredentials: true, 
            transports: ['websocket', 'polling'], // 'polling' as fallback
        });

        socketInstance.on('connect', () => {
            console.log('[Socket] Connected to /ws/game with ID:', socketInstance.id);
            set({ socket: socketInstance, isConnected: true });
        });

        socketInstance.on('disconnect', (reason) => {
            console.log('[Socket] Disconnected. Reason:', reason);
            set({ socket: null, isConnected: false });
        });

        // Catch Authentication Errors triggered by socketAuthMiddleware
        socketInstance.on('connect_error', (err) => {
            console.error('[Socket Auth Error]:', err.message);
        });
    },

    disconnectSocket: () => {
        const currentSocket = get().socket;
        if (currentSocket) {
            currentSocket.disconnect();
            set({ socket: null, isConnected: false });
        }
    }
}));