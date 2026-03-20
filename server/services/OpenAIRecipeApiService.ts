/**
 * OpenAI Recipe API Service
 * Fully powered by OpenAI API for recipe and nutrition information
 */
import { Recipe } from "@shared/schema";
import OpenAI from "openai";

// Import the RecipeApiService interface
interface RecipeApiService {
  getPopularRecipes(): Promise<Recipe[]>;
  getQuickRecipes(): Promise<Recipe[]>;
  getRecipeById(id: number | string): Promise<Recipe>;
  getSimilarRecipes(id: number): Promise<Recipe[]>;
  searchRecipeByName(query: string): Promise<Recipe>;
  getRecipesByIngredients(ingredients: string[]): Promise<Recipe[]>;
}

export class OpenAIRecipeApiService implements RecipeApiService {
  private recipeIdCounter: number = 50000; // Starting ID for OpenAI-generated recipes
  private recipeCache: Map<number | string, Recipe> = new Map(); // Cache to store recipes by ID
  private client: OpenAI;
  
  // Add caching for expensive API calls
  private popularRecipesCache: Recipe[] | null = null;
  private quickRecipesCache: Recipe[] | null = null;
  private similarRecipesCache: Map<number, Recipe[]> = new Map();
  private ingredientRecipesCache: Map<string, Recipe[]> = new Map();

  // Cache expiration time (30 minutes)
  private cacheExpirationMs: number = 30 * 60 * 1000;
  private lastPopularRecipesUpdate: number = 0;
  private lastQuickRecipesUpdate: number = 0;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
    console.log("OpenAI Recipe API Service initialized");
    
