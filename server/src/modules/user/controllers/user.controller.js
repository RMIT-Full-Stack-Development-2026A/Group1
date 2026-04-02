import { UserService } from '../services/user.service.js';

export const UserController = {
    
    updateProfile: async (req, res) => {
        try {
            // Extract userId from the decoded token
            const userId = req.user.id; 

            if (!userId) {
                return res.status(401).json({ 
                    error: "UNAUTHORIZED", 
                    message: "Token invalid or expired.",
                    cause: "The user identifier could not be extracted from the provided access token.",
                    valid_example: "A valid JWT token securely passed via cookies."
                });
            }

            // Perform the update
            const updatedUser = await UserService.updateUserProfile(userId, req.body);

            const userResponse = {
                id: updatedUser._id || updatedUser.id, //  Transform _id to id
                username: updatedUser.username,
                email: updatedUser.email,
                role: updatedUser.role,
                country: updatedUser.country,
                avatar: updatedUser.avatar,
                isPremium: updatedUser.isPremium,
                isActive: updatedUser.isActive,
                createdAt: updatedUser.createdAt
            };

            // Success Response Shape
            return res.status(200).json({
                message: "Profile updated successfully.",
                data: userResponse 
            });
            
        } catch (error) {
            // Handle custom operational errors 
            if (error.status) {
                return res.status(error.status).json({ 
                    error: error.error, 
                    message: error.message,
                    cause: error.cause,             
                    valid_example: error.valid_example 
                });
            }
            
            // Log and handle unexpected internal server errors (Contract Rule 13: no stack trace)
            console.error("Update Profile Error:", error);
            return res.status(500).json({ 
                error: "SERVER_ERROR", 
                message: "Internal server error occurred while updating the profile."
            });
        }
    }
};