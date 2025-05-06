/**
 * Edamam Recipe API Service
 * Implementation of the RecipeApiService interface using Edamam API
 */

import { Recipe } from '@shared/schema';
import { edamamService } from './edamamApi';

interface RecipeApiService {
  getPopularRecipes(): Promise<Recipe[]>;
  getQuickRecipes(): Promise<Recipe[]>;
  getRecipeById(id: number | string): Promise<Recipe>;
  getSimilarRecipes(id: number | string): Promise<Recipe[]>;
  searchRecipeByName(query: string): Promise<Recipe>;
  getRecipesByIngredients(ingredients: string[]): Promise<Recipe[]>;
}

export class EdamamRecipeApiService implements RecipeApiService {
  private recipeIdCounter: number = 10000; // Starting ID for Edamam recipes that don't have numeric IDs

  constructor() {
    console.log("Edamam Recipe API Service initialized");
  }

  private generateUniqueId(): number {
    return this.recipeIdCounter++;
  }

  async getPopularRecipes(): Promise<Recipe[]> {
    try {
      // For popular recipes, we'll search for common popular dishes
      const popularQueries = ["pasta", "chicken", "burger", "salad", "pizza"];
      const randomIndex = Math.floor(Math.random() * popularQueries.length);
      const query = popularQueries[randomIndex];
      
      const recipes = await edamamService.searchRecipes(query, 3);
      return recipes.map(recipe => ({
        ...recipe,
        id: typeof recipe.id === 'string' ? parseInt(recipe.id, 10) : recipe.id
      }));
    } catch (error) {
      console.error("Error getting popular recipes from Edamam:", error);
      throw error;
    }
  }

  async getQuickRecipes(): Promise<Recipe[]> {
    try {
      // For quick recipes, search for terms that often result in quick recipes
      const quickQueries = ["quick", "fast", "easy", "5 minute", "simple"];
      const randomIndex = Math.floor(Math.random() * quickQueries.length);
      const query = quickQueries[randomIndex];
      
      const recipes = await edamamService.searchRecipes(query, 5);
      return recipes
        .filter(recipe => recipe.readyInMinutes <= 30)
        .map(recipe => ({
          ...recipe,
          id: typeof recipe.id === 'string' ? parseInt(recipe.id, 10) : recipe.id
        }));
    } catch (error) {
      console.error("Error getting quick recipes from Edamam:", error);
      throw error;
    }
  }

  async getRecipeById(id: number | string): Promise<Recipe> {
    try {
      // If it's a string ID and starts with "recipe_", it's an Edamam ID
      if (typeof id === 'string' && id.includes('recipe_')) {
        const recipe = await edamamService.getRecipeById(id);
        return {
          ...recipe,
          id: typeof recipe.id === 'string' ? parseInt(recipe.id, 10) : recipe.id
        };
      }
      
      // For numeric IDs, we need to handle differently since Edamam uses string IDs
      // This is placeholder logic that would need to be replaced with actual ID mapping
      throw new Error(`Recipe with ID ${id} not found in Edamam format`);
    } catch (error) {
      console.error(`Error getting recipe by id ${id} from Edamam:`, error);
      throw error;
    }
  }

  async getSimilarRecipes(id: number | string): Promise<Recipe[]> {
    try {
      // First get the recipe to use its name for finding similar recipes
      // This is complex because we need to handle both string and numeric IDs
      let recipeName = '';
      
      if (typeof id === 'string' && id.includes('recipe_')) {
        // If it's an Edamam ID, get the recipe directly
        const recipe = await edamamService.getRecipeById(id);
        recipeName = recipe.name;
      } else {
        // For numeric IDs, we would need a mapping system
        // For now, use a generic search term
        recipeName = 'similar recipes';
      }
      
      // Use the name to search for similar recipes
      const recipes = await edamamService.getSimilarRecipes(recipeName);
      return recipes
        .filter(r => {
          // Filter out the original recipe if we can identify it
          if (typeof r.id === 'string' && typeof id === 'string') {
            return r.id !== id;
          }
          return true;
        })
        .map(recipe => ({
          ...recipe,
          id: typeof recipe.id === 'string' ? parseInt(recipe.id, 10) : recipe.id
        }));
    } catch (error) {
      console.error(`Error getting similar recipes for ${id} from Edamam:`, error);
      throw error;
    }
  }

  async searchRecipeByName(query: string): Promise<Recipe> {
    try {
      // Search for recipes by query
      const recipes = await edamamService.searchRecipes(query, 1);
      
      if (recipes && recipes.length > 0) {
        const recipe = recipes[0];
        return {
          ...recipe,
          id: typeof recipe.id === 'string' ? parseInt(recipe.id, 10) : recipe.id
        };
      } else {
        throw new Error(`No results found for query ${query}`);
      }
    } catch (error) {
      console.error(`Error searching recipe by name ${query} from Edamam:`, error);
      throw error;
    }
  }

  async getRecipesByIngredients(ingredients: string[]): Promise<Recipe[]> {
    try {
      // Join ingredients with commas for search query
      const query = ingredients.join(' ');
      
      const recipes = await edamamService.searchRecipes(query, 5);
      return recipes.map(recipe => ({
        ...recipe,
        id: typeof recipe.id === 'string' ? parseInt(recipe.id, 10) : recipe.id
      }));
    } catch (error) {
      console.error(`Error getting recipes by ingredients from Edamam:`, error);
      throw error;
    }
  }
}