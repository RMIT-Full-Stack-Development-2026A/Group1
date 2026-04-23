import express from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { verifyToken } from '../../../middlewares/authMiddleware.js';
import { authorizeMiddleware } from '../../../middlewares/roleMiddleware.js'; 

const adminRoutes = express.Router();

const requireAdmin = authorizeMiddleware(['ADMIN']); 
adminRoutes.use(verifyToken, requireAdmin);

/**
 * @openapi
 * /api/v1/admin/dashboard:
 *   get:
 *     tags: [Admin]
 *     summary: Aggregated dashboard metrics
 *     responses:
 *       200:
 *         $ref: '#/components/responses/DashboardResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedResponse'
 *       403:
 *         $ref: '#/components/responses/ForbiddenResponse'
 */
adminRoutes.get('/dashboard', AdminController.getDashboard);

/**
 * @openapi
 * /api/v1/admin/players:
 *   get:
 *     tags: [Admin]
 *     summary: List players with search, status, and premium filters
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/SearchParam'
 *       - $ref: '#/components/parameters/PlayerStatusParam'
 *       - $ref: '#/components/parameters/PremiumFilterParam'
 *       - $ref: '#/components/parameters/SortByParam'
 *       - $ref: '#/components/parameters/SortOrderParam'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/AdminPlayerListResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedResponse'
 *       403:
 *         $ref: '#/components/responses/ForbiddenResponse'
 */
adminRoutes.get('/players', AdminController.getPlayers);

/**
 * @openapi
 * /api/v1/admin/player/{id}:
 *   get:
 *     tags: [Admin]
 *     summary: Get full admin detail for one player
 *     parameters:
 *       - $ref: '#/components/parameters/PathId'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/AdminPlayerDetailResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedResponse'
 *       403:
 *         $ref: '#/components/responses/ForbiddenResponse'
 *       404:
 *         $ref: '#/components/responses/NotFoundResponse'
 */
adminRoutes.get('/player/:id', AdminController.getPlayerDetail);

/**
 * @openapi
 * /api/v1/admin/player/{id}/deactivate:
 *   patch:
 *     tags: [Admin]
 *     summary: Deactivate a player account
 *     parameters:
 *       - $ref: '#/components/parameters/PathId'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/NoDataResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedResponse'
 *       403:
 *         $ref: '#/components/responses/ForbiddenResponse'
 *       404:
 *         $ref: '#/components/responses/NotFoundResponse'
 */
adminRoutes.patch('/player/:id/deactivate', AdminController.deactivatePlayer);

/**
 * @openapi
 * /api/v1/admin/player/{id}/reactivate:
 *   patch:
 *     tags: [Admin]
 *     summary: Reactivate a player account
 *     parameters:
 *       - $ref: '#/components/parameters/PathId'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/NoDataResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedResponse'
 *       403:
 *         $ref: '#/components/responses/ForbiddenResponse'
 *       404:
 *         $ref: '#/components/responses/NotFoundResponse'
 */
adminRoutes.patch('/player/:id/reactivate', AdminController.reactivatePlayer);

/**
 * @openapi
 * /api/v1/admin/rooms:
 *   get:
 *     tags: [Admin]
 *     summary: List active and waiting rooms for monitoring
 *     parameters:
 *       - $ref: '#/components/parameters/RoomStatusParam'
 *       - $ref: '#/components/parameters/BoardSizeParam'
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/RoomListResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedResponse'
 *       403:
 *         $ref: '#/components/responses/ForbiddenResponse'
 */
adminRoutes.get('/rooms', AdminController.getRooms);

/**
 * @openapi
 * /api/v1/admin/rooms/{id}:
 *   get:
 *     tags: [Admin]
 *     summary: Get room detail and live snapshot
 *     parameters:
 *       - $ref: '#/components/parameters/PathId'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/RoomResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedResponse'
 *       403:
 *         $ref: '#/components/responses/ForbiddenResponse'
 *       404:
 *         $ref: '#/components/responses/NotFoundResponse'
 *
 *   delete:
 *     tags: [Admin]
 *     summary: Force close a room
 *     description: >
 *       Immediately closes the room regardless of its current status.
 *       If a match is in progress the server emits `game:ended` with
 *       `result: "ABORTED"` and `endedReason: "ADMIN_FORCE_CLOSE"` to
 *       all connected players before removing the room.
 *     parameters:
 *       - $ref: '#/components/parameters/PathId'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/NoDataResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedResponse'
 *       403:
 *         $ref: '#/components/responses/ForbiddenResponse'
 *       404:
 *         $ref: '#/components/responses/NotFoundResponse'
 */
adminRoutes.get('/rooms/:id', AdminController.getRoomDetail);
// adminRoutes.delete('/room/:id');

export default adminRoutes;