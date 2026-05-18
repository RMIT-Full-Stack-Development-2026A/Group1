import express from 'express';
import { GameController } from '../controllers/game.controller.js';
import { verifyToken } from '../../../middlewares/authMiddleware.js';
import { authorizeMiddleware } from '../../../middlewares/roleMiddleware.js';

const gameRoutes = express.Router();
gameRoutes.use(verifyToken);
const requirePlayer = authorizeMiddleware(['PLAYER']);
gameRoutes.use(requirePlayer);

/**
 * @openapi
 * /api/v1/games:
 *   get:
 *     tags: [Games]
 *     summary: Paginated game history with search, filter, and sort
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/SearchParam'
 *       - $ref: '#/components/parameters/GameTypeParam'
 *       - $ref: '#/components/parameters/GameResultParam'
 *       - $ref: '#/components/parameters/DateFromParam'
 *       - $ref: '#/components/parameters/DateToParam'
 *       - $ref: '#/components/parameters/SortByParam'
 *       - $ref: '#/components/parameters/SortOrderParam'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/GameSessionListResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedResponse'
 *
 *   post:
 *     tags: [Games]
 *     summary: Save a completed local or AI game session
 *     requestBody:
 *       $ref: '#/components/requestBodies/SaveGameBody'
 *     responses:
 *       201:
 *         $ref: '#/components/responses/GameSessionDetailResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequestResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedResponse'
 */
gameRoutes.post('/', GameController.createLocalSession);
gameRoutes.get('/', GameController.getGames);

/**
 * @openapi
 * /api/v1/games/{id}:
 *   get:
 *     tags: [Games]
 *     summary: Get one game session with full replay data
 *     parameters:
 *       - $ref: '#/components/parameters/PathId'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/GameSessionDetailResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedResponse'
 *       404:
 *         $ref: '#/components/responses/NotFoundResponse'
 */
gameRoutes.get('/:id', GameController.getGameDetail);

export default gameRoutes;