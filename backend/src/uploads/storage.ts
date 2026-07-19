import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import multer from "multer";

const UPLOADS_DIR = process.env.UPLOADS_DIR ?? "/data/uploads";
const ALLOWED_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/heic": ".heic",
};

export const PHOTO_FILENAME_RE = /^[0-9a-f-]+\.\w{2,5}$/i;

export function beanPhotosDir(beanId: string): string {
  const safeId = beanId.replace(/[^a-zA-Z0-9_:]/g, "");
  return path.join(UPLOADS_DIR, "coffee_bean", safeId);
}

function imageFileFilter(_req: unknown, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  if (!(file.mimetype in ALLOWED_MIME)) {
    return cb(new Error("Unsupported image type"));
  }
  cb(null, true);
}

export const beanPhotoUpload = multer({
  storage: multer.diskStorage({
    destination: (req, _file, cb) => {
      const dir = beanPhotosDir((req.params as { id: string }).id);
      fs.mkdir(dir, { recursive: true }, (err) => cb(err, dir));
    },
    filename: (_req, file, cb) => {
      cb(null, `${randomUUID()}${ALLOWED_MIME[file.mimetype]}`);
    },
  }),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: imageFileFilter,
});

export const ocrPhotoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: imageFileFilter,
});
