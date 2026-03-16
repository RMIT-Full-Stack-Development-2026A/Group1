import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./config/db.config.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
    await connectDB();
    console.log(`Server running on port: ${PORT}`);
});