import { AuthService } from "../services/auth.service.js";
import { validateRegisterInput, toUserDTO } from "../dtos/auth.validation.js";

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
        res.status(200).json({ message: "Login endpoint coming soon!" });
    },
    logout: async (req, res) => {
        res.status(200).json({ message: "Logout endpoint coming soon!" });
    },
    checkAuth: async (req, res) => {
        res.status(200).json({ message: "CheckAuth endpoint coming soon!" });
    }
};