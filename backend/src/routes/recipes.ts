import { Router } from "express";
import { db } from "../db/surreal.js";
import { requireAuth, type AuthedRequest } from "../middleware/requireAuth.js";
import type { Recipe } from "../models/Recipe.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { recipeCreateSchema, recipeUpdateSchema, validateBody } from "../validation.js";

export const recipesRouter = Router();
recipesRouter.use(requireAuth);

recipesRouter.param("id", (req, res, next, id) => {
  if (!/^recipe:[a-zA-Z0-9]+$/.test(id)) return res.status(400).json({ error: "Invalid id" });
  next();
});

recipesRouter.get(
  "/",
  asyncHandler<AuthedRequest>(async (req, res) => {
    const [recipes] = await db.query<[Recipe[]]>(
      "SELECT * FROM recipe WHERE owner = <record> $owner ORDER BY created_at DESC",
      { owner: req.user!.id },
    );
    res.json(recipes);
  }),
);

recipesRouter.post(
  "/",
  validateBody(recipeCreateSchema),
  asyncHandler<AuthedRequest>(async (req, res) => {
    const [created] = await db.query<[Recipe[]]>(
      "CREATE recipe CONTENT ($input + { owner: <record> $owner })",
      { input: req.body, owner: req.user!.id },
    );
    res.status(201).json(created[0]);
  }),
);

recipesRouter.get(
  "/:id",
  asyncHandler<AuthedRequest>(async (req, res) => {
    const [recipes] = await db.query<[Recipe[]]>(
      "SELECT * FROM recipe WHERE id = <record> $id AND owner = <record> $owner",
      { id: req.params.id, owner: req.user!.id },
    );
    if (!recipes[0]) return res.status(404).json({ error: "Not found" });
    res.json(recipes[0]);
  }),
);

recipesRouter.put(
  "/:id",
  validateBody(recipeUpdateSchema),
  asyncHandler<AuthedRequest>(async (req, res) => {
    const [existing] = await db.query<[Recipe[]]>(
      "SELECT id FROM recipe WHERE id = <record> $id AND owner = <record> $owner",
      { id: req.params.id, owner: req.user!.id },
    );
    if (!existing[0]) return res.status(404).json({ error: "Not found" });

    const [updated] = await db.query<[Recipe[]]>("UPDATE <record> $id MERGE $input", {
      id: req.params.id,
      input: req.body,
    });
    res.json(updated[0]);
  }),
);

recipesRouter.delete(
  "/:id",
  asyncHandler<AuthedRequest>(async (req, res) => {
    const [existing] = await db.query<[Recipe[]]>(
      "SELECT id FROM recipe WHERE id = <record> $id AND owner = <record> $owner",
      { id: req.params.id, owner: req.user!.id },
    );
    if (!existing[0]) return res.status(404).json({ error: "Not found" });

    await db.query("DELETE <record> $id", { id: req.params.id });
    res.status(204).send();
  }),
);
