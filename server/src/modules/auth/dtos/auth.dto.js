// DTO helpers keep auth responses safe and consistent.
export const AuthDTO = {
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