import { UserService } from '../services/user.service.js';

export const UserController = {
    
    updateProfile: async (req, res) => {
        try {
            // Extract userId from the request
            const userId = req.user.id; 

            if (!userId) {
                return res.status(401).json({ 
                    error: "UNAUTHORIZED", 
                    message: "Token invalid or expired" 
                });
            }

            // Pass the request body to the service to perform the update
            const updatedUser = await UserService.updateUserProfile(userId, req.body);

            // Transform user object to match CONTRACT Rule 4 & 5
            const userResponse = {
                id: updatedUser._id, 
                username: updatedUser.username,
                email: updatedUser.email,
                role: updatedUser.role,
                country: updatedUser.country,
                avatar: updatedUser.avatar,
                isPremium: updatedUser.isPremium,
                isActive: updatedUser.isActive,
                createdAt: updatedUser.createdAt
            };

            // Return success response with strictly shaped user data (Rule #1)
            return res.status(200).json({
                message: "Profile updated successfully",
                data: userResponse
            });
            
        } catch (error) {
            if (error.status) {
                return res.status(error.status).json({ 
                    error: error.error, 
                    message: error.message 
                });
            }
            console.error("Update Profile Error:", error);
            return res.status(500).json({ 
                error: "SERVER_ERROR", 
                message: "Internal server error" 
            });
        }
    }
};