
//This is where Mongoose commands are stored.
import { User } from '../models/user.model.js';

export const AuthRepository = {
    findByEmailOrUsername: async (identifier) => {
        return await User.findOne({
            $or: [{ email: identifier }, { username: identifier }]
        });
    },

    createUser: async (userData) => {
        const newUser = new User(userData);
        return await newUser.save();
    }
};