import express from "express";
import authRoutes from './modules/auth/routes/auth.routes.js';
import adminRoutes from './modules/admin/routes/admin.routes.js';
import profileRoutes from './modules/profile/routes/profile.routes.js';
import cors from "cors";
import cookieParser from "cookie-parser";
import { generalRateLimit } from './middlewares/rateLimitMiddleware.js';
import { errorMiddleware, notFoundHandler } from './middlewares/errorMiddleware.js';

const app = express();

app.use(cors({
    origin: ["http://localhost:8000", process.env.CLIENT_URL],
    credentials: true,
}));

app.use(cookieParser());
app.use(express.json()); 
app.use(generalRateLimit);

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/admin', adminRoutes);

app.use(notFoundHandler);
app.use(errorMiddleware);

export default app;