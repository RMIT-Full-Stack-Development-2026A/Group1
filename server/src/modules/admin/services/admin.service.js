import { User } from '../../auth/models/user.model.js';

export const AdminService = {
    getAllUsersPaginated: async (page, limit) => {
        // Calculate how many documents to skip based on the current page
        const skip = (page - 1) * limit;

        // Fetch users, sort by newest, apply pagination, and exclude passwords
        const users = await User.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('-password');

        // Get the total count of users for the pagination metadata
        const total = await User.countDocuments();

        return { users, total };
    },
    // Toggle user status (Activate/Deactivate)
    changePlayerStatus: async (playerId, status) => {
        const updatedUser = await User.findByIdAndUpdate(
            playerId, 
            { isActive: status }, 
            { new: true }
        );
        
        if (!updatedUser) {
            throw { statusCode: 404, message: "Player not found" }; // Ném lỗi nếu không tìm thấy
        }
        return updatedUser;
    }
};