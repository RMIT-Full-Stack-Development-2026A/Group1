import express from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { verifyToken } from '../../../middlewares/authMiddleware.js';
import { authorizeMiddleware } from '../../../middlewares/roleMiddleware.js'; 

const adminRoutes = express.Router();

const requireAdmin = authorizeMiddleware(['ADMIN']); 
adminRoutes.use(verifyToken, requireAdmin)

// Admin endpoints
adminRoutes.get('/players', AdminController.getPlayers);
adminRoutes.get('/player/:id', AdminController.getPlayerDetail);
adminRoutes.patch('/player/:id/deactivate', AdminController.deactivatePlayer);
adminRoutes.patch('/player/:id/reactivate', AdminController.reactivatePlayer);

export default adminRoutes;