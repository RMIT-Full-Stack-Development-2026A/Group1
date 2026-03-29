import bcrypt from 'bcryptjs';
import { AuthRepository } from "../repositories/auth.repository.js";
import { User } from '../models/user.model.js';

export const AuthService = {
    registerUser: async (userData) => {
        const { email, password, username, country } = userData;

        // Check for duplicate
        const existingUser = await AuthRepository.findByEmailOrUsername(email);
        if (existingUser) {
            throw { 
                status: 409, 
                error: "CONFLICT",
                message: "Email or Username is already taken."
            };
        }

        const existingUsername = await AuthRepository.findByEmailOrUsername(username);
        if (existingUsername) {
            throw { 
                status: 409, 
                error: "CONFLICT",
                message: "Email or Username is already taken."
            };
        }

        // hash password
        const hashedPassword = await bcryptjs.hash(password, 10);

        // Save to DB
        const newUser = await AuthRepository.createUser({
            email,
            username,
            password: hashedPassword,
            country
        });

        return newUser; 
    },
    loginUser: async (identifier, password) => {
        // find user by email or username
        const user = await User.findOne({
            $or: [{ email: identifier }, { username: identifier }]
        });

        // if cannot find user 
        if (!user) {
            throw { status: 401, error: "UNAUTHORIZED", message: "Invalid credentials" };
        }

        // compare password (Bcrypt compare)
        const isMatch = await bcrypt.compare(password, user.password);
        
        // If password is incorrect
        if (!isMatch) {
            throw { status: 401, error: "UNAUTHORIZED", message: "Invalid credentials" };
        }

        // If everything is perfect, return user information to the Controller
        return user;
    },
};