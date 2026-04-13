import express from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { verifyToken } from "../../../middlewares/authMiddleware.js";

const authRoutes = express.Router();

/**
 * @openapi
 * /api/v1/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new player account
 *     security: []
 *     requestBody:
 *       $ref: '#/components/requestBodies/RegisterBody'
 *     responses:
 *       201:
 *         $ref: '#/components/responses/UserResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequestResponse'
 *       409:
 *         $ref: '#/components/responses/ConflictResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerErrorResponse'
 */
authRoutes.post("/register", AuthController.register);

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login and receive session cookie
 *     security: []
 *     requestBody:
 *       $ref: '#/components/requestBodies/LoginBody'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/UserResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequestResponse'
 *       429:
 *         $ref: '#/components/responses/TooManyRequestsResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerErrorResponse'
 */
authRoutes.post("/login", AuthController.login);

/**
 * @openapi
 * /api/v1/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Clear session cookie and logout
 *     responses:
 *       200:
 *         $ref: '#/components/responses/NoDataResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedResponse'
 */
authRoutes.post("/logout", verifyToken, AuthController.logout);

/**
 * @openapi
 * /api/v1/auth/check-auth:
 *   get:
 *     tags: [Auth]
 *     summary: Validate session and bootstrap the app (user + activeRoom)
 *     responses:
 *       200:
 *         $ref: '#/components/responses/CheckAuthResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedResponse'
 */
authRoutes.get("/check-auth", verifyToken, AuthController.checkAuth);

export default authRoutes;