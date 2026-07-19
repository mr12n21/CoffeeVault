import fs from "node:fs/promises";
import path from "node:path";
import type { NextFunction, Response } from "express";
import { Router } from "express";
import { db } from "../db/surreal.js";
import { requireAuth, type AuthedRequest } from "../middleware/requireAuth.js";
import type { CoffeeBean } from "../models/CoffeeBean.js";
import { beanPhotosDir, beanPhotoUpload, PHOTO_FILENAME_RE } from "../uploads/storage.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { coffeeBeanCreateSchema, coffeeBeanUpdateSchema, validateBody } from "../validation.js";

export const beansRouter = Router();
beansRouter.use(requireAuth);

beansRouter.param("id", (req, res, next, id) => {
  if (!/^coffee_bean:[a-zA-Z0-9]+$/.test(id)) return res.status(400).json({ error: "Invalid id" });
  next();
});

function withDates<T extends { roast_date?: unknown; purchase_date?: unknown }>(input: T) {
  const result: Record<string, unknown> = { ...input };
  if (input.roast_date) result.roast_date = new Date(input.roast_date as string);
  if (input.purchase_date) result.purchase_date = new Date(input.purchase_date as string);
  return result;
}

async function requireOwnBean(req: AuthedRequest, res: Response, next: NextFunction) {
  const [existing] = await db.query<[CoffeeBean[]]>(
    "SELECT id FROM coffee_bean WHERE id = <record> $id AND owner = <record> $owner",
    { id: req.params.id, owner: req.user!.id },
  );
  if (!existing[0]) return res.status(404).json({ error: "Not found" });
  next();
}

beansRouter.get(
  "/",
  asyncHandler<AuthedRequest>(async (req, res) => {
    const archived = req.query.archived === "true";
    const [beans] = await db.query<[CoffeeBean[]]>(
      "SELECT * FROM coffee_bean WHERE owner = <record> $owner AND archived = $archived ORDER BY created_at DESC",
      { owner: req.user!.id, archived },
    );
    res.json(beans);
  }),
);

beansRouter.post(
  "/",
  validateBody(coffeeBeanCreateSchema),
  asyncHandler<AuthedRequest>(async (req, res) => {
    const input = withDates(req.body);
    const [created] = await db.query<[CoffeeBean[]]>(
      "CREATE coffee_bean CONTENT ($input + { owner: <record> $owner })",
      { input, owner: req.user!.id },
    );
    res.status(201).json(created[0]);
  }),
);

beansRouter.get(
  "/:id",
  asyncHandler<AuthedRequest>(async (req, res) => {
    const [beans] = await db.query<[CoffeeBean[]]>(
      "SELECT * FROM coffee_bean WHERE id = <record> $id AND owner = <record> $owner",
      { id: req.params.id, owner: req.user!.id },
    );
    if (!beans[0]) return res.status(404).json({ error: "Not found" });
    res.json(beans[0]);
  }),
);

beansRouter.put(
  "/:id",
  validateBody(coffeeBeanUpdateSchema),
  asyncHandler<AuthedRequest>(async (req, res) => {
    const [existing] = await db.query<[CoffeeBean[]]>(
      "SELECT id FROM coffee_bean WHERE id = <record> $id AND owner = <record> $owner",
      { id: req.params.id, owner: req.user!.id },
    );
    if (!existing[0]) return res.status(404).json({ error: "Not found" });

    const input = withDates(req.body);
    const [updated] = await db.query<[CoffeeBean[]]>("UPDATE <record> $id MERGE $input", {
      id: req.params.id,
      input,
    });
    res.json(updated[0]);
  }),
);

beansRouter.delete(
  "/:id",
  asyncHandler<AuthedRequest>(async (req, res) => {
    const [existing] = await db.query<[CoffeeBean[]]>(
      "SELECT id FROM coffee_bean WHERE id = <record> $id AND owner = <record> $owner",
      { id: req.params.id, owner: req.user!.id },
    );
    if (!existing[0]) return res.status(404).json({ error: "Not found" });

    await db.query("DELETE <record> $id", { id: req.params.id });
    res.status(204).send();
  }),
);

beansRouter.post(
  "/:id/photos",
  asyncHandler<AuthedRequest>(requireOwnBean),
  beanPhotoUpload.single("photo"),
  asyncHandler<AuthedRequest>(async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No photo uploaded" });
    const [updated] = await db.query<[CoffeeBean[]]>("UPDATE <record> $id SET photos += $filename", {
      id: req.params.id,
      filename: req.file.filename,
    });
    res.status(201).json(updated[0]);
  }),
);

beansRouter.get(
  "/:id/photos/:filename",
  asyncHandler<AuthedRequest>(requireOwnBean),
  asyncHandler<AuthedRequest>(async (req, res) => {
    if (!PHOTO_FILENAME_RE.test(req.params.filename)) return res.status(400).json({ error: "Invalid filename" });
    const filePath = path.join(beanPhotosDir(req.params.id), req.params.filename);
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({ error: "Not found" });
    }
    res.sendFile(filePath);
  }),
);

beansRouter.delete(
  "/:id/photos/:filename",
  asyncHandler<AuthedRequest>(requireOwnBean),
  asyncHandler<AuthedRequest>(async (req, res) => {
    if (!PHOTO_FILENAME_RE.test(req.params.filename)) return res.status(400).json({ error: "Invalid filename" });
    const filePath = path.join(beanPhotosDir(req.params.id), req.params.filename);
    await fs.unlink(filePath).catch(() => undefined);
    const [updated] = await db.query<[CoffeeBean[]]>("UPDATE <record> $id SET photos -= $filename", {
      id: req.params.id,
      filename: req.params.filename,
    });
    res.json(updated[0]);
  }),
);
