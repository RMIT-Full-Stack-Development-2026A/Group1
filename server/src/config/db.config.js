import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`Connected to database successfully`);
    } catch (error) {
        console.log("Error connecting to MongoDB,", error.message);
        await mongoose.disconnect(); // close the MongoDB connection
        process.exit(1); // 1 is failure, 0 is success
    }
};