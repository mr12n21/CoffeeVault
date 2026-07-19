import type { Recipe, RecipeInput } from "./types";

export function useRecipes() {
  const { apiFetch } = useApi();

  const listRecipes = () => apiFetch<Recipe[]>("/recipes");
  const getRecipe = (id: string) => apiFetch<Recipe>(`/recipes/${id}`);
  const createRecipe = (input: Partial<RecipeInput>) =>
    apiFetch<Recipe>("/recipes", { method: "POST", body: input });
  const updateRecipe = (id: string, input: Partial<RecipeInput>) =>
    apiFetch<Recipe>(`/recipes/${id}`, { method: "PUT", body: input });
  const deleteRecipe = (id: string) => apiFetch<void>(`/recipes/${id}`, { method: "DELETE" });

  return { listRecipes, getRecipe, createRecipe, updateRecipe, deleteRecipe };
}
