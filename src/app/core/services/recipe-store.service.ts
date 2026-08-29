import { Injectable } from '@angular/core';
import {
  FirebaseApp,
  getApp,
  getApps,
  initializeApp
} from 'firebase/app';
import {
  Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  where
} from 'firebase/firestore';
import { environment } from '../../../environments/environment';
import { Cuisine, Recipe } from '../models/recipe.models';

@Injectable({ providedIn: 'root' })
export class RecipeStoreService {
  private readonly app: FirebaseApp = getApps().length
    ? getApp()
    : initializeApp(environment.firebase);
  private readonly db: Firestore = getFirestore(this.app);

  /** Loads the newest public recipes, optionally filtered by cuisine. */
  async listRecipes(pageSize = 20, cuisine?: Cuisine): Promise<Recipe[]> {
    const recipesRef = collection(this.db, 'recipes');

    const recipeQuery = cuisine
      ? query(
          recipesRef,
          where('cuisine', '==', cuisine),
          orderBy('createdAt', 'desc'),
          limit(pageSize)
        )
      : query(recipesRef, orderBy('createdAt', 'desc'), limit(pageSize));

    const snapshot = await getDocs(recipeQuery);

    return snapshot.docs.map((recipeDoc) => ({
      id: recipeDoc.id,
      ...(recipeDoc.data() as Omit<Recipe, 'id'>)
    }));
  }

  /** Loads one public recipe detail document by Firestore id. */
  async getRecipe(id: string): Promise<Recipe | null> {
    const snapshot = await getDoc(doc(this.db, 'recipes', id));

    if (!snapshot.exists()) {
      return null;
    }

    return {
      id: snapshot.id,
      ...(snapshot.data() as Omit<Recipe, 'id'>)
    };
  }
}
