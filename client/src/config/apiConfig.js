export const API_ENDPOINTS = {
    AUTH: {
        REGISTER: "/auth/register",
        LOGIN: "/auth/login",
        LOGOUT: "/auth/logout",
        CHECK_AUTH: "/auth/check-auth",
    },
    PROFILE: {
        UPDATE: "/profile",
        PASSWORD: "/profile/password",
        AVATAR: "/profile/avatar",
    },
    GAME: {
        LIST: "/games",
        DETAILS: (id) => `/games/${id}`,
        MOVES: (id) => `/games/${id}/moves`,
        SEARCH: "/games/search",
    },
    ROOM: {
        LIST: "/rooms",
        CREATE: "/rooms",
        JOIN: (roomId) => `/rooms/${roomId}/join`,
        DETAILS: (roomId) => `/rooms/${roomId}`,
        CLOSE: (roomId) => `/rooms/${roomId}`,
    },
    SUBSCRIPTION: {
        STATUS: "/subscription/status",
        SUBSCRIBE: "/subscription/subscribe",
        HISTORY: "/subscription/history",
    },
    WALLET: {
        BALANCE: "/wallet",
        DEPOSIT: "/wallet/deposit",
        TRANSACTIONS: "/wallet/transactions",
    },
    ADMIN: {
        PLAYERS: "/admin/players",
        PLAYER_DETAILS: (id) => `/admin/players/${id}`,
        DEACTIVATE: (id) => `/admin/players/${id}/deactivate`,
        REACTIVATE: (id) => `/admin/players/${id}/reactivate`,
        ROOMS: "/admin/rooms",
        ROOM_DETAILS: (roomId) => `/admin/rooms/${roomId}`,
        CLOSE_ROOM: (roomId) => `/admin/rooms/${roomId}`,
    }
};

