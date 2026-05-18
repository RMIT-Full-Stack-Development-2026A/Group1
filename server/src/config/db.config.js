import mongoose from "mongoose";

/**
 * Establishes a connection to the MongoDB database.
 * If the connection fails, it disconnects and exits the Node process.
 * * @returns {Promise<void>} Resolves when the connection is successful.
 */
export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`Connected to database successfully`);
    } catch (error) {
        console.log("Error connecting to MongoDB:", error.message);
        
        // Ensure connection is fully closed before exiting
        await mongoose.disconnect(); 
        
        // Terminate the process with a failure code
        process.exit(1); 
    }
};