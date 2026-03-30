import express from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { verifyToken } from '../../../middlewares/authMiddleware.js';
import { requireAdmin } from '../../../middlewares/roleMiddleware.js'; 

const router = express.Router();

// Protect route with 2 layers: Must be logged in AND must be ADMIN
router.get('/users', verifyToken, requireAdmin, AdminController.getAllUsers);
router.patch('/users/:userId/status', verifyToken, requireAdmin, AdminController.toggleUserStatus);
export default router;