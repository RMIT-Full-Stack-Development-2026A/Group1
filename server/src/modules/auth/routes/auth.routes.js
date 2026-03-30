import express from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { verifyToken } from "../../../middlewares/authMiddleware.js";

const router = express.Router();

// Public Routes (No token needed)
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);

// Protected Routes (Token Required)
router.post("/logout", verifyToken, AuthController.logout);
router.get("/check-auth", verifyToken, AuthController.checkAuth);

export default router;