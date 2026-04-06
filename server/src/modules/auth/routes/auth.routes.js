import express from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { verifyToken } from "../../../middlewares/authMiddleware.js";
import { authRateLimit } from "../../../middlewares/rateLimitMiddleware.js"

const authRoutes = express.Router();

// Public Routes (No token needed)
authRoutes.post("/register", AuthController.register);
authRoutes.post("/login", authRateLimit, AuthController.login);

// Protected Routes (Token Required)
authRoutes.post("/logout", verifyToken, AuthController.logout);
authRoutes.get("/check-auth", verifyToken, AuthController.checkAuth);

export default authRoutes;