export const AuthDTO = {
    /**
     * Maps user to response DTO.
     * @param {Object} user - Raw user document.
     * @returns {Object} User payload.
     */
    toUserResponse: (user) => ({
        id: user.id || user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        country: user.country,
        avatar: user.avatar,
        isPremium: user.isPremium,
        isActive: user.isActive,
        createdAt: user.createdAt
    }),

    /**
     * Maps user and room to auth check DTO.
     * @param {Object} user - Raw user document.
     * @param {Object|null} activeRoom - Active room summary.
     * @returns {Object} Auth check payload.
     */
    toCheckAuthResponse: (user, activeRoom = null) => ({
        user: {
            id: user.id || user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            country: user.country,
            avatar: user.avatar,
            isPremium: user.isPremium,
            isActive: user.isActive,
            createdAt: user.createdAt
        },
        activeRoom
    })
};