import { AuthService } from "../services/auth.service.js"
import { AuthDTO } from "../dtos/auth.dto.js"

export const AuthController = {
    register: async (req, res) => {
        try {
            const result = await AuthService.registerUser(req.body, res);
            const safeUser = AuthDTO.toUserResponse(result.user);
            
        
            return res.status(201).json({ 
                message: "User registered successfully",
                data: safeUser,
                token: result.token // Include JWT token in response for frontend
            });
        } catch (error) {
            // The custom validation error from the service
            if (error.statusCode === 400 && error.details) {
               
                return res.status(400).json({ 
                    error: "VALIDATION_ERROR", 
                    message: "Invalid input provided.",
                    details: error.details
                });
            }

            // Fallback for actual server/database errors
            console.error("Register Error:", error);
            return res.status(500).json({ 
                error: "SERVER_ERROR", 
                message: "Internal server error" 
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
                data: safeUser,
                token: result.token, // Include JWT token in response for frontend
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
                const response = {
                    error: errorCode,
                    message: error.message
                };
                
                // Include loginAttempts if available (from 401 errors)
                if (error.loginAttempts !== undefined) {
                    response.loginAttempts = error.loginAttempts;
                }
                
                return res.status(error.statusCode).json(response);
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