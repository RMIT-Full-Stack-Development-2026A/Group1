import { AuthService } from "../services/auth.service.js";
import { validateRegisterInput, toUserDTO } from "../dtos/auth.validation.js";
import { generateTokenAndSetCookie } from "../../../utils/token.util.js";
export const AuthController = {
    register: async (req, res) => {
        try {
            // 1. Validation
            const validationErrors = validateRegisterInput(req.body);
            if (validationErrors.length > 0) {
                return res.status(400).json({
                    error: "VALIDATION_FAILED",
                    message: "Invalid input data",
                    details: validationErrors 
                });
            }

            // 2. Call Service handle database
            const newUser = await AuthService.registerUser(req.body);

            // return Response
            return res.status(201).json({
                message: "User registered successfully",
                data: toUserDTO(newUser)
            });

        } catch (error) {
            if (error.status) {
                return res.status(error.status).json({
                    error: error.error,
                    message: error.message
                });
            }
            console.error("Register Error:", error);
            return res.status(500).json({ error: "SERVER_ERROR", message: "Internal server error" });
        }
    },
    
    // 
    login: async (req, res) => {
        try {
            const { email, username, password } = req.body;
            const identifier = email || username; // allow to login with either email or username

            if (!identifier || !password) {
                 return res.status(400).json({
                    error: "VALIDATION_FAILED",
                    message: "Missing credentials",
                    details: [{ field: "identifier/password", cause: "Fields omitted", example: "Provide email/username and password" }]
                });
            }

            // run for database and solve for password
            const user = await AuthService.loginUser(identifier, password);

            // create token and set cookie
            generateTokenAndSetCookie(res, user._id, user.role); 

            // return Response to Postman/Frontend
            return res.status(200).json({
                message: "Login successful",
                data: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                }
            });

        } catch (error) {
            if (error.status) {
                return res.status(error.status).json({
                    error: error.error,
                    message: error.message
                });
            }
            console.error("Login Error:", error);
            return res.status(500).json({ error: "SERVER_ERROR", message: "Internal server error" });
        }
    },
    logout: async (req, res) => {
        res.status(200).json({ message: "Logout endpoint coming soon!" });
    },
    checkAuth: async (req, res) => {
        res.status(200).json({ message: "CheckAuth endpoint coming soon!" });
    }
};