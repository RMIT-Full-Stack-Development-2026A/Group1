import express from 'express';
import { ProfileController } from '../controllers/profile.controller.js';
import { verifyToken } from '../../../middlewares/authMiddleware.js'; 

const profileRoutes = express.Router();
profileRoutes.use(verifyToken);

// Profile endpoints
profileRoutes.get('/', ProfileController.getProfile);
profileRoutes.get('/overview', ProfileController.getProfileOverview);
profileRoutes.put('/update', ProfileController.updateProfile);

export default profileRoutes;