import express from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { verifyToken } from '../../../middlewares/authMiddleware.js';
import { authorizeMiddleware } from '../../../middlewares/roleMiddleware.js'; 

const router = express.Router();

const requireAdmin = authorizeMiddleware(['ADMIN']); 
router.use(verifyToken, requireAdmin)

// Admin endpoint
router.get('/players', AdminController.getPlayers);
router.get('/player/:id', AdminController.getPlayerDetail);
router.patch('/player/:id/deactivate', AdminController.deactivatePlayer);
router.patch('/player/:id/reactivate', AdminController.reactivatePlayer);

export default router;