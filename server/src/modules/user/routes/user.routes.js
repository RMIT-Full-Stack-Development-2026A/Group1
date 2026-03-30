import express from 'express';
import { UserController } from '../controllers/user.controller.js';
import { verifyToken } from '../../../middlewares/authMiddleware.js'; 

const router = express.Router();

// Apply verifyToken middleware to protect the profile endpoint
router.get('/profile', verifyToken, UserController.getProfile);

export default router;