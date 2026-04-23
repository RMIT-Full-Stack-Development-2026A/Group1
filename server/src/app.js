import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from "./config/swagger.config.js";
import { generalRateLimit } from './middlewares/rateLimitMiddleware.js';
import { errorMiddleware, notFoundHandler } from './middlewares/errorMiddleware.js';

// import module router
import authRoutes from './modules/auth/routes/auth.routes.js';
import adminRoutes from './modules/admin/routes/admin.routes.js';
import profileRoutes from './modules/profile/routes/profile.routes.js';
import gameRoutes from "./modules/game/routes/game.routes.js";
import roomRoutes from "./modules/room/routes/room.routes.js";
import { subscriptionRoutes } from './modules/subscription/routes/subscription.routes.js';

const app = express();

app.use(cors({
    origin: ["http://localhost:8000", process.env.CLIENT_URL],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
}));

app.use(cookieParser());
app.use(express.json()); 
app.use(generalRateLimit);

// Swagger Documentation Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/games', gameRoutes);
app.use('/api/v1/rooms', roomRoutes);
app.use('/api/v1/subscription', subscriptionRoutes);

app.use(notFoundHandler);
app.use(errorMiddleware);

export default app;