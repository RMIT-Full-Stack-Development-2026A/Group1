import { User } from '../models/user.model.js';

export const AuthRepository = {
    findByEmail: async (email) => {
        return await User.findOne({ email });
    },
    findByEmailOrUsername: async (identifier) => {
        return await User.findOne({
            $or: [{ email: identifier }, { username: identifier }]
        });
    },

    createUser: async (userData) => {
        const newUser = new User(userData);
        return await newUser.save();
    },

    findById: async (id) => {
        return User.findById(id);
    },

    incrementLoginAttempts: async (user) => {
        // Blocks account for 60 seconds if 5 failed attempts occur
        const updates = { $inc: { loginAttempts: 1 } };
        if (user.loginAttempts + 1 >= 5) {
            updates.$set = { lockUntil: Date.now() + 60000 };
        }
        return User.findByIdAndUpdate(user._id, updates, { returnDocument: 'after' });
    },

    resetLoginAttempts: async (user) => {
        return User.findByIdAndUpdate(user._id, {
            $set: {loginAttempts: 0, lockUntil: 1}
        }, { returnDocument: 'after' });
    },

    updateLastLogin: async (userId) => {
        return User.findByIdAndUpdate(userId, { lastLogin: Date.now() }, { returnDocument: 'after' });
    },

};