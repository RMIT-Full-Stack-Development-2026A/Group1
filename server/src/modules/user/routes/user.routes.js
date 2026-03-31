import express from 'express';
import { UserController } from '../controllers/user.controller.js';
import { verifyToken } from '../../../middlewares/authMiddleware.js'; 

const router = express.Router();

// Apply verifyToken middleware to protect the update profile endpoint
router.patch('/profile', verifyToken, UserController.updateProfile);
export default router;