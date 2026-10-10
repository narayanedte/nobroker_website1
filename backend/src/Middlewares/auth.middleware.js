import { verifyToken } from "../utils/Jwt.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

const findUserForAuth = async (userId) => {
  if (globalThis.__dbAvailable === true) {
    const { default: UserModel } = await import("../Models/userModel.db.js");
    return UserModel.findById(userId).select("-password");
  }

  return globalThis.__memoryUsers?.find((user) => user._id.toString() === userId.toString());
};

export const protect = catchAsync(async (req, res, next) => {
  let token = req.cookies?.token;

  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not logged in. Please login to continue.", 401)
    );
  }

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    return next(
      new AppError("Invalid or expired session. Please login again.", 401)
    );
  }

  const user = await findUserForAuth(decoded.userId);

  if (!user) {
    return next(
      new AppError("The user belonging to this token no longer exists.", 401)
    );
  }

  req.user = user;
  next();
});

export const restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action.", 403)
      );
    }
    next();
  };