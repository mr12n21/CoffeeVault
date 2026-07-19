import type { FreezerCycle, FreezerCycleInput } from "./types";

export function useFreezerCycles() {
  const { apiFetch } = useApi();

  const listFreezerCycles = () => apiFetch<FreezerCycle[]>("/freezer-cycles");
  const createFreezerCycle = (input: FreezerCycleInput) =>
    apiFetch<FreezerCycle>("/freezer-cycles", { method: "POST", body: input });
  const updateFreezerCycle = (id: string, input: Partial<FreezerCycleInput>) =>
    apiFetch<FreezerCycle>(`/freezer-cycles/${id}`, { method: "PUT", body: input });
  const deleteFreezerCycle = (id: string) => apiFetch<void>(`/freezer-cycles/${id}`, { method: "DELETE" });

  return { listFreezerCycles, createFreezerCycle, updateFreezerCycle, deleteFreezerCycle };
}
