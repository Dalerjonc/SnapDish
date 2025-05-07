/**
 * OpenAI Recipe API Service
 * Fully powered by OpenAI API for recipe and nutrition information
 */
import { Recipe } from "@shared/schema";
import OpenAI from "openai";

// Import the RecipeApiService interface
import { RecipeApiService } from './recipeApi';

export class OpenAIRecipeApiService implements RecipeApiService {
  private recipeIdCounter: number = 50000; // Starting ID for OpenAI-generated recipes
  private recipeCache: Map<number, Recipe> = new Map(); // Cache to store recipes by ID
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
    console.log("OpenAI Recipe API Service initialized");
  }

  public cacheRecipe(recipe: Recipe): void {
    if (!recipe || !recipe.id) {
      console.warn("Attempted to cache invalid recipe:", recipe);
      return;
    }

    // Store the recipe in our cache
    console.log(`Caching recipe: ${recipe.name} with ID: ${recipe.id} (${typeof recipe.id})`);
    this.recipeCache.set(Number(recipe.id), recipe);
  }

  private generateUniqueId(): number {
    return this.recipeIdCounter++;
  }

  private hashStringToNumericId(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    // Ensure the hash is positive and within our ID range
    return 50000 + (Math.abs(hash) % 49999);
  }

  async getPopularRecipes(): Promise<Recipe[]> {
    console.log("Getting popular recipes with OpenAI");
    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are a culinary expert. Generate 5 popular recipes with complete details in the exact JSON array format shown below:
            [
              {
                "name": "Recipe Name",
                "summary": "Brief description of the recipe",
                "readyInMinutes": 30,
                "servings": 4,
                "calories": 350,
                "protein": "25g",
                "carbs": "30g",
                "fat": "15g",
                "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
                "instructions": [
                  "Step 1 instruction",
                  "Step 2 instruction",
                  "Step 3 instruction"
                ],
                "extendedIngredients": [
                  {"name": "ingredient1", "amount": 2, "unit": "cups", "original": "2 cups ingredient1"},
                  {"name": "ingredient2", "amount": 1, "unit": "tbsp", "original": "1 tablespoon ingredient2"}
                ]
              }
            ]
            Make sure each recipe has at least 5 ingredients and 3 instructions. Use realistic cooking times and nutritional values.`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 2000
      });

      const data = JSON.parse(response.choices[0].message.content || "[]");
      
      if (!Array.isArray(data)) {
        console.error("OpenAI did not return an array of recipes");
        return [];
      }

      // Process and cache the recipes
      const recipes: Recipe[] = data.map((item: any) => {
        // Generate a stable ID for the recipe based on its name
        const recipeId = this.hashStringToNumericId(item.name);
        
        const recipe: Recipe = {
          id: recipeId,
          name: item.name,
          image: item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
          readyInMinutes: item.readyInMinutes || 30,
          servings: item.servings || 4,
          sourceUrl: "",
          summary: item.summary || `Recipe for ${item.name}`,
          instructions: Array.isArray(item.instructions) ? item.instructions : [],
          calories: item.calories || 0,
          protein: item.protein || "0g",
          carbs: item.carbs || "0g",
          fat: item.fat || "0g",
          diets: item.diets || [],
          extendedIngredients: Array.isArray(item.extendedIngredients) ? item.extendedIngredients : [],
          analyzedInstructions: [{
            name: "",
            steps: Array.isArray(item.instructions) 
              ? item.instructions.map((step: string, index: number) => ({
                  number: index + 1,
                  step: step,
                  ingredients: [],
                  equipment: []
                }))
              : []
          }],
          created_at: new Date()
        };
        
        // Cache the recipe
        this.cacheRecipe(recipe);
        
        return recipe;
      });

      return recipes;
    } catch (error) {
      console.error("Error getting popular recipes with OpenAI:", error);
      return [];
    }
  }

  async getQuickRecipes(): Promise<Recipe[]> {
    console.log("Getting quick recipes with OpenAI");
    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are a culinary expert specializing in quick meals. Generate 5 recipes that can be prepared in 30 minutes or less with complete details in the exact JSON array format shown below:
            [
              {
                "name": "Quick Recipe Name",
                "summary": "Brief description of this quick recipe",
                "readyInMinutes": 20,
                "servings": 4,
                "calories": 350,
                "protein": "25g",
                "carbs": "30g",
                "fat": "15g",
                "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
                "instructions": [
                  "Step 1 instruction",
                  "Step 2 instruction",
                  "Step 3 instruction"
                ],
                "extendedIngredients": [
                  {"name": "ingredient1", "amount": 2, "unit": "cups", "original": "2 cups ingredient1"},
                  {"name": "ingredient2", "amount": 1, "unit": "tbsp", "original": "1 tablespoon ingredient2"}
                ]
              }
            ]
            Ensure all recipes can truly be made in 30 minutes or less. Include at least 5 ingredients and 3 instructions per recipe.`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 2000
      });

      const data = JSON.parse(response.choices[0].message.content || "[]");
      
      if (!Array.isArray(data)) {
        console.error("OpenAI did not return an array of recipes");
        return [];
      }

      // Process and cache the recipes
      const recipes: Recipe[] = data.map((item: any) => {
        // Generate a stable ID for the recipe based on its name
        const recipeId = this.hashStringToNumericId(item.name);
        
        const recipe: Recipe = {
          id: recipeId,
          name: item.name,
          image: item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
          readyInMinutes: item.readyInMinutes || 20,
          servings: item.servings || 4,
          sourceUrl: "",
          summary: item.summary || `Quick recipe for ${item.name}`,
          instructions: Array.isArray(item.instructions) ? item.instructions : [],
          calories: item.calories || 0,
          protein: item.protein || "0g",
          carbs: item.carbs || "0g",
          fat: item.fat || "0g",
          diets: item.diets || [],
          extendedIngredients: Array.isArray(item.extendedIngredients) ? item.extendedIngredients : [],
          analyzedInstructions: [{
            name: "",
            steps: Array.isArray(item.instructions) 
              ? item.instructions.map((step: string, index: number) => ({
                  number: index + 1,
                  step: step,
                  ingredients: [],
                  equipment: []
                }))
              : []
          }],
          created_at: new Date()
        };
        
        // Cache the recipe
        this.cacheRecipe(recipe);
        
        return recipe;
      });

      return recipes;
    } catch (error) {
      console.error("Error getting quick recipes with OpenAI:", error);
      return [];
    }
  }

  async getRecipeById(id: number): Promise<Recipe> {
    console.log("Looking for recipe with ID", id, "type:", typeof id);
    
    // Check if the recipe is in our cache
    if (this.recipeCache.has(id)) {
      console.log("Found recipe with ID", id, "in cache");
      const recipe = this.recipeCache.get(id)!;
      return recipe;
    }
    
    // If not in cache, generate a new recipe
    console.log("Recipe not found in cache, generating with OpenAI");
    
    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are a culinary expert. Generate a detailed recipe with the ID ${id} in the exact JSON format shown below:
            {
              "name": "Recipe Name",
              "summary": "Brief description of the recipe",
              "readyInMinutes": 30,
              "servings": 4,
              "calories": 350,
              "protein": "25g",
              "carbs": "30g",
              "fat": "15g",
              "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
              "instructions": [
                "Step 1 instruction",
                "Step 2 instruction",
                "Step 3 instruction"
              ],
              "extendedIngredients": [
                {"name": "ingredient1", "amount": 2, "unit": "cups", "original": "2 cups ingredient1"},
                {"name": "ingredient2", "amount": 1, "unit": "tbsp", "original": "1 tablespoon ingredient2"}
              ]
            }
            The recipe should be creative and unique. Include at least 6 ingredients and 4 detailed instructions.`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1500
      });

      const data = JSON.parse(response.choices[0].message.content || "{}");
      
      if (!data || !data.name) {
        throw new Error("OpenAI did not return a valid recipe");
      }

      // Create the recipe object
      const recipe: Recipe = {
        id,
        name: data.name,
        image: data.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
        readyInMinutes: data.readyInMinutes || 30,
        servings: data.servings || 4,
        sourceUrl: "",
        summary: data.summary || `Recipe for ${data.name}`,
        instructions: Array.isArray(data.instructions) ? data.instructions : [],
        calories: data.calories || 0,
        protein: data.protein || "0g",
        carbs: data.carbs || "0g",
        fat: data.fat || "0g",
        diets: data.diets || [],
        extendedIngredients: Array.isArray(data.extendedIngredients) ? data.extendedIngredients : [],
        analyzedInstructions: [{
          name: "",
          steps: Array.isArray(data.instructions) 
            ? data.instructions.map((step: string, index: number) => ({
                number: index + 1,
                step: step,
                ingredients: [],
                equipment: []
              }))
            : []
        }],
        created_at: new Date()
      };
      
      // Cache the recipe
      this.cacheRecipe(recipe);
      
      return recipe;
    } catch (error) {
      console.error("Error getting recipe by ID with OpenAI:", error);
      throw new Error(`Recipe with ID ${id} not found`);
    }
  }

  async getSimilarRecipes(id: number): Promise<Recipe[]> {
    console.log(`Getting similar recipes for ID ${id} with OpenAI`);
    
    // Try to get the original recipe first
    let originalRecipe: Recipe | null = null;
    try {
      if (this.recipeCache.has(id)) {
        originalRecipe = this.recipeCache.get(id)!;
        console.log(`Found original recipe: ${originalRecipe.name}`);
      }
    } catch (error) {
      console.error("Error retrieving original recipe:", error);
    }

    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are a culinary expert. Generate 3 recipes that are similar to ${originalRecipe ? originalRecipe.name : 'the recipe with ID ' + id} in the exact JSON array format shown below:
            [
              {
                "name": "Similar Recipe Name",
                "summary": "Brief description of this similar recipe",
                "readyInMinutes": 30,
                "servings": 4,
                "calories": 350,
                "protein": "25g",
                "carbs": "30g",
                "fat": "15g",
                "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
                "instructions": [
                  "Step 1 instruction",
                  "Step 2 instruction",
                  "Step 3 instruction"
                ],
                "extendedIngredients": [
                  {"name": "ingredient1", "amount": 2, "unit": "cups", "original": "2 cups ingredient1"},
                  {"name": "ingredient2", "amount": 1, "unit": "tbsp", "original": "1 tablespoon ingredient2"}
                ]
              }
            ]
            ${originalRecipe ? `The original recipe is for ${originalRecipe.name}, which includes ingredients like ${originalRecipe.extendedIngredients.slice(0, 3).map(i => i.name).join(', ')}. Generate recipes that use similar ingredients or cooking techniques.` : 'Generate varied but related recipes.'}
            Include at least one recipe that is a lighter or healthier version, and one that is a regional variation.`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 2000
      });

      const data = JSON.parse(response.choices[0].message.content || "[]");
      
      if (!Array.isArray(data)) {
        console.error("OpenAI did not return an array of recipes");
        return [];
      }

      // Process and cache the recipes
      const recipes: Recipe[] = data.map((item: any) => {
        // Generate a stable ID for the recipe based on its name
        const recipeId = this.hashStringToNumericId(item.name);
        
        const recipe: Recipe = {
          id: recipeId,
          name: item.name,
          image: item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
          readyInMinutes: item.readyInMinutes || 30,
          servings: item.servings || 4,
          sourceUrl: "",
          summary: item.summary || `Similar recipe to ${originalRecipe?.name || 'original recipe'}`,
          instructions: Array.isArray(item.instructions) ? item.instructions : [],
          calories: item.calories || 0,
          protein: item.protein || "0g",
          carbs: item.carbs || "0g",
          fat: item.fat || "0g",
          diets: item.diets || [],
          extendedIngredients: Array.isArray(item.extendedIngredients) ? item.extendedIngredients : [],
          analyzedInstructions: [{
            name: "",
            steps: Array.isArray(item.instructions) 
              ? item.instructions.map((step: string, index: number) => ({
                  number: index + 1,
                  step: step,
                  ingredients: [],
                  equipment: []
                }))
              : []
          }],
          created_at: new Date()
        };
        
        // Cache the recipe
        this.cacheRecipe(recipe);
        
        return recipe;
      });

      return recipes;
    } catch (error) {
      console.error("Error getting similar recipes with OpenAI:", error);
      return [];
    }
  }

  async searchRecipeByName(query: string): Promise<Recipe> {
    console.log(`Searching for recipe with name: ${query} using OpenAI`);
    
    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are a culinary expert. Generate a detailed recipe for "${query}" in the exact JSON format shown below:
            {
              "name": "${query}",
              "summary": "Brief description of ${query}",
              "readyInMinutes": 30,
              "servings": 4,
              "calories": 350,
              "protein": "25g",
              "carbs": "30g",
              "fat": "15g",
              "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
              "instructions": [
                "Step 1 instruction",
                "Step 2 instruction",
                "Step 3 instruction"
              ],
              "extendedIngredients": [
                {"name": "ingredient1", "amount": 2, "unit": "cups", "original": "2 cups ingredient1"},
                {"name": "ingredient2", "amount": 1, "unit": "tbsp", "original": "1 tablespoon ingredient2"}
              ]
            }
            Research this dish and provide accurate, authentic ingredients and instructions. If it's a cultural dish, respect its traditional preparation. Include at least 6 ingredients and 4 detailed instructions.`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1500
      });

      const data = JSON.parse(response.choices[0].message.content || "{}");
      
      if (!data || !data.name) {
        throw new Error(`OpenAI did not return a valid recipe for ${query}`);
      }

      // Generate a stable ID for the recipe based on its name
      const recipeId = this.hashStringToNumericId(data.name);
      
      // Create the recipe object
      const recipe: Recipe = {
        id: recipeId,
        name: data.name,
        image: data.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
        readyInMinutes: data.readyInMinutes || 30,
        servings: data.servings || 4,
        sourceUrl: "",
        summary: data.summary || `Recipe for ${data.name}`,
        instructions: Array.isArray(data.instructions) ? data.instructions : [],
        calories: data.calories || 0,
        protein: data.protein || "0g",
        carbs: data.carbs || "0g",
        fat: data.fat || "0g",
        diets: data.diets || [],
        extendedIngredients: Array.isArray(data.extendedIngredients) ? data.extendedIngredients : [],
        analyzedInstructions: [{
          name: "",
          steps: Array.isArray(data.instructions) 
            ? data.instructions.map((step: string, index: number) => ({
                number: index + 1,
                step: step,
                ingredients: [],
                equipment: []
              }))
            : []
        }],
        created_at: new Date()
      };
      
      // Cache the recipe
      this.cacheRecipe(recipe);
      
      return recipe;
    } catch (error) {
      console.error(`Error searching for recipe ${query} with OpenAI:`, error);
      throw new Error(`No recipe found for ${query}`);
    }
  }

  async getRecipesByIngredients(ingredients: string[]): Promise<Recipe[]> {
    console.log(`Getting recipes with ingredients: ${ingredients.join(', ')} using OpenAI`);
    
    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are a culinary expert. Generate 3 recipes that use these ingredients: ${ingredients.join(', ')}. 
            Return the recipes in the exact JSON array format shown below:
            [
              {
                "name": "Recipe Name Using These Ingredients",
                "summary": "Brief description of this recipe",
                "readyInMinutes": 30,
                "servings": 4,
                "calories": 350,
                "protein": "25g",
                "carbs": "30g",
                "fat": "15g",
                "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
                "instructions": [
                  "Step 1 instruction",
                  "Step 2 instruction",
                  "Step 3 instruction"
                ],
                "extendedIngredients": [
                  {"name": "ingredient1", "amount": 2, "unit": "cups", "original": "2 cups ingredient1"},
                  {"name": "ingredient2", "amount": 1, "unit": "tbsp", "original": "1 tablespoon ingredient2"}
                ]
              }
            ]
            The recipes should prominently feature the specified ingredients. You may add additional common ingredients like salt, pepper, oil, etc. 
            Prioritize recipes where most or all of the specified ingredients are used. Include at least 4 detailed instructions per recipe.`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 2000
      });

      const data = JSON.parse(response.choices[0].message.content || "[]");
      
      if (!Array.isArray(data)) {
        console.error("OpenAI did not return an array of recipes");
        return [];
      }

      // Process and cache the recipes
      const recipes: Recipe[] = data.map((item: any) => {
        // Generate a stable ID for the recipe based on its name
        const recipeId = this.hashStringToNumericId(item.name);
        
        const recipe: Recipe = {
          id: recipeId,
          name: item.name,
          image: item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
          readyInMinutes: item.readyInMinutes || 30,
          servings: item.servings || 4,
          sourceUrl: "",
          summary: item.summary || `Recipe using ${ingredients.slice(0, 3).join(', ')}`,
          instructions: Array.isArray(item.instructions) ? item.instructions : [],
          calories: item.calories || 0,
          protein: item.protein || "0g",
          carbs: item.carbs || "0g",
          fat: item.fat || "0g",
          diets: item.diets || [],
          extendedIngredients: Array.isArray(item.extendedIngredients) ? item.extendedIngredients : [],
          analyzedInstructions: [{
            name: "",
            steps: Array.isArray(item.instructions) 
              ? item.instructions.map((step: string, index: number) => ({
                  number: index + 1,
                  step: step,
                  ingredients: [],
                  equipment: []
                }))
              : []
          }],
          created_at: new Date()
        };
        
        // Cache the recipe
        this.cacheRecipe(recipe);
        
        return recipe;
      });

      return recipes;
    } catch (error) {
      console.error(`Error getting recipes by ingredients with OpenAI:`, error);
      return [];
    }
  }
}