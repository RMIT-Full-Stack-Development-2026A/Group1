import express from 'express';
import { ProfileController } from '../controllers/profile.controller.js';
import { verifyToken } from '../../../middlewares/authMiddleware.js'; 

const router = express.Router();
router.use(verifyToken);

// Profile endpoints
router.get('/', ProfileController.getProfile);
router.get('/overview', ProfileController.getProfileOverview);
router.patch('/', ProfileController.updateProfile);

export default router;