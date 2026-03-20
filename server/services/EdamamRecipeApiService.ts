/**
 * Edamam Recipe API Service
 * Uses string IDs (e.g. "recipe_xxx" from Edamam, or "generated_<uuid>" for OpenAI recipes).
 * Caches recipes in the database via storage.setCachedRecipe.
 */

import { Recipe } from '@shared/schema';
import { edamamService } from './edamamApi';
import { storage } from '../storage';

interface RecipeApiService {
  getPopularRecipes(): Promise<Recipe[]>;
  getQuickRecipes(): Promise<Recipe[]>;
  getRecipeById(id: string | number): Promise<Recipe>;
  getSimilarRecipes(id: string | number): Promise<Recipe[]>;
  searchRecipeByName(query: string): Promise<Recipe>;
  getRecipesByIngredients(ingredients: string[]): Promise<Recipe[]>;
  cacheRecipe(recipe: Recipe): Promise<void>;
}

/** Generate a stable string ID for OpenAI-generated recipes */
function generateOpenAIRecipeId(): string {
  return `generated_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Process a raw Edamam hit into our Recipe type (always uses string ID) */
function processEdamamRecipe(raw: any): Recipe {
  const id: string = typeof raw.id === 'string' ? raw.id : String(raw.id ?? generateOpenAIRecipeId());
  return {
    id,
    name: raw.name ?? '',
    image: raw.image ?? null,
    readyInMinutes: raw.readyInMinutes ?? 30,
    servings: raw.servings ?? 4,
    sourceUrl: raw.sourceUrl ?? null,
    summary: raw.summary ?? null,
    instructions: raw.instructions ?? [],
    calories: raw.calories ?? null,
    protein: raw.protein ?? null,
    carbs: raw.carbs ?? null,
    fat: raw.fat ?? null,
    diets: raw.diets ?? [],
    extendedIngredients: raw.extendedIngredients ?? [],
    analyzedInstructions: raw.analyzedInstructions ?? [],
    created_at: raw.created_at ?? new Date(),
  };
}

export class EdamamRecipeApiService implements RecipeApiService {
  /** In-memory cache for hot lookups (DB is the persistent store) */
  private memCache: Map<string, Recipe> = new Map();

  constructor() {
    console.log("Edamam Recipe API Service initialized (string IDs)");
  }

  async cacheRecipe(recipe: Recipe): Promise<void> {
    const id = String(recipe.id);
    this.memCache.set(id, recipe);
    try {
      await storage.setCachedRecipe(recipe);
    } catch (err) {
      console.error(`Failed to persist recipe ${id} to DB:`, err);
    }
  }

  async getPopularRecipes(): Promise<Recipe[]> {
    const popularQueries = ["pasta", "chicken", "burger", "salad", "pizza"];
    const query = popularQueries[Math.floor(Math.random() * popularQueries.length)];
    const raw = await edamamService.searchRecipes(query, 3);
    const recipes = raw.map(processEdamamRecipe);
    await Promise.all(recipes.map((r: Recipe) => this.cacheRecipe(r)));
    return recipes;
  }

  async getQuickRecipes(): Promise<Recipe[]> {
    const quickQueries = ["quick", "fast", "easy", "5 minute", "simple"];
    const query = quickQueries[Math.floor(Math.random() * quickQueries.length)];
    const raw = await edamamService.searchRecipes(query, 5);
    const recipes = raw
      .filter((r: any) => !r.readyInMinutes || r.readyInMinutes <= 30)
      .map(processEdamamRecipe);
    await Promise.all(recipes.map((r: Recipe) => this.cacheRecipe(r)));
    return recipes;
  }

  async getRecipeById(id: string | number): Promise<Recipe> {
    const strId = String(id);

    // 1. Check in-memory cache
    if (this.memCache.has(strId)) {
      return this.memCache.get(strId)!;
    }

    // 2. Check DB cache
    const cached = await storage.getCachedRecipe(strId);
    if (cached) {
      this.memCache.set(strId, cached);
      return cached;
    }

    // 3. Fetch from Edamam if it looks like an Edamam recipe ID
    if (strId.includes('recipe_')) {
      const raw = await edamamService.getRecipeById(strId);
      const recipe = processEdamamRecipe(raw);
      await this.cacheRecipe(recipe);
      return recipe;
    }

    throw new Error(`Recipe with ID ${strId} not found`);
  }

  async getSimilarRecipes(id: string | number): Promise<Recipe[]> {
    let query = 'food';
    try {
      const recipe = await this.getRecipeById(String(id));
      query = recipe.name;
    } catch {
      // Use generic fallback
    }
    const raw = await edamamService.getSimilarRecipes(query);
    const recipes = raw
      .filter((r: any) => String(r.id) !== String(id))
      .map(processEdamamRecipe);
    await Promise.all(recipes.map((r: Recipe) => this.cacheRecipe(r)));
    return recipes;
  }

  async searchRecipeByName(query: string): Promise<Recipe> {
    const raw = await edamamService.searchRecipes(query, 1);
    if (!raw || raw.length === 0) {
      throw new Error(`No results found for query: ${query}`);
    }
    const recipe = processEdamamRecipe(raw[0]);
    await this.cacheRecipe(recipe);
    return recipe;
  }

  async getRecipesByIngredients(ingredients: string[]): Promise<Recipe[]> {
    const query = ingredients.join(' ');
    const raw = await edamamService.searchRecipes(query, 5);
    const recipes = raw.map(processEdamamRecipe);
    await Promise.all(recipes.map((r: Recipe) => this.cacheRecipe(r)));
    return recipes;
  }
}
