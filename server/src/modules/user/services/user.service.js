import { User } from '../../auth/models/user.model.js'; 

export const UserService = {
    updateUserProfile: async (userId, updateData) => {
        // 1. Security Check: Extract only allowed fields
        const allowedUpdates = {};
        
        if (updateData.username) allowedUpdates.username = updateData.username;
        if (updateData.country) allowedUpdates.country = updateData.country;

        // handle duplicate email check if email is being updated
        if (updateData.email) {
            const existingUser = await User.findOne({ 
                email: updateData.email, 
                _id: { $ne: userId } // $ne = Not Equal
            });

            if (existingUser) {
                throw { status: 400, error: "EMAIL_ALREADY_IN_USE", message: "Email này đã được sử dụng bởi tài khoản khác." };
            }
            allowedUpdates.email = updateData.email;
        }

        if (Object.keys(allowedUpdates).length === 0) {
            throw { status: 400, error: "BAD_REQUEST", message: "Không có dữ liệu hợp lệ để cập nhật." };
        }

        // 3. Update user in DB
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: allowedUpdates },
            { new: true, runValidators: true } 
        ).select('-password');

        if (!updatedUser) {
            throw { status: 404, error: "NOT_FOUND", message: "User not found" };
        }

        return updatedUser;
    }
};