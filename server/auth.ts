/**
 * Authentication middleware and helpers
 */
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";

// Extend express-session types
declare module "express-session" {
  interface SessionData {
    userId: number;
    username: string;
  }
}

/**
 * Middleware to require authentication.
 * Returns 401 if the user is not logged in.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

/**
 * Get the current user ID from session, or return 0 (unauthenticated).
 */
export function getCurrentUserId(req: Request): number {
  return req.session?.userId ?? 0;
}

/**
 * Hash a plain-text password.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Compare a plain-text password against a stored hash.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
