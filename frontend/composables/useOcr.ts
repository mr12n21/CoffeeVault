import type { OcrGuess } from "./types";

export function useOcr() {
  const { apiFetch } = useApi();

  const recognizePhotos = (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("photos", file));
    return apiFetch<{ text: string; guess: OcrGuess }>("/ocr", { method: "POST", body: formData });
  };

  return { recognizePhotos };
}
