import type { CoffeeBean, FreezerCycle } from "~/composables/types";

export type RoastStatusKind = "resting" | "peak" | "declining" | "past_peak" | "frozen";

export interface RoastStatus {
  trueAgeDays: number;
  kind: RoastStatusKind;
  label: string;
}

const MS_PER_DAY = 86_400_000;

// "True Resting Age" = calendar days since roast, minus any time spent frozen (coffee ages
// far slower once frozen). Peak window (7–21 days) is a common rule of thumb for filter
// roasts — deliberately simple and shown in the UI so it reads as a heuristic, not gospel.
export function computeRoastStatus(bean: CoffeeBean, cycles: FreezerCycle[]): RoastStatus | null {
  if (!bean.roast_date) return null;

  const roastDate = new Date(bean.roast_date);
  const now = new Date();
  const beanCycles = cycles.filter((c) => c.bean === bean.id);
  const isCurrentlyFrozen = beanCycles.some((c) => !c.thawed_at);

  let frozenDays = 0;
  for (const cycle of beanCycles) {
    const start = new Date(cycle.frozen_at);
    const end = cycle.thawed_at ? new Date(cycle.thawed_at) : now;
    frozenDays += Math.max(0, (end.getTime() - start.getTime()) / MS_PER_DAY);
  }

  const calendarAgeDays = Math.max(0, (now.getTime() - roastDate.getTime()) / MS_PER_DAY);
  const trueAgeDays = Math.max(0, calendarAgeDays - frozenDays);
  const rounded = Math.round(trueAgeDays);

  if (isCurrentlyFrozen) {
    return { trueAgeDays, kind: "frozen", label: `Frozen · ${rounded}d true age` };
  }
  if (trueAgeDays < 4) return { trueAgeDays, kind: "resting", label: `Resting · day ${rounded}` };
  if (trueAgeDays <= 21) return { trueAgeDays, kind: "peak", label: `Peak window · day ${rounded}` };
  if (trueAgeDays <= 35) return { trueAgeDays, kind: "declining", label: `Declining · day ${rounded}` };
  return { trueAgeDays, kind: "past_peak", label: `Past peak · day ${rounded}` };
}

export function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
