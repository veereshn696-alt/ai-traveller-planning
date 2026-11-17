const mongoose = require("mongoose");

// Disable query buffering to fail fast if connection is offline
mongoose.set("bufferCommands", false);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected Successfully!");
  } catch (error) {
    console.error("==================================================================");
    console.error("⚠️  Database Connection Failed!");
    console.error(`Reason: ${error.message}`);
    console.error("Please verify MONGO_URI and password inside backend/.env");
    console.error("Server is running, but database operations will fail.");
    console.error("==================================================================");
  }
};

module.exports = connectDB;