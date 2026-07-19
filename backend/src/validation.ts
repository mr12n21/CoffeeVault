import type { NextFunction, Request, Response } from "express";
import { z, type ZodSchema } from "zod";

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Validation failed", details: result.error.flatten() });
    }
    req.body = result.data;
    next();
  };
}

const dateLike = z.string().refine((v) => !Number.isNaN(Date.parse(v)), { message: "Invalid date" });
const tagList = z.array(z.string().min(1).max(100)).max(50);

export const loginSchema = z.object({
  email: z.string().trim().email().max(320),
  password: z.string().min(1).max(200),
});

export const coffeeBeanCreateSchema = z.object({
  name: z.string().trim().min(1).max(200),
  roaster: z.string().trim().min(1).max(200),
  origin_country: z.string().trim().min(1).max(200),
  variety: z.string().trim().max(200).optional(),
  process: z.string().trim().max(200).optional(),
  roast_date: dateLike.optional(),
  purchase_date: dateLike.optional(),
  roast_level: z.string().trim().max(100).optional(),
  tasting_notes: tagList.default([]),
  recommended_methods: tagList.default([]),
  notes: z.string().trim().max(5000).optional(),
  archived: z.boolean().optional(),
});
export const coffeeBeanUpdateSchema = coffeeBeanCreateSchema.partial();

export const freezerCycleCreateSchema = z.object({
  bean: z.string().trim().regex(/^coffee_bean:/, "Invalid bean id"),
  frozen_at: dateLike,
  thawed_at: dateLike.optional(),
  notes: z.string().trim().max(1000).optional(),
  vial_number: z.string().trim().regex(/^\d{2}$/, "Must be a 2-digit number, e.g. 01").optional(),
  weight_grams: z.number().int().positive().max(5000).optional(),
});
export const freezerCycleUpdateSchema = freezerCycleCreateSchema.partial().omit({ bean: true });

const recipeStepSchema = z.object({
  label: z.string().trim().min(1).max(300),
  time_seconds: z.number().int().min(0).max(3600).optional(),
  water_to_g: z.number().int().min(0).max(5000).optional(),
});

export const recipeCreateSchema = z.object({
  name: z.string().trim().min(1).max(200),
  bean: z.string().trim().regex(/^coffee_bean:/, "Invalid bean id").optional(),
  dripper: z.string().trim().max(200).optional(),
  grind_setting: z.string().trim().max(200).optional(),
  water_temp_profile: z.string().trim().max(200).optional(),
  filter_type: z.string().trim().max(200).optional(),
  brew_steps: z.array(recipeStepSchema).max(50).default([]),
});
export const recipeUpdateSchema = recipeCreateSchema.partial();

export const kofioParseSchema = z
  .object({
    url: z.string().trim().url().optional(),
    html: z.string().min(1).max(2_000_000).optional(),
  })
  .refine((v) => Boolean(v.url) !== Boolean(v.html), {
    message: "Provide exactly one of `url` or `html`",
  });
