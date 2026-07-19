export interface Recipe {
  id: string;
  bean?: string;
  name: string;
  dripper?: string;
  grind_setting?: string;
  water_temp_profile?: string;
  filter_type?: string;
  brew_steps: string[];
  owner: string;
  created_at: string;
}

export type RecipeInput = Omit<Recipe, "id" | "owner" | "created_at">;
