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
    },
    logout: (req, res) => {
        // Chỉ cần xóa cái Cookie chứa Token đi là xong phim!
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        return res.status(200).json({
            message: "Logout successful"
        });
    },
};