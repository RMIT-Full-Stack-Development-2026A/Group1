import dotenv from "dotenv";
import http from "http";
import app from "./app.js";
import { connectDB } from "./config/db.config.js";
import { initSocketServer } from "./sockets/index.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

// Logging utilities
const log = {
    /**
     * Logs an info message.
     * @param {string} msg - Message to log.
     */
    info: (msg) => console.log(`[${new Date().toISOString()}] [INFO] ${msg}`),
    
    /**
     * Logs an error message.
     * @param {string} msg - Error message context.
     * @param {Error} [err] - Error object.
     */
    error: (msg, err) => console.error(`[${new Date().toISOString()}] [ERROR] ${msg}`, err ?? ""),
};

/**
 * Initializes database, servers, and starts listening for connections.
 * @returns {Promise<void>}
 */
const startServer = async () => {
    try {
        log.info("Connecting to database...");
        await connectDB();
        log.info("Database connected successfully.");

        const httpServer = http.createServer(app);
        initSocketServer(httpServer);

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