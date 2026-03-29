import { AuthService } from "../services/auth.service.js";
import { AuthDTO } from "../dtos/auth.dto.js";

export const AuthController = {
    register: async (req, res) => {
        try {
            const result = await AuthService.registerUser(req.body, res);
            const safeUser = AuthDTO.toUserResponse(result.user);
            return res.status(201).json({ success: true, message: "User registered successfully", user: safeUser });
        } catch (error) {
            // The custom validation error from the service
            if (error.statusCode === 400 && error.details) {
                return res.status(400).json({ 
                    success: false, 
                    error: "VALIDATION_ERROR", 
                    message: "Invalid input provided.",
                    details: error.details
                });
            }

            // Fallback for actual server/database errors
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