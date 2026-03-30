import express from 'express';
import { UserController } from '../controllers/user.controller.js';
import { verifyToken } from '../../../middlewares/authMiddleware.js'; 

const router = express.Router();

// Apply verifyToken middleware to protect the profile endpoint
router.get('/profile', verifyToken, UserController.getProfile);
// Apply verifyToken middleware to protect the update profile endpoint
router.put('/profile', verifyToken, UserController.updateProfile);
export default router;