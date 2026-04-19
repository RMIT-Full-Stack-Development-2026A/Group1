import express from 'express';
import { ProfileController } from '../controllers/profile.controller.js';
import { verifyToken } from '../../../middlewares/authMiddleware.js'; 

const profileRoutes = express.Router();
profileRoutes.use(verifyToken);

/**
 * @openapi
 * /api/v1/profile:
 *   get:
 *     tags: [Profile]
 *     summary: Get current user base profile
 *     responses:
 *       200:
 *         $ref: '#/components/responses/UserResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedResponse'
 */
profileRoutes.get('/', ProfileController.getProfile);

/**
 * @openapi
 * /api/v1/profile/overview:
 *   get:
 *     tags: [Profile]
 *     summary: Profile page aggregate (user + wallet + subscription + stats + recentGames)
 *     responses:
 *       200:
 *         $ref: '#/components/responses/ProfileOverviewResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedResponse'
 */
profileRoutes.get('/overview', ProfileController.getProfileOverview);

/**
 * @openapi
 * /api/v1/profile/update:
 *   put:
 *     tags: [Profile]
 *     summary: Update username, email, or country
 *     requestBody:
 *       $ref: '#/components/requestBodies/UpdateProfileBody'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/UserResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequestResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedResponse'
 *       409:
 *         $ref: '#/components/responses/ConflictResponse'
 */
profileRoutes.put('/update', ProfileController.updateProfile);

/**
 * @openapi
 * /api/v1/profile/password:
 *  patch:
 *      tags: [Profile]
 *      summary: Change current user password
 *      requestBody:
 *          $ref: '#/components/requestBodies/ChangePasswordBody'
 *          responses:
 *              200:
 *                  $ref: '#/components/responses/NoDataResponse'
 *              400:
 *                  $ref: '#/components/responses/BadRequestResponse'
 *              401:
 *                  $ref: '#/components/responses/UnauthorizedResponse'
 */
profileRoutes.patch('/password', ProfileController.changePassword);

/**
 * @openapi
 * /api/v1/profile/avatar:
 *   post:
 *     tags: [Profile]
 *     summary: Upload or replace avatar image
 *     requestBody:
 *       $ref: '#/components/requestBodies/AvatarBody'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/UserResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequestResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedResponse'
 */
// profileRoutes.post('/avatar');

export default profileRoutes;