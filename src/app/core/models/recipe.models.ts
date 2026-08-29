export type IngredientUnit =
  | 'g'
  | 'kg'
  | 'ml'
  | 'l'
  | 'piece'
  | 'tbsp'
  | 'tsp';

export type TimeCategory = 'quick' | 'medium' | 'complex';

export type Cuisine =
  | 'German'
  | 'Italian'
  | 'Japanese'
  | 'Indian'
  | 'Gourmet'
  | 'Fusion';

export type Diet = 'Vegetarian' | 'Vegan' | 'Keto' | 'None';

export interface Ingredient {
  name: string;
  quantity: number;
  unit: IngredientUnit;
}

export interface GenerationPreferences {
  portions: number;
  cookingPeople: number;
  timeCategory: TimeCategory;
  cuisine: Cuisine;
  diet: Diet;
}

export interface RecipeNutrition {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface RecipeIngredient {
  name: string;
  quantity: number;
  unit: string;
  suppliedByUser: boolean;
}

export interface RecipeStep {
  order: number;
  title: string;
  instruction: string;
  cook: number;
  parallelGroup?: string;
}

export interface Recipe {
  id?: string;
  title: string;
  cuisine: Cuisine;
  diet: Diet;
  cookingTimeMinutes: number;
  portions: number;
  usedIngredientRatio: number;
  missingIngredients: string[];
  ingredients: RecipeIngredient[];
  nutritionPerPortion: RecipeNutrition;
  steps: RecipeStep[];
  likes?: number;
  createdAt?: string;
}

export interface GenerateRecipeRequest {
  ingredients: Ingredient[];
  preferences: GenerationPreferences;
}

export interface QuotaSnapshot {
  remainingForIp: number;
  remainingSystemWide: number;
  resetsAt: string;
}

export interface GenerateRecipeResponse {
  recipes: Recipe[];
  quota: QuotaSnapshot;
}
