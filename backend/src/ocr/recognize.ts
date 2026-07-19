import { createWorker } from "tesseract.js";

const TESSERACT_CACHE_DIR = process.env.TESSERACT_CACHE_DIR ?? "/data/tesseract-cache";

export async function recognizeImages(imageBuffers: Buffer[]): Promise<string[]> {
  const worker = await createWorker("eng+ces", undefined, { cachePath: TESSERACT_CACHE_DIR });
  try {
    const results: string[] = [];
    for (const buffer of imageBuffers) {
      const {
        data: { text },
      } = await worker.recognize(buffer);
      results.push(text.trim());
    }
    return results;
  } finally {
    await worker.terminate();
  }
}
