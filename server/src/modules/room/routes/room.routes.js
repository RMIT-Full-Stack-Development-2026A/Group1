import express from "express";
import { RoomController } from "../controllers/room.controller.js";
import { verifyToken } from "../../../middlewares/authMiddleware.js";
import { authorizeMiddleware } from "../../../middlewares/roleMiddleware.js";

const roomRoutes = express.Router();
roomRoutes.use(verifyToken); // Apply auth middleware to all room snapshot APIs
const requirePlayer = authorizeMiddleware(['PLAYER']);
roomRoutes.use(requirePlayer); // Only PLAYERs may access room APIs

/**
 * @openapi
 * /api/v1/rooms:
 *   get:
 *     tags: [Rooms]
 *     summary: Arena snapshot — all joinable or active rooms
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
 */
roomRoutes.get('/', RoomController.getRooms);

/**
 * @openapi
 * /api/v1/rooms/{id}:
 *   get:
 *     tags: [Rooms]
 *     summary: Get one room snapshot for reconnect / recovery
 *     parameters:
 *       - $ref: '#/components/parameters/PathId'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/RoomResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedResponse'
 *       404:
 *         $ref: '#/components/responses/NotFoundResponse'
 */
roomRoutes.get('/:id', RoomController.getRoomDetail);

export default roomRoutes;