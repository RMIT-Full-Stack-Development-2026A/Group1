import express from 'express';
import { UserController } from '../controllers/user.controller.js';
import { verifyToken } from '../../../middlewares/authMiddleware.js'; 
import { authorizeMiddleware } from '../../../middlewares/roleMiddleware.js';
// import { validateProfileUpdate } from '../../../middlewares/validationMiddleware.js';

const router = express.Router();

// Route Pipeline: 
// 1. Check if user is authenticated (verifyToken)
// 2. Check if user has the correct role (authorizeMiddleware)
// 3. Validate the profile update data (validateProfileUpdate)
// 4. If all checks pass, update the user's profile (UserController.updateProfile)

router.patch(
    '/profile', 
    verifyToken, 
    authorizeMiddleware(['PLAYER']), // Only users with the 'PLAYER' role can update their profile
    // validateProfileUpdate, 
    UserController.updateProfile
);

export default router;