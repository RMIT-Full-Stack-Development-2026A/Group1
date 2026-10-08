export const BACKEND_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').trim().replace(/\/+$/, '');
export const API_BASE_URL = `${BACKEND_URL}/api/v1`;

// Only endpoints that are called through this object. A few calls (profile, admin players and dashboard,
// the PayPal order) pass their path to `http` directly.
export const API_ENDPOINTS = {
    AUTH: {
        REGISTER: "/auth/register",
        LOGIN: "/auth/login",
        LOGOUT: "/auth/logout",
        CHECK_AUTH: "/auth/check-auth",
    },
    FEEDBACK: {
        SUBMIT: "/feedback",
    },
    GAME: {
        LIST: "/games",
        DETAILS: (id) => `/games/${id}`,
        TOTAL_MATCHES: "/games/stats/total",
    },
    ROOM: {
        LIST: "/rooms",
    },
    SUBSCRIPTION: {
        STATUS: "/subscription/status",
        CAPTURE_ORDER: "/subscription/capture-order",
        HISTORY: "/subscription/history",
    },
    ADMIN: {
        ROOMS: "/admin/rooms",
        SESSIONS: "/admin/players/games",
        CLOSE_ROOM: (roomId) => `/admin/rooms/${roomId}`,
    }
};
