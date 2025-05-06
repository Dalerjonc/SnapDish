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
  private recipeCache: Map<number | string, Recipe> = new Map(); // Cache to store recipes by ID

  constructor() {
    console.log("Edamam Recipe API Service initialized");
  }
  
  // Method to store a recipe in the cache
  public cacheRecipe(recipe: Recipe): void {
    if (recipe && recipe.id) {
      console.log(`Caching recipe: ${recipe.name} with ID: ${recipe.id} (${typeof recipe.id})`);
      
      // Cache by ID (handles both number and string types)
      this.recipeCache.set(recipe.id, recipe);
      
      // Also cache by string version of ID for consistent lookup
      if (typeof recipe.id === 'number') {
        this.recipeCache.set(recipe.id.toString(), recipe);
      } else if (typeof recipe.id === 'string' && !isNaN(parseInt(recipe.id))) {
        // Also cache by number version if ID is a numeric string
        this.recipeCache.set(parseInt(recipe.id), recipe);
      }
      
      console.log(`Recipe cache now has ${this.recipeCache.size} entries`);
    } else {
      console.warn("Attempted to cache recipe with undefined ID:", recipe);
    }
  }

  private generateUniqueId(): number {
    return this.recipeIdCounter++;
  }
  
  // Convert any string ID to a numeric ID consistently
  private hashStringToNumericId(str: string): number {
    // Simple string hash function
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Ensure the hash is positive and in our recipe ID range (10000+)
    const positiveHash = Math.abs(hash);
    return 10000 + (positiveHash % 89999); // Range: 10000-99999
  }

  async getPopularRecipes(): Promise<Recipe[]> {
    try {
      // For popular recipes, we'll search for common popular dishes
      const popularQueries = ["pasta", "chicken", "burger", "salad", "pizza"];
      const randomIndex = Math.floor(Math.random() * popularQueries.length);
      const query = popularQueries[randomIndex];
      
      const recipes = await edamamService.searchRecipes(query, 3);
      return recipes.map((recipe: any) => {
        // Use our hash function for non-numeric string IDs
        let recipeId = recipe.id;
        if (typeof recipeId === 'string') {
          if (!isNaN(parseInt(recipeId))) {
            recipeId = parseInt(recipeId, 10);
          } else {
            recipeId = this.hashStringToNumericId(recipeId);
          }
        } else if (!recipeId) {
          recipeId = this.generateUniqueId();
        }
        
        return {
          ...recipe,
          id: recipeId,
          instructions: recipe.instructions || [],
          created_at: recipe.created_at || new Date()
        };
      });
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
        .filter((recipe: any) => recipe.readyInMinutes <= 30 || recipe.readyInMinutes === undefined)
        .map((recipe: any) => {
          // Use our hash function for non-numeric string IDs
          let recipeId = recipe.id;
          if (typeof recipeId === 'string') {
            if (!isNaN(parseInt(recipeId))) {
              recipeId = parseInt(recipeId, 10);
            } else {
              recipeId = this.hashStringToNumericId(recipeId);
            }
          } else if (!recipeId) {
            recipeId = this.generateUniqueId();
          }
          
          return {
            ...recipe,
            id: recipeId,
            readyInMinutes: recipe.readyInMinutes || 30, // Default to 30 minutes if not specified
            instructions: recipe.instructions || [],
            created_at: recipe.created_at || new Date()
          };
        });
    } catch (error) {
      console.error("Error getting quick recipes from Edamam:", error);
      throw error;
    }
  }

  async getRecipeById(id: number | string): Promise<Recipe> {
    try {
      console.log(`Looking for recipe with ID ${id}, type: ${typeof id}`);
      
      // First check if the recipe is in our cache (try both number and string versions)
      if (this.recipeCache.has(id)) {
        console.log(`Found recipe with ID ${id} in cache`);
        return this.recipeCache.get(id) as Recipe;
      }
      
      // Also try the string version if a number was provided
      if (typeof id === 'number' && this.recipeCache.has(id.toString())) {
        console.log(`Found recipe with string ID "${id}" in cache`);
        return this.recipeCache.get(id.toString()) as Recipe;
      }
      
      // Also try the number version if a string was provided and it's numeric
      if (typeof id === 'string' && !isNaN(parseInt(id)) && this.recipeCache.has(parseInt(id))) {
        console.log(`Found recipe with numeric ID ${parseInt(id)} in cache`);
        return this.recipeCache.get(parseInt(id)) as Recipe;
      }
      
      console.log(`Recipe with ID ${id} not found in cache, trying Edamam API`);
      
      // If it's a string ID and starts with "recipe_", it's an Edamam API ID
      if (typeof id === 'string' && id.includes('recipe_')) {
        const recipe = await edamamService.getRecipeById(id);
        
        // Make sure we have a consistent numeric ID
        let recipeId = recipe.id;
        if (!recipeId) {
          recipeId = this.generateUniqueId();
          console.log(`Generated new ID ${recipeId} for recipe: ${recipe.name}`);
        } else if (typeof recipeId === 'string') {
          if (!isNaN(parseInt(recipeId))) {
            recipeId = parseInt(recipeId, 10);
            console.log(`Converted string ID "${recipe.id}" to number: ${recipeId}`);
          } else {
            recipeId = this.hashStringToNumericId(recipeId);
            console.log(`Hashed string ID "${recipe.id}" to numeric ID: ${recipeId}`);
          }
        }
        
        const processedRecipe = {
          ...recipe,
          id: recipeId,
          instructions: recipe.instructions || [],
          created_at: recipe.created_at || new Date()
        };
        
        // Cache the recipe for future use
        this.cacheRecipe(processedRecipe);
        return processedRecipe;
      }
      
      // For hash-based IDs, also try the original string ID that might have been hashed
      if (typeof id === 'number' && id >= 10000) {
        console.log(`Checking if ${id} is a hashed ID`);
        // Since we can't reverse the hash function, we'll need to search through cache
        // to find any potential matches
        const entries = Array.from(this.recipeCache.entries());
        for (const [cacheKey, cacheValue] of entries) {
          if (typeof cacheKey === 'string' && !isNaN(this.hashStringToNumericId(cacheKey)) && 
              this.hashStringToNumericId(cacheKey) === id) {
            console.log(`Found a match for hashed ID ${id}: ${cacheKey}`);
            return cacheValue as Recipe;
          }
        }
      }
      
      // For numeric IDs (from Vision + Edamam API), we need better fallback
      // Log available cache keys for debugging
      console.log("Available cache keys:", Array.from(this.recipeCache.keys()));
      
      // If we can't find the recipe, throw an error
      throw new Error(`Recipe with ID ${id} not found in cache or Edamam`);
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
        .filter((r: any) => {
          // Filter out the original recipe if we can identify it
          if (typeof r.id === 'string' && typeof id === 'string') {
            return r.id !== id;
          }
          return true;
        })
        .map((recipe: any) => {
          // Use our hash function for non-numeric string IDs
          let recipeId = recipe.id;
          if (typeof recipeId === 'string') {
            if (!isNaN(parseInt(recipeId))) {
              recipeId = parseInt(recipeId, 10);
            } else {
              recipeId = this.hashStringToNumericId(recipeId);
            }
          } else if (!recipeId) {
            recipeId = this.generateUniqueId();
          }
          
          return {
            ...recipe,
            id: recipeId,
            instructions: recipe.instructions || [],
            created_at: recipe.created_at || new Date()
          };
        });
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
        
        // Make sure we have a numeric ID (if not, generate or convert)
        let recipeId = recipe.id;
        if (!recipeId) {
          // Generate a unique ID if none exists
          recipeId = this.generateUniqueId();
          console.log(`Generated new ID ${recipeId} for recipe: ${recipe.name}`);
        } else if (typeof recipeId === 'string') {
          if (!isNaN(parseInt(recipeId))) {
            // Convert numeric string to number
            recipeId = parseInt(recipeId, 10);
            console.log(`Converted string ID "${recipe.id}" to number: ${recipeId}`);
          } else {
            // Hash non-numeric string to a numeric ID
            recipeId = this.hashStringToNumericId(recipeId);
            console.log(`Hashed string ID "${recipe.id}" to numeric ID: ${recipeId}`);
          }
        }
        
        // Create the processed recipe with consistent ID
        const processedRecipe = {
          ...recipe,
          id: recipeId,
          instructions: recipe.instructions || [],
          created_at: new Date()
        };
        
        // Cache the recipe for future use
        this.cacheRecipe(processedRecipe);
        
        return processedRecipe;
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
      
      // Process each recipe to ensure consistent IDs and cache them
      return recipes.map(recipe => {
        // Make sure we have a numeric ID (if not, generate or convert)
        let recipeId = recipe.id;
        if (!recipeId) {
          // Generate a unique ID if none exists
          recipeId = this.generateUniqueId();
          console.log(`Generated new ID ${recipeId} for recipe: ${recipe.name}`);
        } else if (typeof recipeId === 'string') {
          if (!isNaN(parseInt(recipeId))) {
            // Convert numeric string to number
            recipeId = parseInt(recipeId, 10);
          } else {
            // Hash non-numeric string to a numeric ID
            recipeId = this.hashStringToNumericId(recipeId);
            console.log(`Hashed string ID "${recipe.id}" to numeric ID: ${recipeId}`);
          }
        }
        
        // Create the processed recipe with consistent ID
        const processedRecipe = {
          ...recipe,
          id: recipeId,
          instructions: recipe.instructions || [],
          created_at: new Date()
        };
        
        // Cache the recipe for future use
        this.cacheRecipe(processedRecipe);
        
        return processedRecipe;
      });
    } catch (error) {
      console.error(`Error getting recipes by ingredients from Edamam:`, error);
      throw error;
    }
  }
}