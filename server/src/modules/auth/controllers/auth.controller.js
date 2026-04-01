import { AuthService } from "../services/auth.service.js"
import { AuthDTO } from "../dtos/auth.dto.js"

export const AuthController = {
    register: async (req, res) => {
        try {
            const newUser = await AuthService.registerUser(req.body);
            const safeUser = AuthDTO.toUserResponse(newUser);
            
            return res.status(201).json({ 
                message: "User registered successfully.", 
                data: safeUser 
            });
        } catch (error) {
            // Catch standardized formatting (including validation details if any)
            if (error.status) {
                const errorResponse = {
                    error: error.error,
                    message: error.message,
                    cause: error.cause,
                    valid_example: error.valid_example
                };
                
                if (error.details) {
                    errorResponse.details = error.details;
                }

                return res.status(error.status).json(errorResponse);
            }

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
                message: "Login successful.",
                data: safeUser
            });

        } catch (error) {
            // Catch standardized formatting (including validation details if any)
            if (error.status) {
                const errorResponse = {
                    error: error.error,
                    message: error.message,
                    cause: error.cause,
                    valid_example: error.valid_example
                };
                // Include validation details if it's a 400 validation error
                if (error.details) errorResponse.details = error.details;

                return res.status(error.status).json(errorResponse);
            }

            console.error("Login Error:", error);
            return res.status(500).json({ 
                error: "SERVER_ERROR", 
                message: "Internal server error occurred during login." 
            });
        }
    },

    logout: async (req, res) => {
        try {
            await AuthService.logoutUser(res);
            return res.status(200).json({ 
                message: "Logged out successfully." 
            });
        } catch (error) {
            console.error("Logout Error:", error);
            return res.status(500).json({ 
                error: "SERVER_ERROR", 
                message: "Internal server error occurred during logout." 
            });
        }
    },

    checkAuth: async (req, res) => {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({ 
                    error: "UNAUTHORIZED", 
                    message: "Authentication failed. No valid token found.",
                    cause: "The request context lacks user identity information.",
                    valid_example: "A valid session token in cookies."
                });
            }

            const result = await AuthService.checkAuthUser(req.user.id);
            const safeUser = AuthDTO.toUserResponse(result.user);
            
            return res.status(200).json({ 
                message: "User is authenticated.",
                data: safeUser
            });
        } catch (error) {
            if (error.status) {
                return res.status(error.status).json({ 
                    error: error.error, 
                    message: error.message,
                    cause: error.cause,
                    valid_example: error.valid_example
                });
            }

            console.error("Check Auth Error:", error);
            return res.status(500).json({ 
                error: "SERVER_ERROR", 
                message: "Internal server error occurred during authentication check." 
            });
        }
    }
};