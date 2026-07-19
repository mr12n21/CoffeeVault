import { Router } from "express";
import { fetchKofioHtml, KofioFetchError } from "../kofio/fetch.js";
import { parseKofioHtml } from "../kofio/parser.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { kofioLimiter } from "../middleware/rateLimit.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { kofioParseSchema, validateBody } from "../validation.js";

export const kofioRouter = Router();
kofioRouter.use(requireAuth, kofioLimiter);

kofioRouter.post(
  "/parse",
  validateBody(kofioParseSchema),
  asyncHandler(async (req, res) => {
    const { url, html } = req.body as { url?: string; html?: string };

    let sourceHtml: string;
    try {
      sourceHtml = url ? await fetchKofioHtml(url) : (html as string);
    } catch (e) {
      if (e instanceof KofioFetchError) return res.status(422).json({ error: e.message });
      throw e;
    }

    const parsed = parseKofioHtml(sourceHtml, url);
    if (!parsed.origin_country && !parsed.tasting_notes.length) {
      return res.status(422).json({ error: "Could not find coffee metadata on this page" });
    }
    res.json(parsed);
  }),
);
