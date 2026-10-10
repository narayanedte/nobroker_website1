import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import { signToken } from "../utils/Jwt.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

const memoryUsers = [];
globalThis.__memoryUsers = memoryUsers;

const isDatabaseReady = () => globalThis.__dbAvailable === true;

const loadUserModel = async () => {
  if (!isDatabaseReady()) {
    return null;
  }

  const { default: UserModel } = await import("../Models/userModel.db.js");
  return UserModel;
};

const createMemoryUser = async (userData) => {
  const hashedPassword = await bcrypt.hash(userData.password, 12);
  const user = {
    _id: new mongoose.Types.ObjectId().toString(),
    fullName: userData.fullName,
    email: userData.email,
    phone: userData.phone,
    password: hashedPassword,
    role: userData.role || "user",
    terms_conditions: userData.terms_conditions || false,
    created_at: new Date(),
    updated_at: new Date(),
    toJSON() {
      const clone = { ...this };
      delete clone.password;
      return clone;
    },
  };

  memoryUsers.push(user);
  return user;
};

const findUserRecord = async (query) => {
  if (!isDatabaseReady()) {
    if (query?.$or) {
      return memoryUsers.find((user) =>
        query.$or.some((condition) => {
          if (condition.email) return user.email === condition.email;
          if (condition.phone) return user.phone === condition.phone;
          return false;
        })
      );
    }

    if (query?.email) {
      return memoryUsers.find((user) => user.email === query.email);
    }

    if (query?.phone) {
      return memoryUsers.find((user) => user.phone === query.phone);
    }

    if (query?._id) {
      return memoryUsers.find((user) => user._id.toString() === query._id.toString());
    }

    return null;
  }

  const UserModel = await loadUserModel();
  if (!UserModel) {
    return null;
  }

  return UserModel.findOne(query);
};

const createUserRecord = async (userData) => {
  if (isDatabaseReady()) {
    const UserModel = await loadUserModel();
    if (!UserModel) {
      return createMemoryUser(userData);
    }

    return UserModel.create(userData);
  }

  return createMemoryUser(userData);
};

const comparePassword = async (password, user) => {
  if (typeof user.comparePassword === "function") {
    return user.comparePassword(password);
  }

  return bcrypt.compare(password, user.password);
};

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

const buildAuthResponse = (user) => {
  const token = signToken({
    userId: user._id.toString(),
    role: user.role,
    email: user.email,
  });

  return {
    token,
    user: user.toJSON ? user.toJSON() : user,
  };
};

// ======================================================
// REGISTER
// ======================================================
export const register = catchAsync(async (req, res, next) => {
  const { fullName, email, phone, password, terms_conditions } = req.body;

  if (!fullName || !email || !phone || !password) {
    return next(
      new AppError("Full name, email, phone and password are required", 400)
    );
  }

  const normalizedEmail = email.toLowerCase().trim();

  const existing = await findUserRecord({
    $or: [{ email: normalizedEmail }, { phone }],
  });

  if (existing) {
    return next(new AppError("Email or phone already registered", 409));
  }

  const user = await createUserRecord({
    fullName,
    email: normalizedEmail,
    phone,
    password,
    terms_conditions,
  });

  const auth = buildAuthResponse(user);
  res.cookie("token", auth.token, getCookieOptions());

  return res.status(201).json({
    success: true,
    message: "Registration successful",
    data: auth,
  });
});

// ======================================================
// LOGIN
// ======================================================
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Email and password are required", 400));
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await findUserRecord({ email: normalizedEmail });

  if (!user) {
    return next(new AppError("Invalid email or password", 401));
  }

  const matched = await comparePassword(password, user);

  if (!matched) {
    return next(new AppError("Invalid email or password", 401));
  }

  const auth = buildAuthResponse(user);
  res.cookie("token", auth.token, getCookieOptions());

  return res.status(200).json({
    success: true,
    message: "Login successful",
    data: auth,
  });
});

// ======================================================
// LOGOUT
// ======================================================
export const logout = catchAsync(async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  });

  return res.status(200).json({
    success: true,
    message: "Logout successful",
  });
});

// ======================================================
// CURRENT USER
// ======================================================
export const me = catchAsync(async (req, res) => {
  return res.status(200).json({
    success: true,
    data: req.user,
  });
});
