import { Router } from "express";
import { db } from "../db/surreal.js";
import { requireAuth, type AuthedRequest } from "../middleware/requireAuth.js";
import type { CoffeeBean } from "../models/CoffeeBean.js";
import type { FreezerCycle } from "../models/FreezerCycle.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { freezerCycleCreateSchema, freezerCycleUpdateSchema, validateBody } from "../validation.js";

export const freezerCyclesRouter = Router();
freezerCyclesRouter.use(requireAuth);

freezerCyclesRouter.param("id", (req, res, next, id) => {
  if (!/^freezer_cycle:[a-zA-Z0-9]+$/.test(id)) return res.status(400).json({ error: "Invalid id" });
  next();
});

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
  validateBody(freezerCycleCreateSchema),
  asyncHandler<AuthedRequest>(async (req, res) => {
    if (!(await assertBeanOwnership(req.body.bean, req.user!.id))) {
      return res.status(404).json({ error: "Bean not found" });
    }

    const [created] = await db.query<[FreezerCycle[]]>(
      "CREATE freezer_cycle CONTENT ($input + { bean: <record> $bean })",
      { input: withDates(req.body), bean: req.body.bean },
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
  validateBody(freezerCycleUpdateSchema),
  asyncHandler<AuthedRequest>(async (req, res) => {
    const [existing] = await db.query<[FreezerCycle[]]>(
      "SELECT id FROM freezer_cycle WHERE id = <record> $id AND bean.owner = <record> $owner",
      { id: req.params.id, owner: req.user!.id },
    );
    if (!existing[0]) return res.status(404).json({ error: "Not found" });

    const input = withDates(req.body);
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
