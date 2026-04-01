import bcrypt from 'bcrypt';
import { User } from '../../auth/models/user.model.js'; 

export const UserService = {
    updateUserProfile: async (userId, updateData) => {
        const allowedUpdates = {};
        
        // Extract only allowed fields to prevent mass assignment vulnerabilities
        if (updateData.username) allowedUpdates.username = updateData.username;
        if (updateData.country) allowedUpdates.country = updateData.country;

        //  Handle duplicate email check (Complies with Ultimo 1.3.1 error format)
        if (updateData.email) {
            const existingUser = await User.findOne({ 
                email: updateData.email, 
                _id: { $ne: userId } // $ne ensures we don't match the current user's own email
            });

            if (existingUser) {
                throw { 
                    status: 400, 
                    error: "EMAIL_ALREADY_IN_USE", 
                    message: "Profile update failed. This email already exists in the system.",
                    cause: "The provided email address is already registered to another user account.",
                    valid_example: "kienminh_new@gmail.com" 
                };
            }
            allowedUpdates.email = updateData.email;
        }

        //  Handle Password Hashing (Mandatory for Requirement 3.1.1 & 1.1.3)
        // We MUST hash the new plain-text password before saving it to the database
        if (updateData.password) {
            const salt = await bcrypt.genSalt(10);
            allowedUpdates.password = await bcrypt.hash(updateData.password, salt);
        }

        //  Handle empty update body (Complies with Ultimo 1.3.1 error format)
        if (Object.keys(allowedUpdates).length === 0) {
            throw { 
                status: 400, 
                error: "BAD_REQUEST", 
                message: "Profile update failed due to missing valid data.",
                cause: "The request body did not contain any permitted fields (username, country, email, password).",
                valid_example: {
                    "username": "Kienminh_ProVjp",
                    "country": "Vietnam",
                    "email": "kienminh@gmail.com",
                    "password": "NewStrongPassword123!"
                }
            };
        }

        //  Update user in the database
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: allowedUpdates },
            { new: true, runValidators: true } 
        ).select('-password'); // Exclude password from the returned document to enforce DTO standard (A.3.2)

        //  Handle user not found scenario (Complies with Ultimo 1.3.1 error format)
        if (!updatedUser) {
            throw { 
                status: 404, 
                error: "NOT_FOUND", 
                message: "User data not found.",
                cause: "The provided user ID does not exist or the account has been deleted.",
                valid_example: "A valid User ID currently existing in the database."
            };
        }

        return updatedUser;
    }
};