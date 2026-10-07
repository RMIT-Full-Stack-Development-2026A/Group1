import { create } from 'zustand';
import { authService } from "../../services/auth/auth.service";
import { useSocketStore } from '../socket/SocketStore';

// Global flag to ensure checkAuth is only called once per app lifecycle
let hasInitializedAuth = false;

let isLoggingOut = false;

export const SESSION_COOKIE_BLOCKED = 'SESSION_COOKIE_BLOCKED';
const SESSION_COOKIE_BLOCKED_MESSAGE =
    'Your browser blocked the login cookie, so your session could not start. ' +
    'Allow third-party cookies for this site (or leave Incognito / private mode) and sign in again.';

/**
 * Confirms the session cookie really reached the browser. The API is on a different site than this app,
 * and a browser that blocks third-party cookies drops it silently: the login response still says success,
 * but every later request has no cookie and the user is thrown back to the login page with no explanation.
 * Only a definite "not signed in" answer counts; a network error or timeout is not treated as a blocked cookie.
 */
const assertSessionStarted = async (user) => {
    let confirmed;
    try {
        const response = await authService.checkAuth({ skipGlobalAuthError: true });
        confirmed = response?.data?.user ?? null;
    } catch (error) {
        if (error?.status !== 401) return;
        confirmed = null;
    }

    const expectedId = user?.id ?? user?.userId;
    const confirmedId = confirmed?.id ?? confirmed?.userId;
    const sameUser = !expectedId || !confirmedId || String(expectedId) === String(confirmedId);
    if (confirmed && sameUser) return;

    const blocked = new Error(SESSION_COOKIE_BLOCKED_MESSAGE);
    blocked.code = SESSION_COOKIE_BLOCKED;
    throw blocked;
};

export const useAuthStore = create((set) => ({
    user: null,
    isAuthenticated: false,
    isCheckingAuth: true, // loading state on initial load
    isLoading: false,     // loading state for button clicks (login/register)
    error: null,

    // Login function
    login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
            // Delegate the API call to the service layer
            // authService.login() already extracts user identity from JWT
            const response = await authService.login(credentials);
            const userIdentity = response.user; // Extracted in authService

            await assertSessionStarted(userIdentity);

            set({ isAuthenticated: true, user: userIdentity, isLoading: false, isCheckingAuth: false });
            
            // Allow checkAuth to run again on next page/route to verify backend session
            hasInitializedAuth = false;
            
            return response;
        } catch (error) {
            console.error('[Auth] Login failed:', error);
            set({ error: error, isLoading: false, isCheckingAuth: false });
            throw error;
        }
    },

    // Register function
    register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
            // Delegate the API call to the service layer
            // authService.register() already extracts user identity from JWT
            const response = await authService.register(userData);
            const userIdentity = response.user; // Extracted in authService

            await assertSessionStarted(userIdentity);

            set({ isAuthenticated: true, user: userIdentity, isLoading: false, isCheckingAuth: false });
            
            // Allow checkAuth to run again on next page/route to verify backend session
            hasInitializedAuth = false;
            
            return response;
        } catch (error) {
            console.error('[Auth] Register failed:', error);
            set({ error: error, isLoading: false, isCheckingAuth: false });
            throw error;
        }
    },

    // Logout function
    logout: async () => {
        // Re-entrancy guard: an in-flight request that 401s mid-logout must not trigger a second logout call.
        if (isLoggingOut) return;
        isLoggingOut = true;
        set({ isLoading: true, error: null });
        try {
            await authService.logout();
            
            hasInitializedAuth = false; // Reset for next app session
        } catch (error) {
            console.debug('[Auth] Logout API failed (expected if no token):', error);
            // Silently ignore logout API errors (e.g., 401 when already logged out)
            // The frontend state will be cleared regardless
        } finally {
            // Always clear state on the frontend regardless of API success/failure
            set({ isAuthenticated: false, user: null, isLoading: false });
            useSocketStore.getState().disconnectSocket();
            isLoggingOut = false;
        }
    },

    // Check session/cookie after reloading - ONLY CALL ONCE PER APP LIFECYCLE
    checkAuth: async () => {
        // Prevent duplicate calls - use global flag not component-scoped
        if (hasInitializedAuth) {
            
            return;
        }
        
        hasInitializedAuth = true;
        set({ isCheckingAuth: true, error: null });
        
        try {
            // Always try to verify session with backend
            // Browser automatically sends httpOnly cookie with the request
            
            
            // Add timeout to prevent indefinite hanging
            const checkAuthPromise = authService.checkAuth();
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('checkAuth timeout')), 5000)
            );
            
            const response = await Promise.race([checkAuthPromise, timeoutPromise]);
            
            // Use user data from backend response
            // checkAuth returns: { data: { user: {...}, activeRoom: ... } }
            const userData = response.data?.user;
            const userIdentity = userData ? {
                id: userData.id,
                userId: userData.userId,
                email: userData.email,
                username: userData.username,
                role: userData.role || 'PLAYER',
                isPremium: userData.isPremium || false,
                premiumExpiresAt: userData.premiumExpiresAt ?? null,
                avatar: userData.avatar,
                country: userData.country,
            } : null;
            
            
            if (!userIdentity) {
                // Anonymous visitor: the server answers 200 with user null
                set({ isAuthenticated: false, user: null, isCheckingAuth: false });
                useSocketStore.getState().disconnectSocket();
                return;
            }

            set({ isAuthenticated: true, user: userIdentity, isCheckingAuth: false });
            
        } catch (error) {
            console.debug('[Auth] checkAuth failed:', error.message);
            
            // If checkAuth fails, user is not authenticated
            // (no valid cookie or session expired)
            
            set({ isAuthenticated: false, user: null, isCheckingAuth: false });
            useSocketStore.getState().disconnectSocket();
        }
    },

    // Clear error messages from state
    clearError: () => set({ error: null })
,

    // Refresh user info explicitly even if checkAuth was already run
    refreshUser: async () => {
        try {
            const checkAuthPromise = authService.checkAuth();
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('refreshUser timeout')), 5000)
            );
            const response = await Promise.race([checkAuthPromise, timeoutPromise]);
            const userData = response.data?.user;
            if (!userData) return;
            const userIdentity = {
                id: userData.id,
                userId: userData.userId,
                email: userData.email,
                username: userData.username,
                role: userData.role || 'PLAYER',
                isPremium: userData.isPremium || false,
                premiumExpiresAt: userData.premiumExpiresAt ?? null,
                avatar: userData.avatar,
                country: userData.country,
            };
            set({ user: userIdentity, isAuthenticated: true });
        } catch (err) {
            console.debug('[Auth] refreshUser failed:', err.message);
        }
    }
}));

// Listen for 401 unauthorized events dispatched from Axios interceptor
window.addEventListener('auth:unauthorized', () => {
    const state = useAuthStore.getState();
    // Only logout if user is actually authenticated (prevents infinite loop on logout endpoint 401)
    if (state.isAuthenticated) {
        state.logout();
    }
});