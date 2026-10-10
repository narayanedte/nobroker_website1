import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import userRoutes from "./Routes/userRoutes.js";
import AppError from "./utils/appError.js";

const app = express();

// --- Core middleware ---
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// --- Health check ---
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "API is up" });
});

// --- Routes ---
app.use("/api/user", userRoutes);

// --- 404 handler (no route matched) ---
app.use((req, res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
});

// --- Global error handler (must have 4 args to be recognized by Express) ---
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(err);
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

export default app;