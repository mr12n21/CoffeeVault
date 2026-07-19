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
