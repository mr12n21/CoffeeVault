export interface CoffeeBean {
  id: string;
  name: string;
  roaster: string;
  origin_country: string;
  variety?: string;
  process?: string;
  roast_date?: string;
  purchase_date?: string;
  roast_level?: string;
  tasting_notes: string[];
  recommended_methods: string[];
  notes?: string;
  archived: boolean;
  photos: string[];
  owner: string;
  created_at: string;
}

export type CoffeeBeanInput = Omit<CoffeeBean, "id" | "owner" | "created_at" | "photos">;

export interface OcrGuess {
  name?: string;
  origin_country?: string;
  process?: string;
  roast_level?: string;
  variety?: string;
  tasting_notes: string[];
}

export interface ParsedKofioBean {
  name: string;
  roaster: string;
  origin_country: string;
  variety?: string;
  process?: string;
  roast_level?: string;
  tasting_notes: string[];
  recommended_methods: string[];
  source_url?: string;
}

export interface FreezerCycle {
  id: string;
  bean: string;
  frozen_at: string;
  thawed_at?: string;
  notes?: string;
  vial_number?: string;
  weight_grams?: number;
  created_at: string;
}

export type FreezerCycleInput = Omit<FreezerCycle, "id" | "created_at">;

export interface RecipeStep {
  label: string;
  time_seconds?: number;
  water_to_g?: number;
}

export interface Recipe {
  id: string;
  bean?: string;
  name: string;
  dripper?: string;
  grind_setting?: string;
  water_temp_profile?: string;
  filter_type?: string;
  brew_steps: RecipeStep[];
  owner: string;
  created_at: string;
}

export type RecipeInput = Omit<Recipe, "id" | "owner" | "created_at">;
