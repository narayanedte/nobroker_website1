import express from "express";

import { register, login, logout, me } from "../Controllers/authController.js";
import { protect } from "../Middlewares/auth.middleware.js";

const router = express.Router();

// Public
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

// Protected
router.get("/me", protect, me);

export default router;