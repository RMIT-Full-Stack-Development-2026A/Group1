import express from "express";
import authRoutes from './modules/auth/routes/auth.routes.js';
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: ["http://localhost:8000", process.env.CLIENT_URL],
    credentials: true,
}));
app.use(express.json({limit: '5mb'})); 
app.use(cookieParser());

app.use('/api/v1/auth', authRoutes);

export default app;