import type { RecipeStep } from "~/composables/types";

export function formatStepTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function formatStepsToText(steps: RecipeStep[]): string {
  return steps.map((s) => (s.time_seconds != null ? `${formatStepTime(s.time_seconds)} ${s.label}` : s.label)).join("\n");
}

export function parseStepsFromText(text: string): RecipeStep[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^(\d{1,2}):(\d{2})\s+(.*)$/);
      const time_seconds = match ? Number(match[1]) * 60 + Number(match[2]) : undefined;
      const label = match ? match[3].trim() : line;
      const gramsMatch = label.match(/(\d+)\s*g\b/i);
      const water_to_g = gramsMatch ? Number(gramsMatch[1]) : undefined;
      return { label, time_seconds, water_to_g };
    });
}
