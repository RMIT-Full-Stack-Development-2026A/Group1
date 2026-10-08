import { create } from 'zustand';
import { io } from 'socket.io-client';
import { useAuthStore } from '@/stores/auth/AuthStore';
import { BACKEND_URL } from '@/config/apiConfig';

export const useSocketStore = create((set, get) => ({
    socket: null,
    isConnected: false,
    isPending: false,

    connectSocket: () => {
        const { socket: currentSocket, isPending } = get();

        if (currentSocket) {
            // Socket.IO already retries transport failures. Keep its instance so
            // reconnects do not create duplicate connections and event listeners.
            if (!currentSocket.connected && !currentSocket.active) currentSocket.connect();
            return;
        }
        if (isPending) return;

        set({ isPending: true });

        const socketInstance = io(`${BACKEND_URL}/ws/game`, {
            withCredentials: true,
            transports: ['polling', 'websocket'],
            autoConnect: false,
        });
        set({ socket: socketInstance });

        socketInstance.on('connect', () => {
            
            set({ socket: socketInstance, isConnected: true, isPending: false });
        });

        socketInstance.on('disconnect', (reason) => {
            
            set({ isConnected: false, isPending: socketInstance.active });

            // If the server explicitly severed the connection (e.g., duplicate login or ban)
            if (reason === 'io server disconnect') {
                console.warn('[Socket] Forcefully disconnected by server. Forcing logout.');
                
                // Dispatch event to show the toast (Optional, in case the specific emit was lost)
                window.dispatchEvent(new CustomEvent('auth:force_logout', {
                    detail: { message: 'Session terminated by server.', reason: 'SERVER_DISCONNECT' }
                }));

                // Force clear the auth state to prevent auto-reconnect loops
                // (skipped when a voluntary logout already cleared it)
                if (useAuthStore.getState().isAuthenticated) {
                    void useAuthStore.getState().logout();
                }
            }
        });

        socketInstance.on('account:deactivated', (payload = {}) => {
            const deactivationPayload = {
                message: payload.message || 'Your account has been deactivated by an administrator.',
                reason: payload.reason || 'ACCOUNT_DEACTIVATED',
            };

            window.dispatchEvent(new CustomEvent('account:deactivated', {
                detail: deactivationPayload,
            }));

            get().disconnectSocket();
            void useAuthStore.getState().logout();
        });

        // Handle force logout triggered by a login from another device
        socketInstance.on('auth:force_logout', async (payload = {}) => {
            // The user clicked LOGOUT in this browser: the HTTP logout already cleared the session and
            // the UI is navigating away. Just drop the socket; no second logout, no "logged in elsewhere" redirect.
            if (payload.code === 'LOGGED_OUT') {
                get().disconnectSocket();
                return;
            }

            const forceLogoutPayload = {
                message: payload.reason || 'Your account was logged in from another location.',
                reason: 'FORCE_LOGOUT',
            };

            // Dispatch global event so UI components (like App.jsx) can show an alert or toast
            window.dispatchEvent(new CustomEvent('auth:force_logout', {
                detail: forceLogoutPayload,
            }));

            // Tell the backend we are leaving so it can trigger the 60s grace period for the opponent
            socketInstance.emit('room:leave', { intent: 'navigate_away' });
            
            // Wait 200ms to ensure the packet safely reaches the server before TCP disconnect
            await new Promise(resolve => setTimeout(resolve, 200));

            // Disconnect the socket for the old session
            get().disconnectSocket();
            
            // Clear auth state and cookies
            if (useAuthStore.getState().isAuthenticated) {
                void useAuthStore.getState().logout();
            }
            window.location.href = payload.code === 'DUPLICATE_LOGIN' || payload.code === undefined
                ? '/login?reason=duplicate'
                : '/login';
        });

        // Catch Authentication Errors triggered by socketAuthMiddleware
        socketInstance.on('connect_error', (err) => {
            console.error('[Socket Auth Error]:', err.message, err.data);
            if (err.message === 'AUTHENTICATION_FAILED') {
                // Token expired or invalid - could trigger logout from AuthStore if needed
            }
            set({ isConnected: false, isPending: socketInstance.active });
        });

        socketInstance.connect();
    },

    disconnectSocket: () => {
        const currentSocket = get().socket;
        if (currentSocket) {
            currentSocket.removeAllListeners();
            currentSocket.disconnect();
        }
        set({ socket: null, isConnected: false, isPending: false });
    }
}));
