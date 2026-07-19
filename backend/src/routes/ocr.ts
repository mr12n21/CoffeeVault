import { Router } from "express";
import { guessBeanFieldsFromText } from "../ocr/guessFields.js";
import { recognizeImages } from "../ocr/recognize.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { ocrLimiter } from "../middleware/rateLimit.js";
import { ocrPhotoUpload } from "../uploads/storage.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const ocrRouter = Router();
ocrRouter.use(requireAuth, ocrLimiter);

ocrRouter.post(
  "/",
  ocrPhotoUpload.array("photos", 3),
  asyncHandler(async (req, res) => {
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    if (!files.length) return res.status(400).json({ error: "No photos uploaded" });

    const texts = await recognizeImages(files.map((f) => f.buffer));
    const text = texts.filter(Boolean).join("\n---\n");
    const guess = guessBeanFieldsFromText(text);
    res.json({ text, guess });
  }),
);
