import dotenv from "dotenv";
import http from "http";
import app from "./app.js";
import { connectDB } from "./config/db.config.js";
import { initSocketServer } from "./sockets/index.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const log = {
    info: (msg) => console.log(`[${new Date().toISOString()}] [INFO] ${msg}`),
    error: (msg, err) => console.error(`[${new Date().toISOString()}] [ERROR] ${msg}`, err ?? ""),
};

const startServer = async () => {
    try {
        log.info("Connecting to database...");
        await connectDB(); // Connect to database
        log.info("Database connected successfully.");

        // Create the HTTP server using the Express app
        const httpServer = http.createServer(app);

        // Pass the HTTP server to Socket.io
        initSocketServer(httpServer);

        // Call listen on the httpServer
        httpServer.listen(PORT, () => {
            log.info(`Server running on port: ${PORT}`);
            log.info(`Environment: ${process.env.NODE_ENV || "development"}`);
        });
    } catch (err) {
        log.error("Failed to start server:", err);
        process.exit(1);
    }
};

startServer();