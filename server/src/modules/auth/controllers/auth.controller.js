import { AuthService } from "../services/auth.service.js";

// Controller delegates all business rules to AuthService.
export const AuthController = {
    // [POST] /auth/register endponit
    register: async (req, res, next) => {
        try {
            const safeUser = await AuthService.registerUser(req.body);

            return res.status(201).json({
                data: safeUser,
                message: "User registered successfully."
            });
        } catch (error) {
            return next(error);
        }
    },

     // [POST] /auth/login endponit
    login: async (req, res, next) => {
        try {
            const loginData = {
                identifier: req.body.identifier || req.body.email || req.body.username,
                password: req.body.password
            };

            const safeUser = await AuthService.loginUser(loginData, res);

            return res.status(200).json({
                data: safeUser,
                message: "Login successful."
            });
        } catch (error) {
            return next(error);
        }
    },

     // [POST] /auth/logout endponit
    logout: async (req, res, next) => {
        try {
            await AuthService.logoutUser(res);

            return res.status(200).json({
                data: null,
                message: "Logged out successfully."
            });
        } catch (error) {
            return next(error);
        }
    },

     // [GET] /auth/check-auth endponit
    checkAuth: async (req, res, next) => {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({
                    error: "UNAUTHORIZED",
                    message: "Authentication failed. No valid token found.",
                    cause: "The request context does not contain authenticated user information.",
                    valid_example: "A valid JWT in the access_token cookie is required."
                });
            }

            const authResponse = await AuthService.checkAuthUser(req.user.id);

            return res.status(200).json({
                data: authResponse,
                message: "Authenticated."
            });
        } catch (error) {
            return next(error);
        }
    }
};