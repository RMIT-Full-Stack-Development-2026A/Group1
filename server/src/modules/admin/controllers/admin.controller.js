import { AdminService } from '../services/admin.service.js';

export const AdminController = {
    getAllUsers: async (req, res) => {
        try {
            // Extract page and limit from query params, default to 1 and 20 (CONTRACT Rule 6)
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;

            // Fetch paginated data from Service
            const { users, total } = await AdminService.getAllUsersPaginated(page, limit);

            // Transform array of users to match CONTRACT Rule 4 & 5
            const formattedUsers = users.map(user => ({
                id: user._id, // Transform _id to id
                username: user.username,
                email: user.email,
                role: user.role,
                country: user.country,
                avatar: user.avatar,
                isPremium: user.isPremium,
                isActive: user.isActive,
                createdAt: user.createdAt
            }));

            // Return success response matching CONTRACT Rule 6 (Pagination Shape)
            return res.status(200).json({
                message: "Users fetched successfully",
                data: {
                    items: formattedUsers,
                    total: total,
                    page: page,
                    limit: limit
                }
            });

        } catch (error) {
            console.error("Get All Users Error:", error);
            return res.status(500).json({
                error: "SERVER_ERROR",
                message: "Internal server error"
            });
        }
    },
    toggleUserStatus: async (req, res) => {
        try {
            const { userId } = req.params; // Get ID from URL: /users/:userId/status
            const { isActive } = req.body; // Get true/false from Body

            if (typeof isActive !== 'boolean') {
                return res.status(400).json({ 
                    error: "BAD_REQUEST", 
                    message: "isActive must be a boolean value" 
                });
            }

            const updatedUser = await AdminService.updateUserStatus(userId, isActive);

            return res.status(200).json({
                message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
                data: {
                    id: updatedUser._id,
                    username: updatedUser.username,
                    isActive: updatedUser.isActive
                }
            });
        } catch (error) {
            if (error.status) return res.status(error.status).json({ error: error.error, message: error.message });
            return res.status(500).json({ error: "SERVER_ERROR", message: "Internal server error" });
        }
    }
};