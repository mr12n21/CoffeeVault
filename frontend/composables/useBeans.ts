import type { CoffeeBean, CoffeeBeanInput } from "./types";

export function useBeans() {
  const { apiFetch } = useApi();

  const listBeans = () => apiFetch<CoffeeBean[]>("/beans");
  const getBean = (id: string) => apiFetch<CoffeeBean>(`/beans/${id}`);
  const createBean = (input: Partial<CoffeeBeanInput>) =>
    apiFetch<CoffeeBean>("/beans", { method: "POST", body: input });
  const updateBean = (id: string, input: Partial<CoffeeBeanInput>) =>
    apiFetch<CoffeeBean>(`/beans/${id}`, { method: "PUT", body: input });
  const deleteBean = (id: string) => apiFetch<void>(`/beans/${id}`, { method: "DELETE" });

  return { listBeans, getBean, createBean, updateBean, deleteBean };
}
