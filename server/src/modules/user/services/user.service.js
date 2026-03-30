import { User } from '../../auth/models/user.model.js'; 

export const UserService = {
    getUserProfile: async (userId) => {
        // Fetch user from database by ID and strictly exclude the password field
        const user = await User.findById(userId).select('-password');
        
        if (!user) {
            throw { status: 404, error: "NOT_FOUND", message: "User not found" };
        }
        
        return user;
    },
    updateUserProfile: async (userId, updateData) => {
        // 1. Security Check: Extract only allowed fields to prevent privilege escalation (e.g., injecting role or isPremium)
        const allowedUpdates = {};
        if (updateData.username) allowedUpdates.username = updateData.username;
        if (updateData.country) allowedUpdates.country = updateData.country;
        if (updateData.avatar) allowedUpdates.avatar = updateData.avatar;

        // 2. Update user in DB and return the new document ({ new: true })
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: allowedUpdates },
            { new: true, runValidators: true } // runValidators ensures DB schema rules are still applied
        ).select('-password');

        if (!updatedUser) {
            throw { status: 404, error: "NOT_FOUND", message: "User not found" };
        }

        return updatedUser;
    }
};