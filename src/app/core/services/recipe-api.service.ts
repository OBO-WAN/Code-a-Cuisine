import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  GenerateRecipeRequest,
  GenerateRecipeResponse
} from '../models/recipe.models';

@Injectable({ providedIn: 'root' })
export class RecipeApiService {
  private readonly http = inject(HttpClient);

  /**
   * Sends a generation request to n8n.
   * n8n performs the authoritative validation, quota check, AI call,
   * Firestore persistence, and response normalization.
   */
  generateRecipes(
    request: GenerateRecipeRequest
  ): Observable<GenerateRecipeResponse> {
    return this.http
      .post<GenerateRecipeResponse>(environment.n8nWebhookUrl, request)
      .pipe(
        map((response) => {
          if (!Array.isArray(response.recipes) || response.recipes.length !== 3) {
            throw new Error('Generation workflow must return exactly 3 recipes.');
          }

          return response;
        })
      );
  }
}
