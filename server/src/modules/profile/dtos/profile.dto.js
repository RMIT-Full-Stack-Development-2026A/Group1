/**
 * Formats base user profile.
 * @param {Object} user - Raw user document.
 * @returns {Object} Profile object.
 */
const toUserProfile = (user) => ({
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

export const ProfileDTO = {
    /**
     * Maps user to base profile DTO.
     * @param {Object} user - Raw user document.
     * @returns {Object} Base profile.
     */
    toBaseProfile: (user) => toUserProfile(user),

    /**
     * Maps data to profile overview DTO.
     * @param {Object} data - Aggregated user data.
     * @returns {Object} Profile overview.
     */
    toProfileOverview: ({ user, subscription, stats, recentGames }) => ({
        user: toUserProfile(user),
        subscription: {
            isPremium: subscription?.isPremium ?? false,
            premiumExpiresAt: subscription?.premiumExpiresAt ?? null
        },
        stats: {
            totalGames: stats?.totalGames ?? 0,
            wins: stats?.wins ?? 0,
            losses: stats?.losses ?? 0,
            draws: stats?.draws ?? 0,
            aborted: stats?.aborted ?? 0
        },
        recentGames: Array.isArray(recentGames) ? recentGames : []
    }),

    /**
     * Maps avatar URL to response DTO.
     * @param {string} avatarUrl - Uploaded image URL.
     * @returns {Object} Avatar response.
     */
    toAvatarUploadResponse: (avatarUrl) => ({
        avatarUrl
    })
};