import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 8000;

let server;

// --- Fail fast on unhandled promise rejections (e.g. bad DB queries) ---
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! Shutting down...", err);
  if (server) server.close(() => process.exit(1));
  else process.exit(1);
});

const startServer = async () => {
  await connectDB();

  server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer().catch((err) => {
  console.error("Failed to start server:", err.message);
  process.exit(1);
});

// --- Graceful shutdown (Ctrl+C, deploy restarts, etc.) ---
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  if (server) {
    server.close(() => process.exit(0));
  }
});