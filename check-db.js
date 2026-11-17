const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "backend", ".env") });

async function checkDatabase() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("Error: MONGO_URI not found in backend/.env");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  try {
    await mongoose.connect(uri);
    console.log("Connected successfully!");

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    console.log("\n--- Collections inside database ---");
    if (collections.length === 0) {
      console.log("No collections found. The database is empty.");
    } else {
      for (let col of collections) {
        const count = await db.collection(col.name).countDocuments();
        console.log(`- ${col.name}: ${count} document(s)`);
      }
    }
  } catch (error) {
    console.error("Failed to connect or query MongoDB:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB.");
  }
}

checkDatabase();
