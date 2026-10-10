import jwt from "jsonwebtoken";

const getJwtSecret = () => process.env.JWT_SECRET || "dev-secret-change-me";

export const signToken = (payload) =>
  jwt.sign(payload, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

export const verifyToken = (token) => jwt.verify(token, getJwtSecret());