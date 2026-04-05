import express from 'express';
import { GameController } from '../controllers/game.controller.js';
import { verifyToken } from '../../../middlewares/authMiddleware.js';

const gameRoutes = express.Router();
gameRoutes.use(verifyToken);

// Game endponts

gameRoutes.get('/', GameController.getGames);
gameRoutes.get('/:id', GameController.getGameDetail);

export default gameRoutes;