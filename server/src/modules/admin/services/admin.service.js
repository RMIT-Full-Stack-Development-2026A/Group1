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
    updateUserStatus: async (userId, isActive) => {
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: { isActive: isActive } },
            { new: true }
        ).select('-password');

        if (!updatedUser) {
            throw { status: 404, error: "NOT_FOUND", message: "User not found" };
        }

        return updatedUser;
    }
};