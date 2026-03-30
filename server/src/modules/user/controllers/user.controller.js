import { UserService } from '../services/user.service.js';

export const UserController = {
    getProfile: async (req, res) => {
        try {
            // Extract userId from the request (injected by verifyToken middleware)
            const userId = req.user.id || (req.user && req.user.userId); 

            if (!userId) {
                return res.status(401).json({ 
                    error: "UNAUTHORIZED", 
                    message: "Token invalid or expired" 
                });
            }

            // Fetch user profile via Service
            const user = await UserService.getUserProfile(userId);

            // Return success response with user data
            return res.status(200).json({
                message: "Profile fetched successfully",
                data: user
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