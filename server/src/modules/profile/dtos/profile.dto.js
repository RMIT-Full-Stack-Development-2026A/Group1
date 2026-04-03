// DTO helpers for profile responses.
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
    toBaseProfile: (user) => toUserProfile(user),

    toProfileOverview: ({ user, wallet, subscription, stats, recentGames }) => ({
        user: toUserProfile(user),
        wallet: {
            balance: wallet?.balance ?? 0
        },
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

    toAvatarUploadResponse: (avatarUrl) => ({
        avatarUrl
    })
};