import { create } from 'zustand';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useSocketStore = create((set, get) => ({
    socket: null,
    isConnected: false,
    isPending: false,

    connectSocket: () => {
        const { socket: currentSocket, isPending } = get();

        if (currentSocket?.connected) return;
        if (isPending) return;

        set({ isPending: true });

        const socketInstance = io(`${SOCKET_URL}/ws/game`, {
            withCredentials: true,
            transports: ['websocket', 'polling'],
        });

        socketInstance.on('connect', () => {
            console.log('[Socket] Connected to /ws/game with ID:', socketInstance.id);
            set({ socket: socketInstance, isConnected: true, isPending: false });
        });

        socketInstance.on('disconnect', (reason) => {
            console.log('[Socket] Disconnected. Reason:', reason);
            set({ socket: null, isConnected: false, isPending: false });
        });

        socketInstance.on('connect_error', (err) => {
            console.error('[Socket Auth Error]:', err.message, err.data);
            if (err.message === 'AUTHENTICATION_FAILED') {
                // Token expired or invalid - could trigger logout from AuthStore if needed
            }
            set({ socket: null, isConnected: false, isPending: false });
        });
    },

    disconnectSocket: () => {
        const currentSocket = get().socket;
        if (currentSocket) {
            currentSocket.disconnect();
            set({ socket: null, isConnected: false, isPending: false });
        }
    }
}));