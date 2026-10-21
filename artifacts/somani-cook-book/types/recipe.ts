export const RECIPE_CATEGORIES = [
  'Mains',
  'Snacks',
  'Sweets',
  'Drinks',
  'Sides',
] as const;

export type RecipeCategory = (typeof RECIPE_CATEGORIES)[number];

export interface Recipe {
  id: string;
  title: string;
  chef: string;
  category: RecipeCategory;
  story: string;
  ingredients: string[];
  steps: string[];
  photoUri?: string;
  videoUri?: string;
  createdAt: string;
}
