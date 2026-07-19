import "dotenv/config";
import express, { type NextFunction, type Request, type Response } from "express";
import helmet from "helmet";
import { bootstrapUsers } from "./auth/bootstrapUsers.js";
import { connectDb } from "./db/surreal.js";
import { apiLimiter } from "./middleware/rateLimit.js";
import { authRouter } from "./routes/auth.js";
import { beansRouter } from "./routes/beans.js";
import { freezerCyclesRouter } from "./routes/freezerCycles.js";
import { healthRouter } from "./routes/health.js";
import { kofioRouter } from "./routes/kofio.js";
import { ocrRouter } from "./routes/ocr.js";
import { recipesRouter } from "./routes/recipes.js";

const PORT = Number(process.env.API_PORT ?? 4000);

const INSECURE_JWT_SECRETS = new Set(["change_me_to_a_long_random_string", "dev_secret_change_me", ""]);
const jwtSecret = process.env.JWT_SECRET ?? "";
if (INSECURE_JWT_SECRETS.has(jwtSecret) || jwtSecret.length < 16) {
  console.error(
    "Refusing to start: JWT_SECRET is missing or insecure. Set a strong, random JWT_SECRET (16+ chars) in your environment.",
  );
  process.exit(1);
}

if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD.length < 8) {
  console.error("Refusing to start: ADMIN_EMAIL and ADMIN_PASSWORD (8+ chars) must be set in your environment.");
  process.exit(1);
}

async function main() {
  await connectDb();
  await bootstrapUsers();

  const app = express();
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(express.json({ limit: "3mb" }));
  app.use(apiLimiter);

  app.use("/health", healthRouter);
  app.use("/auth", authRouter);
  app.use("/beans", beansRouter);
  app.use("/freezer-cycles", freezerCyclesRouter);
  app.use("/recipes", recipesRouter);
  app.use("/kofio", kofioRouter);
  app.use("/ocr", ocrRouter);

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  });

  app.listen(PORT, () => {
    console.log(`Coffee Vault API listening on :${PORT}`);
  });
}

main().catch((err) => {
  console.error("Failed to start API", err);
  process.exit(1);
});
