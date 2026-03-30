// DTO hide Password when returning user data to client
export const AuthDTO = {
    toUserResponse: (user) => {
        return {
            id: user._id,
            email: user.email,
            username: user.username,
            country: user.country,
            avatar: user.avatar,
            role: user.role,
            isActive: user.isActive,
            isPremium: user.isPremium
        };
    }
};