import { AuthService } from "../services/auth.service.js"
import { AuthDTO } from "../dtos/auth.dto.js"

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
    
    login: async (req, res) => {
        try {
            const loginData = {
                identifier: req.body.identifier || req.body.email || req.body.username,
                password: req.body.password
            };

            const result = await AuthService.loginUser(loginData, res);
            const safeUser = AuthDTO.toUserResponse(result.user);
            
            return res.status(200).json({
                data: safeUser,
                message: "Login successful"
            });

        } catch (error) {
            if (error.statusCode === 400 && error.details) {
                return res.status(400).json({
                    error: "VALIDATION_ERROR",
                    message: "Invalid input provided.",
                    details: error.details
                });
            }
            
            if (error.statusCode === 401 || error.statusCode === 403) {
                const errorCode = error.statusCode === 401 ? "UNAUTHORIZED" : "ACCOUNT_LOCKED";
                return res.status(error.statusCode).json({
                    error: errorCode,
                    message: error.message
                });
            }

            console.error("Login Error:", error);
            return res.status(500).json({ 
                error: "SERVER_ERROR", 
                message: "Internal server error" 
            });
        }
    },

    logout: async (req, res) => {
        try {
            await AuthService.logoutUser(res);
            return res.status(200).json({ 
                data: null, 
                message: "Logged out successfully" 
            });
        } catch (error) {
            console.error("Logout Error:", error);
            return res.status(500).json({ 
                error: "LOGOUT_FAILED", 
                message: "Error logging out" 
            });
        }
    },

    checkAuth: async (req, res) => {
        res.status(200).json({ message: "CheckAuth endpoint coming soon!" });
    },
};