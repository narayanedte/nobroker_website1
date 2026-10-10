import mongoose from "mongoose";

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/nobroker";
  globalThis.__dbAvailable = false;

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10,
    });

    globalThis.__dbAvailable = true;
    console.log("MongoDB Connected");
    return true;
  } catch (err) {
    globalThis.__dbAvailable = false;
    console.warn("MongoDB connection warning:", err.message);
    console.warn(
      "Continuing without a database connection. Set MONGO_URI to a reachable MongoDB instance for full functionality."
    );
    return false;
  }
};

export default connectDB;