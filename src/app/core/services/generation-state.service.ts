import { Injectable, signal } from '@angular/core';
import {
  GenerateRecipeResponse,
  GenerationPreferences,
  Ingredient
} from '../models/recipe.models';

const DEFAULT_PREFERENCES: GenerationPreferences = {
  portions: 2,
  cookingPeople: 1,
  timeCategory: 'quick',
  cuisine: 'Italian',
  diet: 'None'
};

@Injectable({ providedIn: 'root' })
export class GenerationStateService {
  readonly ingredients = signal<Ingredient[]>([]);
  readonly preferences = signal<GenerationPreferences>(DEFAULT_PREFERENCES);
  readonly lastResponse = signal<GenerateRecipeResponse | null>(null);

  /**
   * Adds an ingredient to the top of the list so the most recent ingredient
   * matches the interaction note in the supplied Figma design.
   */
  addIngredient(ingredient: Ingredient): void {
    const normalized = {
      ...ingredient,
      name: ingredient.name.trim()
    };

    this.ingredients.update((items) => [normalized, ...items]);
  }

  /** Removes an ingredient by its current list index. */
  removeIngredient(index: number): void {
    this.ingredients.update((items) => items.filter((_, i) => i !== index));
  }

  /** Replaces all current preferences with a validated form value. */
  setPreferences(preferences: GenerationPreferences): void {
    this.preferences.set(preferences);
  }

  /** Stores the latest generation response for the results route. */
  setResponse(response: GenerateRecipeResponse): void {
    this.lastResponse.set(response);
  }
}
