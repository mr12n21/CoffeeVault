import bcrypt from "bcrypt";
import { Router } from "express";
import { db } from "../db/surreal.js";
import { authLimiter } from "../middleware/rateLimit.js";
import type { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { signToken } from "../utils/jwt.js";
import { loginSchema, validateBody } from "../validation.js";

export const authRouter = Router();
authRouter.use(authLimiter);

authRouter.post(
  "/login",
  validateBody(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const [users] = await db.query<[User[]]>("SELECT * FROM user WHERE email = $email", { email });
    const user = users[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = signToken({ sub: user.id, email: user.email });
    res.json({ token, user: { id: user.id, email: user.email } });
  }),
);
