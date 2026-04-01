import { UserService } from '../services/user.service.js';

export const UserController = {
    
    updateProfile: async (req, res) => {
        try {
            // Extract userId from the decoded token in the request object
            const userId = req.user.id; 

            // Verify if userId exists (failsafe against missing/malformed token data)
            // Updated to comply with Ultimo 1.3.1 error formatting
            if (!userId) {
                return res.status(401).json({ 
                    error: "UNAUTHORIZED", 
                    message: "Token invalid or expired.",
                    cause: "The user identifier could not be extracted from the provided access token.",
                    valid_example: "A valid JWT token securely passed via cookies or authorization headers."
                });
            }

            // Pass the request body to the service layer to perform the database update
            const updatedUser = await UserService.updateUserProfile(userId, req.body);

            // Transform the updated user object to enforce DTO pattern (Ultimo A.3.2)
            // This ensures sensitive fields like 'password' are NEVER returned to the client
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

            // Return success response with the strictly shaped user data
            return res.status(200).json({
                message: "Profile updated successfully.",
                data: userResponse
            });
            
        } catch (error) {
            // Catch custom operational errors thrown from the Service layer
            // This strictly implements the Ultimo 1.3.1 error formatting requirement
            if (error.status) {
                return res.status(error.status).json({ 
                    error: error.error, 
                    message: error.message,
                    cause: error.cause,             // Added strictly for Ultimo 1.3.1
                    valid_example: error.valid_example // Added strictly for Ultimo 1.3.1
                });
            }
            
            // Log and handle unexpected internal server errors
            console.error("Update Profile Error:", error);
            return res.status(500).json({ 
                error: "SERVER_ERROR", 
                message: "Internal server error occurred while updating the profile.",
                cause: "An unexpected exception occurred within the backend database or service layer.",
                valid_example: "Ensure database connection is stable and try the request again."
            });
        }
    }
};