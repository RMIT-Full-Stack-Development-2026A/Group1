// DTO helpers for admin dashboard, player management, and room monitoring responses.
const toAdminPlayerItem = (user) => ({
    id: user.id || user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    country: user.country,
    avatar: user.avatar,
    isPremium: !!user.isPremium,
    isActive: !!user.isActive,
    createdAt: user.createdAt
});

export const AdminDTO = {
    toDashboard: (metrics = {}) => ({
        totalPlayers: metrics.totalPlayers ?? 0,
        activePlayers: metrics.activePlayers ?? 0,
        premiumPlayers: metrics.premiumPlayers ?? 0,
        
        registeredToday: Array.isArray(metrics.registeredToday) ? metrics.registeredToday : [],
        registeredThisWeek: Array.isArray(metrics.registeredThisWeek) ? metrics.registeredThisWeek : [],
        registeredThisMonth: Array.isArray(metrics.registeredThisMonth) ? metrics.registeredThisMonth : [],
        
        activeRooms: metrics.activeRooms ?? 0,
        totalMatches: metrics.totalMatches ?? 0,
        totalRevenue: metrics.totalRevenue ?? 0
    }),

    toPlayerItem: toAdminPlayerItem,

    toPlayerList: (users, pagination) => ({
        items: Array.isArray(users) ? users.map(toAdminPlayerItem) : [],
        total: pagination?.total ?? 0,
        page: pagination?.page ?? 1,
        limit: pagination?.limit ?? 20
    }),

    toPlayerDetail: (user, extra = {}) => ({
        ...toAdminPlayerItem(user),
        lastLoginAt: user?.auth?.lastLoginAt ?? null,
        // walletBalance removed: legacy Wallet system deprecated
        premiumExpiresAt: user?.premiumExpiresAt ?? null,
        ...extra
    }),

};