import { AuthService } from "../services/auth.service.js";
import { AuthDTO } from "../dtos/auth.dto.js";

// Controller delegates all business rules to AuthService.
export const AuthController = {
    register: async (req, res, next) => {
        try {
            const newUser = await AuthService.registerUser(req.body);
            const safeUser = AuthDTO.toUserResponse(newUser);

            return res.status(201).json({
                data: safeUser,
                message: "User registered successfully."
            });
        } catch (error) {
            return next(error);
        }
    },

    login: async (req, res, next) => {
        try {
            const loginData = {
                identifier: req.body.identifier || req.body.email || req.body.username,
                password: req.body.password
            };

            const result = await AuthService.loginUser(loginData, res);
            const safeUser = AuthDTO.toUserResponse(result.user);

            return res.status(200).json({
                data: safeUser,
                message: "Login successful."
            });
        } catch (error) {
            return next(error);
        }
    },

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

            const result = await AuthService.checkAuthUser(req.user.id);

            return res.status(200).json({
                data: AuthDTO.toCheckAuthResponse(result.user, result.activeRoom),
                message: "Authenticated."
            });
        } catch (error) {
            return next(error);
        }
    }
};