const mongoose = require("mongoose");
async function connectDB() {
    const uri = process.env.MONGO_URI;
    if(!uri) {
        console.error("MongoDB connection failed: MONGO_URI is missing. Create a .env file from .env.example.");
        process.exit(1);
    }
    try {
        await mongoose.connect(uri);
        console.log("MongoDB connected");
    } catch(error) {
        console.error("MongoDB connection failed:" , error.message);
        process.exit(1);
    }
}
module.exports = connectDB;
