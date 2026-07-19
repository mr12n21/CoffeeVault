import { Router } from "express";
import { db } from "../db/surreal.js";
import { requireAuth, type AuthedRequest } from "../middleware/requireAuth.js";
import type { CoffeeBean, CoffeeBeanInput } from "../models/CoffeeBean.js";

export const beansRouter = Router();
beansRouter.use(requireAuth);

beansRouter.get("/", async (req: AuthedRequest, res) => {
  const [beans] = await db.query<[CoffeeBean[]]>(
    "SELECT * FROM coffee_bean WHERE owner = <record> $owner ORDER BY created_at DESC",
    { owner: req.user!.id },
  );
  res.json(beans);
});

beansRouter.post("/", async (req: AuthedRequest, res) => {
  const input = req.body as CoffeeBeanInput;
  const [created] = await db.query<[CoffeeBean[]]>(
    "CREATE coffee_bean CONTENT { ...$input, owner: <record> $owner }",
    { input, owner: req.user!.id },
  );
  res.status(201).json(created[0]);
});

beansRouter.get("/:id", async (req: AuthedRequest, res) => {
  const [beans] = await db.query<[CoffeeBean[]]>(
    "SELECT * FROM coffee_bean WHERE id = <record> $id AND owner = <record> $owner",
    { id: req.params.id, owner: req.user!.id },
  );
  if (!beans[0]) return res.status(404).json({ error: "Not found" });
  res.json(beans[0]);
});

beansRouter.put("/:id", async (req: AuthedRequest, res) => {
  const [existing] = await db.query<[CoffeeBean[]]>(
    "SELECT id FROM coffee_bean WHERE id = <record> $id AND owner = <record> $owner",
    { id: req.params.id, owner: req.user!.id },
  );
  if (!existing[0]) return res.status(404).json({ error: "Not found" });

  const [updated] = await db.query<[CoffeeBean[]]>(
    "UPDATE <record> $id MERGE $input",
    { id: req.params.id, input: req.body as Partial<CoffeeBeanInput> },
  );
  res.json(updated[0]);
});

beansRouter.delete("/:id", async (req: AuthedRequest, res) => {
  const [existing] = await db.query<[CoffeeBean[]]>(
    "SELECT id FROM coffee_bean WHERE id = <record> $id AND owner = <record> $owner",
    { id: req.params.id, owner: req.user!.id },
  );
  if (!existing[0]) return res.status(404).json({ error: "Not found" });

  await db.query("DELETE <record> $id", { id: req.params.id });
  res.status(204).send();
});
