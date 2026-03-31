import express from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { verifyToken } from '../../../middlewares/authMiddleware.js';
import { authorizeMiddleware } from '../../../middlewares/roleMiddleware.js'; 

const router = express.Router();


const requireAdmin = authorizeMiddleware(['admin', 'Admin', 'ADMIN']); 

// Protect route with 2 layers: Must be logged in AND must be ADMIN
router.get('/users', verifyToken, requireAdmin, AdminController.getAllUsers);
router.patch('/players/:id/deactivate', verifyToken, requireAdmin, AdminController.deactivatePlayer);
router.patch('/players/:id/reactivate', verifyToken, requireAdmin, AdminController.reactivatePlayer);

export default router;