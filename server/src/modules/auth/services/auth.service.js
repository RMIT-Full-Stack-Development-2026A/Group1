import bcryptjs from "bcryptjs";
import { AuthRepository } from "../repositories/auth.repository.js";
import { generateTokenAndSetCookie } from "../../../utils/token.util.js";
import { validateRegisterInput } from "../../../utils/validate.js";

export const AuthService = {
    registerUser: async (userData, res) => {
        // Validation
        const validationErrors = validateRegisterInput(userData);

        // hrow a error to the controller
        if (validationErrors.length > 0) {
            const error = new Error("Validation Failed");
            error.statusCode = 400; 
            error.details = validationErrors; 
            throw error;
        }
        
        const { email, password, username, country } = userData;

        // Creation
        const hashedPassword = await bcryptjs.hash(password, 10); // Hashing required

        const newUser = await AuthRepository.createUser({
            email,
            username,
            password: hashedPassword,
            country,
        });

        generateTokenAndSetCookie(res, newUser._id, newUser.role); // JWT generation
        return { user: newUser };
    },
};