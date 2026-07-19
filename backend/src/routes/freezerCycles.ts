import { Router } from "express";
import { db } from "../db/surreal.js";
import { requireAuth, type AuthedRequest } from "../middleware/requireAuth.js";
import type { CoffeeBean } from "../models/CoffeeBean.js";
import type { FreezerCycle, FreezerCycleInput } from "../models/FreezerCycle.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const freezerCyclesRouter = Router();
freezerCyclesRouter.use(requireAuth);

function withDates<T extends { frozen_at?: unknown; thawed_at?: unknown }>(input: T) {
  const result: Record<string, unknown> = { ...input };
  if (input.frozen_at) result.frozen_at = new Date(input.frozen_at as string);
  if (input.thawed_at) result.thawed_at = new Date(input.thawed_at as string);
  return result;
}

async function assertBeanOwnership(beanId: string, ownerId: string): Promise<boolean> {
  const [beans] = await db.query<[CoffeeBean[]]>(
    "SELECT id FROM coffee_bean WHERE id = <record> $id AND owner = <record> $owner",
    { id: beanId, owner: ownerId },
  );
  return Boolean(beans[0]);
}

freezerCyclesRouter.get(
  "/",
  asyncHandler<AuthedRequest>(async (req, res) => {
    const [cycles] = await db.query<[FreezerCycle[]]>(
      "SELECT * FROM freezer_cycle WHERE bean.owner = <record> $owner ORDER BY frozen_at DESC",
      { owner: req.user!.id },
    );
    res.json(cycles);
  }),
);

freezerCyclesRouter.post(
  "/",
  asyncHandler<AuthedRequest>(async (req, res) => {
    const input = req.body as FreezerCycleInput;
    if (!(await assertBeanOwnership(input.bean, req.user!.id))) {
      return res.status(404).json({ error: "Bean not found" });
    }

    const [created] = await db.query<[FreezerCycle[]]>(
      "CREATE freezer_cycle CONTENT ($input + { bean: <record> $bean })",
      { input: withDates(input), bean: input.bean },
    );
    res.status(201).json(created[0]);
  }),
);

freezerCyclesRouter.get(
  "/:id",
  asyncHandler<AuthedRequest>(async (req, res) => {
    const [cycles] = await db.query<[FreezerCycle[]]>(
      "SELECT * FROM freezer_cycle WHERE id = <record> $id AND bean.owner = <record> $owner",
      { id: req.params.id, owner: req.user!.id },
    );
    if (!cycles[0]) return res.status(404).json({ error: "Not found" });
    res.json(cycles[0]);
  }),
);

freezerCyclesRouter.put(
  "/:id",
  asyncHandler<AuthedRequest>(async (req, res) => {
    const [existing] = await db.query<[FreezerCycle[]]>(
      "SELECT id FROM freezer_cycle WHERE id = <record> $id AND bean.owner = <record> $owner",
      { id: req.params.id, owner: req.user!.id },
    );
    if (!existing[0]) return res.status(404).json({ error: "Not found" });

    const input = withDates(req.body as Partial<FreezerCycleInput>);
    const [updated] = await db.query<[FreezerCycle[]]>("UPDATE <record> $id MERGE $input", {
      id: req.params.id,
      input,
    });
    res.json(updated[0]);
  }),
);

freezerCyclesRouter.delete(
  "/:id",
  asyncHandler<AuthedRequest>(async (req, res) => {
    const [existing] = await db.query<[FreezerCycle[]]>(
      "SELECT id FROM freezer_cycle WHERE id = <record> $id AND bean.owner = <record> $owner",
      { id: req.params.id, owner: req.user!.id },
    );
    if (!existing[0]) return res.status(404).json({ error: "Not found" });

    await db.query("DELETE <record> $id", { id: req.params.id });
    res.status(204).send();
  }),
);
