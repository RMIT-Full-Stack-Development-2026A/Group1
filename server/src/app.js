import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";


const app = express();

app.use(cors({
    origin: ["http://localhost:8000", process.env.CLIENT_URL],
    credentials: true,
}));

app.use(express.json({limit: '5mb'}));
app.use(cookieParser());

export default app;