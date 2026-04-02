import express from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { verifyToken } from '../../../middlewares/authMiddleware.js';
import { authorizeMiddleware } from '../../../middlewares/roleMiddleware.js'; 

const router = express.Router();

// role is strictly "PLAYER" or "ADMIN". 
// We restrict this exclusively to uppercase 'ADMIN' to match the database shape.
const requireAdmin = authorizeMiddleware(['ADMIN']); 

//  Fetch paginated list of all users
router.get('/users', verifyToken, requireAdmin, AdminController.getAllUsers);

// Deactivate a specific player account
router.patch('/players/:id/deactivate', verifyToken, requireAdmin, AdminController.deactivatePlayer);

// Reactivate a specific player account
router.patch('/players/:id/reactivate', verifyToken, requireAdmin, AdminController.reactivatePlayer);

export default router;