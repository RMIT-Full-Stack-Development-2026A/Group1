/**
 * Maps user document to admin player DTO.
 * @param {Object} user - Raw user document.
 * @returns {Object} Admin player item payload.
 */
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
    /**
     * Maps metrics to dashboard DTO.
     * @param {Object} metrics - Raw metrics data.
     * @returns {Object} Dashboard payload.
     */
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

    /**
     * Maps user list to paginated DTO.
     * @param {Array} users - User documents.
     * @param {Object} pagination - Pagination metadata.
     * @returns {Object} Paginated player list payload.
     */
    toPlayerList: (users, pagination) => ({
        items: Array.isArray(users) ? users.map(toAdminPlayerItem) : [],
        total: pagination?.total ?? 0,
        page: pagination?.page ?? 1,
        limit: pagination?.limit ?? 20
    }),

    /**
     * Maps user document and extra stats to detail DTO.
     * @param {Object} user - Raw user document.
     * @param {Object} extra - Extra player stats.
     * @returns {Object} Player detail payload.
     */
    toPlayerDetail: (user, extra = {}) => ({
        ...toAdminPlayerItem(user),
        lastLoginAt: user?.auth?.lastLoginAt ?? null,
        // walletBalance removed: legacy Wallet system deprecated
        premiumExpiresAt: user?.premiumExpiresAt ?? null,
        ...extra
    }),

};