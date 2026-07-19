import type { CoffeeBean, CoffeeBeanInput } from "./types";

export function useBeans() {
  const { apiFetch } = useApi();
  const config = useRuntimeConfig();

  const photoUrl = (beanId: string, filename: string) => `${config.public.apiBase}/beans/${beanId}/photos/${filename}`;

  const listBeans = (opts?: { archived?: boolean }) =>
    apiFetch<CoffeeBean[]>(`/beans${opts?.archived ? "?archived=true" : ""}`);
  const getBean = (id: string) => apiFetch<CoffeeBean>(`/beans/${id}`);
  const createBean = (input: Partial<CoffeeBeanInput>) =>
    apiFetch<CoffeeBean>("/beans", { method: "POST", body: input });
  const updateBean = (id: string, input: Partial<CoffeeBeanInput>) =>
    apiFetch<CoffeeBean>(`/beans/${id}`, { method: "PUT", body: input });
  const deleteBean = (id: string) => apiFetch<void>(`/beans/${id}`, { method: "DELETE" });

  const uploadBeanPhoto = (id: string, file: File) => {
    const formData = new FormData();
    formData.append("photo", file);
    return apiFetch<CoffeeBean>(`/beans/${id}/photos`, { method: "POST", body: formData });
  };
  const deleteBeanPhoto = (id: string, filename: string) =>
    apiFetch<CoffeeBean>(`/beans/${id}/photos/${filename}`, { method: "DELETE" });

  return { listBeans, getBean, createBean, updateBean, deleteBean, uploadBeanPhoto, deleteBeanPhoto, photoUrl };
}
