import { AuthService } from "../services/auth.service.js"
import { AuthDTO } from "../dtos/auth.dto.js"

export const AuthController = {
    register: async (req, res) => { // Fixed: Added 'res' parameter
        try {
            const newUser = await AuthService.registerUser(req.body);
            
            // Transform user to safe response shape
            const safeUser = AuthDTO.toUserResponse(newUser);
            
            //  Success shape and 201 status
            return res.status(201).json({ 
                message: "User registered successfully.", 
                data: safeUser 
            });
        } catch (error) {
            //  formatted errors from service
            if (error.status) {
                return res.status(error.status).json({ 
                    error: error.error, 
                    message: error.message,
                    cause: error.cause,
                    valid_example: error.valid_example
                });
            }

            //  Generic 500 error (No stack trace)
            console.error("Register Error:", error);
            return res.status(500).json({ 
                error: "SERVER_ERROR", 
                message: "Internal server error occurred during registration." 
            });
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
                success: true,
                message: "Login successful",
                data: safeUser
            });

        } catch (error) {
            // Catch Validation Errors
            if (error.statusCode === 400 && error.details) {
                return res.status(400).json({
                    success: false,
                    error: "VALIDATION_ERROR",
                    message: "Invalid input provided.",
                    details: error.details
                });
            }
            
            // Catch Authentication/Lock Errors
            if (error.statusCode === 401 || error.statusCode === 403) {
                return res.status(error.statusCode).json({
                    success: false,
                    error: "AUTH_ERROR",
                    message: error.message
                });
            }

            console.error("Login Error:", error);
            return res.status(500).json({ error: "SERVER_ERROR", message: "Internal server error" });
        }
    },

    logout: async (req, res) => {
        try {
            await AuthService.logoutUser(res);
            return res.status(200).json({ success: true, message: "Logged out successfully" });
        } catch (error) {
            console.error("Logout Error:", error);
            return res.status(500).json({ success: false, message: "Error logging out" });
        }
    },

    checkAuth: async (req, res) => {
        try {
            // Check for missing user id from middleware
            if (!req.user || !req.user.id) {
                return res.status(401).json({ 
                    error: "UNAUTHORIZED", 
                    message: "No token provided or token invalid" 
                });
            }

            const result = await AuthService.checkAuthUser(req.user.id);
            const safeUser = AuthDTO.toUserResponse(result.user);
            
            return res.status(200).json({ 
                data: safeUser,
                message: "User is authenticated"
            });
        } catch (error) {
            const errorCode = error.statusCode === 404 ? "USER_NOT_FOUND" : "ACCOUNT_DEACTIVATED";
            return res.status(error.statusCode || 400).json({ 
                error: errorCode, 
                message: error.message 
            });
        }
    }
};