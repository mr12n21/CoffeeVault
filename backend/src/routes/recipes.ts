import { Router } from "express";
import { db } from "../db/surreal.js";
import { requireAuth, type AuthedRequest } from "../middleware/requireAuth.js";
import type { Recipe, RecipeInput } from "../models/Recipe.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const recipesRouter = Router();
recipesRouter.use(requireAuth);

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
  asyncHandler<AuthedRequest>(async (req, res) => {
    const input = req.body as RecipeInput;
    const [created] = await db.query<[Recipe[]]>(
      "CREATE recipe CONTENT ($input + { owner: <record> $owner })",
      { input, owner: req.user!.id },
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
  asyncHandler<AuthedRequest>(async (req, res) => {
    const [existing] = await db.query<[Recipe[]]>(
      "SELECT id FROM recipe WHERE id = <record> $id AND owner = <record> $owner",
      { id: req.params.id, owner: req.user!.id },
    );
    if (!existing[0]) return res.status(404).json({ error: "Not found" });

    const [updated] = await db.query<[Recipe[]]>("UPDATE <record> $id MERGE $input", {
      id: req.params.id,
      input: req.body as Partial<RecipeInput>,
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
