import { AdminService } from '../services/admin.service.js';

// Helper function 
const formatUserDTO = (user) => ({
    id: user._id || user.id, //  Always use 'id'
    username: user.username,
    email: user.email,
    role: user.role,
    country: user.country,
    avatar: user.avatar,
    isPremium: user.isPremium,
    isActive: user.isActive,
    createdAt: user.createdAt
});

export const AdminController = {
    getAllUsers: async (req, res) => {
        try {
            // Extract page and limit from query params, default to 1 and 20 
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;

            // Fetch paginated data from Service
            const { users, total } = await AdminService.getAllUsersPaginated(page, limit);

            // Transform array of users 
            const formattedUsers = users.map(formatUserDTO);

            // Return success response 
            return res.status(200).json({
                message: "Users fetched successfully.",
                data: {
                    items: formattedUsers,
                    total: total,
                    page: page,
                    limit: limit
                }
            });

        } catch (error) {
            console.error("Get All Users Error:", error);
            // Return 500 
            return res.status(500).json({
                error: "SERVER_ERROR",
                message: "Internal server error occurred while fetching users.",
                cause: "Database connection failed or query execution error.",
                valid_example: "Ensure valid pagination parameters (?page=1&limit=20) are provided."
            });
        }
    },
    
    deactivatePlayer: async (req, res) => {
        try {
            const { id } = req.params;
            const updatedUser = await AdminService.changePlayerStatus(id, false);
            
            // Return success response 
            return res.status(200).json({
                message: "Player account deactivated successfully.",
                data: formatUserDTO(updatedUser) 
            });
        } catch (error) {
            // Catch and format custom errors 
            if (error.status) {
                return res.status(error.status).json({ 
                    error: error.error, 
                    message: error.message,
                    cause: error.cause,
                    valid_example: error.valid_example
                });
            }
            console.error("Deactivate Player Error:", error);
            return res.status(500).json({ 
                error: "SERVER_ERROR", 
                message: "Internal server error during account deactivation.",
                cause: "An unexpected exception occurred in the database layer.",
                valid_example: "Check server logs for specific database errors." 
            });
        }
    },

    reactivatePlayer: async (req, res) => {
        try {
            const { id } = req.params;
            const updatedUser = await AdminService.changePlayerStatus(id, true);
            
            // Return success response 
            return res.status(200).json({
                message: "Player account reactivated successfully.",
                data: formatUserDTO(updatedUser) 
            });
        } catch (error) {
            // Catch and format custom errors 
            if (error.status) {
                return res.status(error.status).json({ 
                    error: error.error, 
                    message: error.message,
                    cause: error.cause,
                    valid_example: error.valid_example
                });
            }
            console.error("Reactivate Player Error:", error);
            return res.status(500).json({ 
                error: "SERVER_ERROR", 
                message: "Internal server error during account reactivation.",
                cause: "An unexpected exception occurred in the database layer.",
                valid_example: "Check server logs for specific database errors." 
            });
        }
    }
};