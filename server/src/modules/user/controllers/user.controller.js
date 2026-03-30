import { UserService } from '../services/user.service.js';

export const UserController = {
    getProfile: async (req, res) => {
        try {
            // Extract userId from the request (injected by verifyToken middleware)
            // Tui rút gọn lại luôn vì middleware của Thắng chắc chắn là req.user.id rồi
            const userId = req.user.id; 

            if (!userId) {
                return res.status(401).json({ 
                    error: "UNAUTHORIZED", 
                    message: "Token invalid or expired" 
                });
            }

            // Fetch user profile via Service
            const user = await UserService.getUserProfile(userId);

            // Transform user object to match CONTRACT Rule 4 & 5
            const userResponse = {
                id: user._id, // Transform _id to id ở chỗ này nè
                username: user.username,
                email: user.email,
                role: user.role,
                country: user.country,
                avatar: user.avatar,
                isPremium: user.isPremium,
                isActive: user.isActive,
                createdAt: user.createdAt
            };

            // Return success response with strictly shaped user data
            return res.status(200).json({
                message: "Profile fetched successfully",
                data: userResponse
            });
            
        } catch (error) {
            if (error.status) {
                return res.status(error.status).json({ 
                    error: error.error, 
                    message: error.message 
                });
            }
            console.error("Get Profile Error:", error);
            return res.status(500).json({ 
                error: "SERVER_ERROR", 
                message: "Internal server error" 
            });
        }
    }
};