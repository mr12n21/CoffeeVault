export interface FreezerCycle {
  id: string;
  bean: string;
  frozen_at: string;
  thawed_at?: string;
  notes?: string;
  created_at: string;
}

export type FreezerCycleInput = Omit<FreezerCycle, "id" | "created_at">;
