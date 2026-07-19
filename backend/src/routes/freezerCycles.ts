import { Router } from "express";
import { db } from "../db/surreal.js";
import { requireAuth, type AuthedRequest } from "../middleware/requireAuth.js";
import type { CoffeeBean } from "../models/CoffeeBean.js";
import type { FreezerCycle, FreezerCycleInput } from "../models/FreezerCycle.js";

export const freezerCyclesRouter = Router();
freezerCyclesRouter.use(requireAuth);

async function assertBeanOwnership(beanId: string, ownerId: string): Promise<boolean> {
  const [beans] = await db.query<[CoffeeBean[]]>(
    "SELECT id FROM coffee_bean WHERE id = <record> $id AND owner = <record> $owner",
    { id: beanId, owner: ownerId },
  );
  return Boolean(beans[0]);
}

freezerCyclesRouter.get("/", async (req: AuthedRequest, res) => {
  const [cycles] = await db.query<[FreezerCycle[]]>(
    "SELECT * FROM freezer_cycle WHERE bean.owner = <record> $owner ORDER BY frozen_at DESC",
    { owner: req.user!.id },
  );
  res.json(cycles);
});

freezerCyclesRouter.post("/", async (req: AuthedRequest, res) => {
  const input = req.body as FreezerCycleInput;
  if (!(await assertBeanOwnership(input.bean, req.user!.id))) {
    return res.status(404).json({ error: "Bean not found" });
  }

  const [created] = await db.query<[FreezerCycle[]]>(
    "CREATE freezer_cycle CONTENT ($input + { bean: <record> $bean })",
    { input, bean: input.bean },
  );
  res.status(201).json(created[0]);
});

freezerCyclesRouter.get("/:id", async (req: AuthedRequest, res) => {
  const [cycles] = await db.query<[FreezerCycle[]]>(
    "SELECT * FROM freezer_cycle WHERE id = <record> $id AND bean.owner = <record> $owner",
    { id: req.params.id, owner: req.user!.id },
  );
  if (!cycles[0]) return res.status(404).json({ error: "Not found" });
  res.json(cycles[0]);
});

freezerCyclesRouter.put("/:id", async (req: AuthedRequest, res) => {
  const [existing] = await db.query<[FreezerCycle[]]>(
    "SELECT id FROM freezer_cycle WHERE id = <record> $id AND bean.owner = <record> $owner",
    { id: req.params.id, owner: req.user!.id },
  );
  if (!existing[0]) return res.status(404).json({ error: "Not found" });

  const [updated] = await db.query<[FreezerCycle[]]>(
    "UPDATE <record> $id MERGE $input",
    { id: req.params.id, input: req.body as Partial<FreezerCycleInput> },
  );
  res.json(updated[0]);
});

freezerCyclesRouter.delete("/:id", async (req: AuthedRequest, res) => {
  const [existing] = await db.query<[FreezerCycle[]]>(
    "SELECT id FROM freezer_cycle WHERE id = <record> $id AND bean.owner = <record> $owner",
    { id: req.params.id, owner: req.user!.id },
  );
  if (!existing[0]) return res.status(404).json({ error: "Not found" });

  await db.query("DELETE <record> $id", { id: req.params.id });
  res.status(204).send();
});
