import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt.js";

export interface AuthedRequest extends Request {
  user?: { id: string; email: string };
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing bearer token" });
  }

  try {
    const payload = verifyToken(header.slice("Bearer ".length));
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
