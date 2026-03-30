import { User } from '../../auth/models/user.model.js'; 

export const UserService = {
    getUserProfile: async (userId) => {
        // Fetch user from database by ID and strictly exclude the password field
        const user = await User.findById(userId).select('-password');
        
        if (!user) {
            throw { status: 404, error: "NOT_FOUND", message: "User not found" };
        }
        
        return user;
    }
};