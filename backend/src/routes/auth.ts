import bcrypt from "bcrypt";
import { Router } from "express";
import { db } from "../db/surreal.js";
import type { User } from "../models/User.js";
import { signToken } from "../utils/jwt.js";

export const authRouter = Router();

authRouter.post("/register", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (typeof email !== "string" || typeof password !== "string" || password.length < 8) {
    return res.status(400).json({ error: "email and password (min 8 chars) are required" });
  }

  const [existing] = await db.query<[User[]]>("SELECT id FROM user WHERE email = $email", { email });
  if (existing.length > 0) {
    return res.status(409).json({ error: "Email already registered" });
  }

  const password_hash = await bcrypt.hash(password, 12);
  const [created] = await db.query<[User[]]>(
    "CREATE user CONTENT { email: $email, password_hash: $password_hash }",
    { email, password_hash },
  );
  const user = created[0];

  const token = signToken({ sub: user.id, email: user.email });
  res.status(201).json({ token, user: { id: user.id, email: user.email } });
});

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "email and password are required" });
  }

  const [users] = await db.query<[User[]]>("SELECT * FROM user WHERE email = $email", { email });
  const user = users[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = signToken({ sub: user.id, email: user.email });
  res.json({ token, user: { id: user.id, email: user.email } });
});
