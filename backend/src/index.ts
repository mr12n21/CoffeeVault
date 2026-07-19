import cors from "cors";
import "dotenv/config";
import express from "express";
import { connectDb } from "./db/surreal.js";
import { authRouter } from "./routes/auth.js";
import { beansRouter } from "./routes/beans.js";
import { freezerCyclesRouter } from "./routes/freezerCycles.js";
import { healthRouter } from "./routes/health.js";
import { recipesRouter } from "./routes/recipes.js";

const PORT = Number(process.env.API_PORT ?? 4000);

async function main() {
  await connectDb();

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use("/health", healthRouter);
  app.use("/auth", authRouter);
  app.use("/beans", beansRouter);
  app.use("/freezer-cycles", freezerCyclesRouter);
  app.use("/recipes", recipesRouter);

  app.listen(PORT, () => {
    console.log(`Coffee Vault API listening on :${PORT}`);
  });
}

main().catch((err) => {
  console.error("Failed to start API", err);
  process.exit(1);
});
