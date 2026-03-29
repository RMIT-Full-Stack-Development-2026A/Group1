import bcryptjs from "bcryptjs";
import { AuthRepository } from "../repositories/auth.repository.js";

export const AuthService = {
    registerUser: async (userData) => {
        const { email, password, username, country } = userData;

        // Check duplicate
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

        // save Database
        const newUser = await AuthRepository.createUser({
            email,
            username,
            password: hashedPassword,
            country
        });

        return newUser; 
    }
};