    // Initialize with some demo recipes to avoid slow initial load
    this.initializeDemoRecipes();
  }
  
  // Initialize with some pre-defined recipes for faster initial load
  private initializeDemoRecipes() {
    // Demo quick recipes
    const quickRecipes: Recipe[] = [
      {
        id: "openai_50001",
        name: "15-Minute Pasta Primavera",
        image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601",
        readyInMinutes: 15,
        servings: 2,
        sourceUrl: "",
        summary: "A quick and easy pasta dish loaded with fresh spring vegetables.",
        instructions: ["Boil 4 cups salted water in large pot over high heat.", "Add 200g pasta and cook for 8-10 minutes until al dente.", "Heat 2 tbsp olive oil in large skillet over medium heat.", "Add mixed vegetables and sauté for 5-6 minutes until tender.", "Drain pasta and add to skillet with vegetables.", "Toss for 1-2 minutes until well combined. Season with salt and pepper."],
        calories: 420,
        protein: "12g",
        carbs: "65g",
        fat: "14g",
        diets: ["vegetarian"],
        extendedIngredients: [
          { id: 1, name: "pasta", amount: 200, unit: "g", original: "200g pasta" },
          { id: 2, name: "mixed vegetables", amount: 2, unit: "cups", original: "2 cups mixed vegetables" },
          { id: 3, name: "olive oil", amount: 2, unit: "tbsp", original: "2 tablespoons olive oil" }
        ],
        analyzedInstructions: [{
          name: "",
          steps: [
            { number: 1, step: "Boil 4 cups salted water in large pot over high heat.", ingredients: [], equipment: [] },
            { number: 2, step: "Add 200g pasta and cook for 8-10 minutes until al dente.", ingredients: [], equipment: [] },
            { number: 3, step: "Heat 2 tbsp olive oil in large skillet over medium heat.", ingredients: [], equipment: [] },
            { number: 4, step: "Add mixed vegetables and sauté for 5-6 minutes until tender.", ingredients: [], equipment: [] },
            { number: 5, step: "Drain pasta and add to skillet with vegetables.", ingredients: [], equipment: [] },
            { number: 6, step: "Toss for 1-2 minutes until well combined. Season with salt and pepper.", ingredients: [], equipment: [] }
          ]
        }],
        created_at: new Date()
      },
      {
        id: "openai_50002",
        name: "Quick Avocado Toast",
        image: "https://images.unsplash.com/photo-1588137378633-dea1336ce1e2",
        readyInMinutes: 5,
        servings: 1,
        sourceUrl: "",
        summary: "A nutritious and quick breakfast option that's both delicious and healthy.",
        instructions: ["Toast 2 slices bread in toaster for 2-3 minutes until golden brown.", "Mash 1 ripe avocado with fork until smooth and creamy.", "Spread mashed avocado evenly on warm toast using knife.", "Sprinkle with pinch of salt and pepper to taste."],
        calories: 320,
        protein: "8g",
        carbs: "35g",
        fat: "18g",
        diets: ["vegetarian", "vegan"],
        extendedIngredients: [
          { id: 1, name: "bread", amount: 2, unit: "slices", original: "2 slices of bread" },
          { id: 2, name: "avocado", amount: 1, unit: "", original: "1 ripe avocado" },
          { id: 3, name: "salt", amount: 1, unit: "pinch", original: "Salt to taste" }
        ],
        analyzedInstructions: [{
          name: "",
          steps: [
            { number: 1, step: "Toast 2 slices bread in toaster for 2-3 minutes until golden brown.", ingredients: [], equipment: [] },
            { number: 2, step: "Mash 1 ripe avocado with fork until smooth and creamy.", ingredients: [], equipment: [] },
            { number: 3, step: "Spread mashed avocado evenly on warm toast using knife.", ingredients: [], equipment: [] },
            { number: 4, step: "Sprinkle with pinch of salt and pepper to taste.", ingredients: [], equipment: [] }
          ]
        }],
        created_at: new Date()
      }
    ];
    
    // Demo popular recipes
    const popularRecipes: Recipe[] = [
      {
        id: "openai_50003",
        name: "Classic Margherita Pizza",
        image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002",
        readyInMinutes: 45,
        servings: 4,
        sourceUrl: "",
        summary: "A timeless Italian classic featuring a thin crust topped with fresh tomatoes, mozzarella, and basil.",
        instructions: ["Preheat oven to 475°F and place pizza stone inside if available.", "Roll pizza dough on floured surface to 12-inch circle.", "Spread 1/2 cup tomato sauce evenly, leaving 1-inch border for crust.", "Distribute 200g fresh mozzarella pieces over sauce.", "Bake for 12-15 minutes until crust is golden and cheese bubbles.", "Remove from oven and top with fresh basil leaves. Slice and serve immediately."],
        calories: 580,
        protein: "22g",
        carbs: "72g",
        fat: "24g",
        diets: ["vegetarian"],
        extendedIngredients: [
          { id: 1, name: "pizza dough", amount: 1, unit: "", original: "1 pizza dough" },
          { id: 2, name: "tomato sauce", amount: 1/2, unit: "cup", original: "1/2 cup tomato sauce" },
          { id: 3, name: "mozzarella", amount: 200, unit: "g", original: "200g fresh mozzarella" },
          { id: 4, name: "basil", amount: 10, unit: "leaves", original: "10 fresh basil leaves" }
        ],
        analyzedInstructions: [{
          name: "",
          steps: [
            { number: 1, step: "Preheat oven to 475°F and place pizza stone inside if available.", ingredients: [], equipment: [] },
            { number: 2, step: "Roll pizza dough on floured surface to 12-inch circle.", ingredients: [], equipment: [] },
            { number: 3, step: "Spread 1/2 cup tomato sauce evenly, leaving 1-inch border for crust.", ingredients: [], equipment: [] },
            { number: 4, step: "Distribute 200g fresh mozzarella pieces over sauce.", ingredients: [], equipment: [] },
            { number: 5, step: "Bake for 12-15 minutes until crust is golden and cheese bubbles.", ingredients: [], equipment: [] },
            { number: 6, step: "Remove from oven and top with fresh basil leaves. Slice and serve immediately.", ingredients: [], equipment: [] }
          ]
        }],
        created_at: new Date()
      },
      {
        id: "openai_50004",
        name: "Chicken Tikka Masala",
        image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641",
        readyInMinutes: 60,
        servings: 4,
        sourceUrl: "",
        summary: "A flavorful Indian dish featuring tender chicken in a creamy tomato sauce with aromatic spices.",
        instructions: ["Cut 1 kg chicken into bite-sized pieces and place in bowl.", "Mix with 1 cup yogurt and 2 tbsp spice blend. Marinate for 30 minutes.", "Heat 2 tbsp oil in large skillet over medium-high heat until shimmering.", "Add marinated chicken and cook for 8-10 minutes until browned on all sides.", "In same pan, add diced tomatoes and cook for 5 minutes until softened.", "Stir in 1/2 cup cream and simmer for 10-15 minutes until sauce thickens. Serve hot."],
        calories: 620,
        protein: "45g",
        carbs: "28g",
        fat: "32g",
        diets: [],
        extendedIngredients: [
          { id: 1, name: "chicken", amount: 1, unit: "kg", original: "1 kg boneless chicken" },
          { id: 2, name: "yogurt", amount: 1, unit: "cup", original: "1 cup plain yogurt" },
          { id: 3, name: "tomatoes", amount: 4, unit: "", original: "4 medium tomatoes" },
          { id: 4, name: "cream", amount: 1/2, unit: "cup", original: "1/2 cup heavy cream" },
          { id: 5, name: "spices", amount: 3, unit: "tbsp", original: "3 tablespoons spice blend" }
        ],
        analyzedInstructions: [{
          name: "",
          steps: [
            { number: 1, step: "Cut 1 kg chicken into bite-sized pieces and place in bowl.", ingredients: [], equipment: [] },
            { number: 2, step: "Mix with 1 cup yogurt and 2 tbsp spice blend. Marinate for 30 minutes.", ingredients: [], equipment: [] },
            { number: 3, step: "Heat 2 tbsp oil in large skillet over medium-high heat until shimmering.", ingredients: [], equipment: [] },
            { number: 4, step: "Add marinated chicken and cook for 8-10 minutes until browned on all sides.", ingredients: [], equipment: [] },
            { number: 5, step: "In same pan, add diced tomatoes and cook for 5 minutes until softened.", ingredients: [], equipment: [] },
            { number: 6, step: "Stir in 1/2 cup cream and simmer for 10-15 minutes until sauce thickens. Serve hot.", ingredients: [], equipment: [] }
          ]
        }],
        created_at: new Date()
      }
    ];
    
    // Cache these demo recipes
    quickRecipes.forEach(recipe => this.cacheRecipe(recipe));
    popularRecipes.forEach(recipe => this.cacheRecipe(recipe));
    
    // Set the cache
    this.quickRecipesCache = quickRecipes;
    this.popularRecipesCache = popularRecipes;
    
    // Update the timestamp
    this.lastQuickRecipesUpdate = Date.now();
    this.lastPopularRecipesUpdate = Date.now();
  }

  public cacheRecipe(recipe: Recipe): void {
    if (!recipe || !recipe.id) {
      console.warn("Attempted to cache invalid recipe:", recipe);
      return;
    }

    // Store the recipe in our cache with original ID type
    console.log(`Caching recipe: ${recipe.name} with ID: ${recipe.id} (${typeof recipe.id})`);
    this.recipeCache.set(recipe.id, recipe);
  }

  private generateUniqueId(): number {
    return this.recipeIdCounter++;
  }

  private hashStringToNumericId(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    // Ensure the hash is positive and within our ID range
    return String(50000 + (Math.abs(hash) % 49999));
  }

  async getPopularRecipes(): Promise<Recipe[]> {
    console.log("Getting popular recipes with OpenAI");
    
    // Use cache if available and not expired
    const now = Date.now();
    if (this.popularRecipesCache && (now - this.lastPopularRecipesUpdate < this.cacheExpirationMs)) {
      console.log("Returning popular recipes from cache");
      return this.popularRecipesCache;
    }
    
    // If the cache is empty or expired, make a new request
    try {
      // Return from cache while we refresh in the background
      if (this.popularRecipesCache) {
        // Start a background refresh
        this.refreshPopularRecipesCache().catch(err => 
          console.error("Background refresh of popular recipes failed:", err)
        );
        
        // Return the cached data immediately
        return this.popularRecipesCache;
      }
      
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
                  "Heat 2 tbsp olive oil in large skillet over medium heat.",
                  "Add diced onions and cook for 3-4 minutes until translucent.",
                  "Season with salt and pepper. Serve immediately while hot."
                ],
                "extendedIngredients": [
                  {"name": "ingredient1", "amount": 2, "unit": "cups", "original": "2 cups ingredient1"},
                  {"name": "ingredient2", "amount": 1, "unit": "tbsp", "original": "1 tablespoon ingredient2"}
                ]
              }
            ]
            IMPORTANT: Write cooking instructions in clear, step-by-step format. Each step should describe one main action. Use short, simple sentences (max 20 words per step). Include important details like time, temperature, amounts, and visual/sensory cues. Example: "Heat 2 tbsp olive oil in a large skillet over medium heat until shimmering." NOT: "Heat the oil." Make sure each recipe has at least 5 ingredients and 5 short instructions.`
          }
        ],

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
          extendedIngredients: Array.isArray(item.extendedIngredients) ? 
            item.extendedIngredients.map((ingredient: any, index: number) => ({
              ...ingredient,
              id: ingredient.id || index + 1
            })) : [],
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

  // Background refresh for popular recipes
  private async refreshPopularRecipesCache(): Promise<void> {
    console.log("Background refresh of popular recipes started");
    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
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
                  "Heat 2 tbsp olive oil in large skillet over medium heat.",
                  "Add diced onions and cook for 3-4 minutes until translucent.",
                  "Season with salt and pepper. Serve immediately while hot."
                ],
                "extendedIngredients": [
                  {"id": 1, "name": "ingredient1", "amount": 2, "unit": "cups", "original": "2 cups ingredient1"},
                  {"id": 2, "name": "ingredient2", "amount": 1, "unit": "tbsp", "original": "1 tablespoon ingredient2"}
                ]
              }
            ]
            IMPORTANT: Write cooking instructions in clear, step-by-step format. Each step should describe one main action. Use short, simple sentences (max 20 words per step). Include important details like time, temperature, amounts, and visual/sensory cues. Example: "Heat 2 tbsp olive oil in a large skillet over medium heat until shimmering." NOT: "Heat the oil." Make sure each recipe has at least 5 ingredients and 5 short instructions.`
          }
        ],

        max_tokens: 2000
      });

      const data = JSON.parse(response.choices[0].message.content || "[]");
      
      if (!Array.isArray(data)) {
        throw new Error("OpenAI did not return an array of recipes");
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
          extendedIngredients: Array.isArray(item.extendedIngredients) ? 
            item.extendedIngredients.map((ingredient: any, index: number) => ({
              ...ingredient,
              id: ingredient.id || index + 1
            })) : [],
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

      // Update the cache and timestamp
      this.popularRecipesCache = recipes;
      this.lastPopularRecipesUpdate = Date.now();
      console.log("Background refresh of popular recipes completed successfully");
    } catch (error) {
      console.error("Background refresh of popular recipes failed:", error);
    }
  }

  // Background refresh for quick recipes
  private async refreshQuickRecipesCache(): Promise<void> {
    console.log("Background refresh of quick recipes started");
    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
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
                  "Heat 2 tbsp olive oil in large skillet over medium heat.",
                  "Add diced onions and cook for 3-4 minutes until translucent.",
                  "Season with salt and pepper. Serve immediately while hot."
                ],
                "extendedIngredients": [
                  {"id": 1, "name": "ingredient1", "amount": 2, "unit": "cups", "original": "2 cups ingredient1"},
                  {"id": 2, "name": "ingredient2", "amount": 1, "unit": "tbsp", "original": "1 tablespoon ingredient2"}
                ]
              }
            ]
            IMPORTANT: Write cooking instructions in clear, step-by-step format. Each step should describe one main action. Use short, simple sentences (max 20 words per step). Include important details like time, temperature, amounts, and visual/sensory cues. Example: "Heat 2 tbsp olive oil in a large skillet over medium heat until shimmering." NOT: "Heat the oil." Ensure all recipes can truly be made in 30 minutes or less. Include at least 5 ingredients and 5 short instructions per recipe.`
          }
        ],

        max_tokens: 2000
      });

      const data = JSON.parse(response.choices[0].message.content || "[]");
      
      if (!Array.isArray(data)) {
        throw new Error("OpenAI did not return an array of recipes");
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
          extendedIngredients: Array.isArray(item.extendedIngredients) ? 
            item.extendedIngredients.map((ingredient: any, index: number) => ({
              ...ingredient,
              id: ingredient.id || index + 1
            })) : [],
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

      // Update the cache and timestamp
      this.quickRecipesCache = recipes;
      this.lastQuickRecipesUpdate = Date.now();
      console.log("Background refresh of quick recipes completed successfully");
    } catch (error) {
      console.error("Background refresh of quick recipes failed:", error);
    }
  }

  async getQuickRecipes(): Promise<Recipe[]> {
    console.log("Getting quick recipes with OpenAI");
    
    // Use cache if available and not expired
    const now = Date.now();
    if (this.quickRecipesCache && (now - this.lastQuickRecipesUpdate < this.cacheExpirationMs)) {
      console.log("Returning quick recipes from cache");
      return this.quickRecipesCache;
    }
    
    // If the cache is empty or expired, make a new request
    try {
      // Return from cache while we refresh in the background
      if (this.quickRecipesCache) {
        // Start a background refresh
        this.refreshQuickRecipesCache().catch(err => 
          console.error("Background refresh of quick recipes failed:", err)
        );
        
        // Return the cached data immediately
        return this.quickRecipesCache;
      }
      
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
                  "Heat 2 tbsp olive oil in large skillet over medium heat.",
                  "Add diced onions and cook for 3-4 minutes until translucent.",
                  "Season with salt and pepper. Serve immediately while hot."
                ],
                "extendedIngredients": [
                  {"name": "ingredient1", "amount": 2, "unit": "cups", "original": "2 cups ingredient1"},
                  {"name": "ingredient2", "amount": 1, "unit": "tbsp", "original": "1 tablespoon ingredient2"}
                ]
              }
            ]
            IMPORTANT: Write cooking instructions in clear, step-by-step format. Each step should describe one main action. Use short, simple sentences (max 20 words per step). Include important details like time, temperature, amounts, and visual/sensory cues. Example: "Heat 2 tbsp olive oil in a large skillet over medium heat until shimmering." NOT: "Heat the oil." Ensure all recipes can truly be made in 30 minutes or less. Include at least 5 ingredients and 5 short instructions per recipe.`
          }
        ],

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

  async getRecipeById(id: number | string): Promise<Recipe> {
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
                "Heat oil in pan over medium heat.",
                "Add ingredients and cook for 5 minutes.",
                "Season with salt and pepper. Serve hot."
              ],
              "extendedIngredients": [
                {"name": "ingredient1", "amount": 2, "unit": "cups", "original": "2 cups ingredient1"},
                {"name": "ingredient2", "amount": 1, "unit": "tbsp", "original": "1 tablespoon ingredient2"}
              ]
            }
            IMPORTANT: Write cooking instructions in clear, step-by-step format. Each step should describe one main action. Use short, simple sentences (max 20 words per step). Include important details like time, temperature, amounts, and visual/sensory cues. Example: "Heat 2 tbsp olive oil in a large skillet over medium heat until shimmering." NOT: "Heat the oil." The recipe should be creative and unique. Include at least 6 ingredients and 6 short instructions.`
          }
        ],

        max_tokens: 1500
      });

      const data = JSON.parse(response.choices[0].message.content || "{}");
      
      if (!data || !data.name) {
        throw new Error("OpenAI did not return a valid recipe");
      }

      // Create the recipe object
      const recipe: Recipe = {
        id: String(id),
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
                  "Heat 2 tbsp olive oil in large skillet over medium heat.",
                  "Add diced onions and cook for 3-4 minutes until translucent.",
                  "Season with salt and pepper. Serve immediately while hot."
                ],
                "extendedIngredients": [
                  {"name": "ingredient1", "amount": 2, "unit": "cups", "original": "2 cups ingredient1"},
                  {"name": "ingredient2", "amount": 1, "unit": "tbsp", "original": "1 tablespoon ingredient2"}
                ]
              }
            ]
            ${originalRecipe ? `The original recipe is for ${originalRecipe.name}, which includes ingredients like ${originalRecipe.extendedIngredients && originalRecipe.extendedIngredients.length > 0 ? originalRecipe.extendedIngredients.slice(0, 3).map(i => i.name).join(', ') : 'various ingredients'}. Generate recipes that use similar ingredients or cooking techniques.` : 'Generate varied but related recipes.'}
            IMPORTANT: Write cooking instructions in clear, step-by-step format. Each step should describe one main action. Use short, simple sentences (max 20 words per step). Include important details like time, temperature, amounts, and visual/sensory cues. Example: "Heat 2 tbsp olive oil in a large skillet over medium heat until shimmering." NOT: "Heat the oil." Include at least one recipe that is a lighter or healthier version, and one that is a regional variation.`
          }
        ],

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
                "Heat oil in pan over medium heat.",
                "Add ingredients and cook for 5 minutes.",
                "Season with salt and pepper. Serve hot."
              ],
              "extendedIngredients": [
                {"name": "ingredient1", "amount": 2, "unit": "cups", "original": "2 cups ingredient1"},
                {"name": "ingredient2", "amount": 1, "unit": "tbsp", "original": "1 tablespoon ingredient2"}
              ]
            }
            IMPORTANT: Write cooking instructions in clear, step-by-step format. Each step should describe one main action. Use short, simple sentences (max 20 words per step). Include important details like time, temperature, amounts, and visual/sensory cues. Example: "Heat 2 tbsp olive oil in a large skillet over medium heat until shimmering." NOT: "Heat the oil." Research this dish and provide accurate, authentic ingredients and instructions. If it's a cultural dish, respect its traditional preparation. Include at least 6 ingredients and 6 short instructions.`
          }
        ],

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

  // Generate intelligent fallback recipes based on ingredients
  private generateFallbackRecipes(ingredients: string[]): any[] {
    // Create recipe based on ingredient combinations
    const primaryIngredient = ingredients[0];
    const secondaryIngredients = ingredients.slice(1);
    
    // Determine recipe type based on ingredients
    let recipeName: string;
    let cookingMethod: string[];
    let cookingTime: number;
    
    if (ingredients.some(ing => ing.toLowerCase().includes('bread'))) {
      recipeName = `Gourmet ${ingredients.filter(ing => !ing.toLowerCase().includes('bread')).join(' & ')} Toast`;
      cookingMethod = [
        "Toast the bread slices until golden brown and crispy",
        `Prepare ${secondaryIngredients.join(', ')} by washing and chopping as needed`,
        "Layer the prepared ingredients on the toasted bread",
        "Season with salt and pepper to taste, then serve immediately"
      ];
      cookingTime = 10;
    } else if (ingredients.some(ing => ing.toLowerCase().includes('egg'))) {
      recipeName = `${ingredients.filter(ing => !ing.toLowerCase().includes('egg')).join(' & ')} Scramble`;
      cookingMethod = [
        "Crack eggs into a bowl and whisk until well combined",
        `Prepare ${secondaryIngredients.join(', ')} by dicing or chopping into small pieces`,
        "Heat a non-stick pan over medium heat with a little oil or butter",
        "Add prepared ingredients to the pan and cook for 2-3 minutes",
        "Pour in the beaten eggs and gently scramble until cooked through",
        "Season with salt and pepper, then serve hot"
      ];
      cookingTime = 15;
    } else if (ingredients.some(ing => ['tomato', 'onion', 'garlic'].includes(ing.toLowerCase()))) {
      recipeName = `Rustic ${ingredients.join(' & ')} Sauté`;
      cookingMethod = [
        "Heat olive oil in a large skillet over medium-high heat",
        `Dice ${ingredients.join(', ')} into uniform pieces`,
        "Add firmer ingredients first and cook for 3-4 minutes",
        "Add softer ingredients and season with salt, pepper, and herbs",
        "Cook until vegetables are tender and caramelized",
        "Serve as a side dish or over rice/pasta"
      ];
      cookingTime = 20;
    } else {
      recipeName = `Creative ${ingredients.join(' & ')} Medley`;
      cookingMethod = [
        `Clean and prepare all ingredients: ${ingredients.join(', ')}`,
        "Heat oil in a large pan over medium heat",
        "Add ingredients in order of cooking time needed",
        "Season with salt, pepper, and your favorite spices",
        "Cook until everything is tender and well combined",
        "Adjust seasoning and serve hot"
      ];
      cookingTime = 25;
    }
    
    return [{
      name: recipeName,
      summary: `A delicious and creative way to use ${ingredients.join(', ')} with simple cooking techniques that bring out the best flavors.`,
      readyInMinutes: cookingTime,
      servings: ingredients.length >= 3 ? 3 : 2,
      calories: 280 + (ingredients.length * 30),
      protein: ingredients.some(ing => ing.toLowerCase().includes('egg')) ? "18g" : "8g",
      carbs: ingredients.some(ing => ing.toLowerCase().includes('bread')) ? "35g" : "20g",
      fat: "12g",
      instructions: cookingMethod,
      extendedIngredients: ingredients.map((ingredient, index) => ({
        id: index + 1,
        name: ingredient,
        amount: 1,
        unit: ingredient.toLowerCase().includes('bread') ? "slice" : 
              ingredient.toLowerCase().includes('egg') ? "piece" : "cup",
        original: `1 ${ingredient.toLowerCase().includes('bread') ? "slice" : 
                      ingredient.toLowerCase().includes('egg') ? "piece" : "cup"} ${ingredient}`
      }))
    }];
  }

  async getRecipesByIngredients(ingredients: string[]): Promise<Recipe[]> {
    console.log(`Getting recipes with ingredients: ${ingredients.join(', ')} using OpenAI`);
    
    // Create unique ID based on the specific ingredients to avoid conflicts
    const ingredientsKey = ingredients.sort().join('-').toLowerCase().replace(/[^a-z0-9-]/g, '');
    const byIngredientsId = `ingredients-${ingredientsKey}`;
    
    try {
      // Create a modified prompt that's more specific about what we want
      const response = await this.client.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are a culinary expert. Create 3 creative and delicious recipes using these available ingredients: ${ingredients.join(', ')}. 
            Return the response in this exact JSON format:
            {
              "recipes": [
                {
                  "name": "Creative Recipe Name That Uses The Ingredients",
                  "summary": "Appetizing description of this dish and why it's delicious",
                  "readyInMinutes": 25,
                  "servings": 2,
                  "calories": 400,
                  "protein": "22g",
                  "carbs": "35g",
                  "fat": "16g",
                  "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
                  "instructions": [
                    "Heat 2 tbsp olive oil in large skillet over medium heat until shimmering.",
                    "Add diced onions and cook for 3-4 minutes until translucent.",
                    "Season with 1/2 tsp salt and pepper to taste.",
                    "Serve immediately while hot with fresh garnish."
                  ],
                  "extendedIngredients": [
                    {"id": 1, "name": "first_ingredient", "amount": 2, "unit": "pieces", "original": "2 pieces first_ingredient"},
                    {"id": 2, "name": "second_ingredient", "amount": 1, "unit": "cup", "original": "1 cup second_ingredient"}
                  ]
                }
              ]
            }
            
            IMPORTANT GUIDELINES:
            - Each recipe must creatively use MOST or ALL of the provided ingredients: ${ingredients.join(', ')}
            - Add only common pantry items (salt, pepper, oil, butter) if needed
            - CRITICAL: Write cooking instructions in clear, step-by-step format. Each step should describe one main action. Use short, simple sentences (max 20 words per step). Include important details like time, temperature, amounts, and visual/sensory cues.
            - GOOD: "Heat 2 tbsp olive oil in large skillet over medium heat until shimmering." / "Add beaten eggs and cook for 3-4 minutes until set." / "Season with 1/2 tsp salt and pepper to taste."
            - BAD: "Heat oil." / "Add eggs." / "Season."
            - Provide 5-6 detailed cooking steps with clear actions
            - Make recipe names appetizing and descriptive
            - Include realistic cooking times and nutritional estimates
            - Ensure each recipe is actually cookable and delicious`
          }
        ],

        max_tokens: 2000
      });

      let data;
      try {
        const rawData = JSON.parse(response.choices[0].message.content || '{"recipes": []}');
        data = rawData.recipes || [];
        
        if (!Array.isArray(data)) {
          console.error("OpenAI did not return an array of recipes, got:", typeof data);
          // Create better fallback recipes with proper cooking steps based on ingredients
          data = this.generateFallbackRecipes(ingredients);
        }
      } catch (parseError) {
        console.error("Error parsing OpenAI response:", parseError);
        // Return a fallback recipe if parsing fails
        data = this.generateFallbackRecipes(ingredients);
      }

      // Process and cache the recipes with unique IDs for ingredients-based recipes
      const recipes: Recipe[] = data.map((item: any, index: number) => {
        // Create unique ID for each recipe using ingredients and recipe name
        const uniqueId = `${byIngredientsId}-${this.hashStringToNumericId(item.name || `recipe-${index}`)}`;
        const recipe: Recipe = {
          id: uniqueId, // Use unique ID for each recipe
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
          extendedIngredients: Array.isArray(item.extendedIngredients) ? 
            item.extendedIngredients.map((ingredient: any, idx: number) => ({
              ...ingredient,
              id: ingredient.id || idx + 1
            })) : [],
          analyzedInstructions: [{
            name: "",
            steps: Array.isArray(item.instructions) 
              ? item.instructions.map((step: string, idx: number) => ({
                  number: idx + 1,
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
      
      // Return a fallback recipe if OpenAI call fails completely
      const fallbackId = `${byIngredientsId}-fallback`;
      const fallbackRecipe: Recipe = {
        id: fallbackId,
        name: `${ingredients[0].charAt(0).toUpperCase() + ingredients[0].slice(1)} Special`,
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
        readyInMinutes: 25,
        servings: 4,
        sourceUrl: "",
        summary: `A delicious recipe featuring ${ingredients.join(', ')}.`,
        instructions: [
          `Prepare ${ingredients.join(' and ')}.`,
          "Mix all ingredients together.",
          "Cook until done.",
          "Serve hot and enjoy!"
        ],
        calories: 300,
        protein: "18g",
        carbs: "25g",
        fat: "12g",
        diets: [],
        extendedIngredients: ingredients.map((ingredient, index) => ({
          id: index + 1,
          name: ingredient,
          amount: 1,
          unit: "cup",
          original: `1 cup ${ingredient}`
        })),
        analyzedInstructions: [{
          name: "",
          steps: [
            { number: 1, step: `Prepare ${ingredients.join(' and ')}.`, ingredients: [], equipment: [] },
            { number: 2, step: "Mix all ingredients together.", ingredients: [], equipment: [] },
            { number: 3, step: "Cook until done.", ingredients: [], equipment: [] },
            { number: 4, step: "Serve hot and enjoy!", ingredients: [], equipment: [] }
          ]
        }],
        created_at: new Date()
      };
      
      // Cache the fallback recipe
      this.cacheRecipe(fallbackRecipe);
      
      return [fallbackRecipe];
    }
  }
}