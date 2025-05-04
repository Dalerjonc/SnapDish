/**
 * Service for fetching recipe data
 * Using Spoonacular API for recipes and nutritional information
 */
import { Recipe, Ingredient, AnalyzedInstruction } from "@shared/schema";

interface RecipeApiService {
  getPopularRecipes(): Promise<Recipe[]>;
  getQuickRecipes(): Promise<Recipe[]>;
  getRecipeById(id: number): Promise<Recipe>;
  getSimilarRecipes(id: number): Promise<Recipe[]>;
  searchRecipeByName(query: string): Promise<Recipe>;
  getRecipesByIngredients(ingredients: string[]): Promise<Recipe[]>;
}

class MockRecipeApiService implements RecipeApiService {
  // Sample recipes data
  private readonly sampleRecipes: Recipe[] = [
    {
      id: 1,
      name: "Pasta with Tomato Sauce",
      image: "https://images.unsplash.com/photo-1548940740-204726a19be3",
      readyInMinutes: 30,
      servings: 4,
      sourceUrl: "https://example.com/pasta",
      summary: "A simple and delicious pasta with tomato sauce.",
      instructions: "Cook pasta. Make sauce. Combine. Serve.",
      calories: 420,
      protein: "12g",
      carbs: "65g",
      fat: "12g",
      diets: ["vegetarian"],
      extendedIngredients: [
        {
          id: 101,
          name: "spaghetti",
          amount: 400,
          unit: "g",
          original: "400g spaghetti or pasta of choice"
        },
        {
          id: 102,
          name: "crushed tomatoes",
          amount: 800,
          unit: "g",
          original: "2 cans (400g each) crushed tomatoes"
        },
        {
          id: 103,
          name: "garlic",
          amount: 3,
          unit: "cloves",
          original: "3 cloves garlic, minced"
        },
        {
          id: 104,
          name: "onion",
          amount: 1,
          unit: "small",
          original: "1 small onion, finely chopped"
        },
        {
          id: 105,
          name: "olive oil",
          amount: 2,
          unit: "tbsp",
          original: "2 tbsp olive oil"
        },
        {
          id: 106,
          name: "dried oregano",
          amount: 1,
          unit: "tsp",
          original: "1 tsp dried oregano"
        },
        {
          id: 107,
          name: "salt",
          amount: 1,
          unit: "to taste",
          original: "Salt and pepper to taste"
        },
        {
          id: 108,
          name: "fresh basil",
          amount: 1,
          unit: "handful",
          original: "Fresh basil leaves for garnish (optional)"
        }
      ],
      analyzedInstructions: [
        {
          name: "",
          steps: [
            {
              number: 1,
              step: "Heat olive oil in a large pan over medium heat. Add onions and sauté until translucent, about 3-4 minutes.",
              ingredients: [
                { id: 104, name: "onion", image: "onion.jpg" },
                { id: 105, name: "olive oil", image: "olive-oil.jpg" }
              ],
              equipment: [
                { id: 201, name: "pan", image: "pan.jpg" }
              ]
            },
            {
              number: 2,
              step: "Add minced garlic and cook for another minute until fragrant.",
              ingredients: [
                { id: 103, name: "garlic", image: "garlic.jpg" }
              ],
              equipment: []
            },
            {
              number: 3,
              step: "Pour in crushed tomatoes, add oregano, salt, and pepper. Stir well and bring to a simmer.",
              ingredients: [
                { id: 102, name: "crushed tomatoes", image: "crushed-tomatoes.jpg" },
                { id: 106, name: "dried oregano", image: "oregano.jpg" },
                { id: 107, name: "salt", image: "salt.jpg" }
              ],
              equipment: []
            },
            {
              number: 4,
              step: "Reduce heat to low and let the sauce simmer for 15-20 minutes, stirring occasionally.",
              ingredients: [],
              equipment: []
            },
            {
              number: 5,
              step: "Meanwhile, cook pasta according to package instructions until al dente. Drain well.",
              ingredients: [
                { id: 101, name: "spaghetti", image: "spaghetti.jpg" }
              ],
              equipment: []
            },
            {
              number: 6,
              step: "Combine pasta with sauce, toss well to coat. Serve hot with fresh basil if desired.",
              ingredients: [
                { id: 108, name: "fresh basil", image: "basil.jpg" }
              ],
              equipment: []
            }
          ]
        }
      ],
      created_at: new Date()
    },
    {
      id: 2,
      name: "Vegetable Stir Fry",
      image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141",
      readyInMinutes: 25,
      servings: 2,
      sourceUrl: "https://example.com/stirfry",
      summary: "A healthy and quick vegetable stir fry.",
      instructions: "Prepare vegetables. Stir fry with sauce. Serve over rice.",
      calories: 320,
      protein: "8g",
      carbs: "45g",
      fat: "10g",
      diets: ["vegetarian", "vegan"],
      extendedIngredients: [
        {
          id: 201,
          name: "broccoli",
          amount: 1,
          unit: "cup",
          original: "1 cup broccoli florets"
        },
        {
          id: 202,
          name: "carrots",
          amount: 2,
          unit: "",
          original: "2 carrots, julienned"
        }
      ],
      analyzedInstructions: [
        {
          name: "",
          steps: [
            {
              number: 1,
              step: "Heat oil in a wok over high heat.",
              ingredients: [],
              equipment: []
            }
          ]
        }
      ],
      created_at: new Date()
    },
    {
      id: 3,
      name: "Pasta Carbonara",
      image: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f",
      readyInMinutes: 30,
      servings: 4,
      sourceUrl: "https://example.com/carbonara",
      summary: "A creamy pasta dish with eggs and bacon.",
      instructions: "Cook pasta. Prepare sauce with eggs and cheese. Mix with bacon.",
      calories: 550,
      protein: "24g",
      carbs: "58g",
      fat: "22g",
      diets: [],
      extendedIngredients: [
        {
          id: 301,
          name: "spaghetti",
          amount: 350,
          unit: "g",
          original: "350g spaghetti"
        },
        {
          id: 302,
          name: "bacon",
          amount: 150,
          unit: "g",
          original: "150g bacon, diced"
        }
      ],
      analyzedInstructions: [],
      created_at: new Date()
    },
    {
      id: 4,
      name: "Grilled Salmon",
      image: "https://images.unsplash.com/photo-1564834724105-918b73d98218",
      readyInMinutes: 20,
      servings: 2,
      sourceUrl: "https://example.com/salmon",
      summary: "Perfectly grilled salmon fillet with lemon and herbs.",
      instructions: "Season salmon. Grill until cooked through. Serve with lemon.",
      calories: 380,
      protein: "42g",
      carbs: "2g",
      fat: "22g",
      diets: ["gluten-free", "dairy-free"],
      extendedIngredients: [],
      analyzedInstructions: [],
      created_at: new Date()
    },
    {
      id: 5,
      name: "Beef Tacos",
      image: "https://images.unsplash.com/photo-1528712306091-ed0763094c98",
      readyInMinutes: 35,
      servings: 4,
      sourceUrl: "https://example.com/tacos",
      summary: "Delicious beef tacos with all the toppings.",
      instructions: "Cook beef with spices. Prepare toppings. Assemble tacos.",
      calories: 420,
      protein: "28g",
      carbs: "30g",
      fat: "24g",
      diets: [],
      extendedIngredients: [],
      analyzedInstructions: [],
      created_at: new Date()
    },
    {
      id: 6,
      name: "Avocado Toast",
      image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445",
      readyInMinutes: 10,
      servings: 1,
      sourceUrl: "https://example.com/avocadotoast",
      summary: "Simple and nutritious avocado toast.",
      instructions: "Toast bread. Mash avocado. Spread on toast. Add toppings.",
      calories: 320,
      protein: "8g",
      carbs: "30g",
      fat: "18g",
      diets: ["vegetarian"],
      extendedIngredients: [],
      analyzedInstructions: [],
      created_at: new Date()
    },
    {
      id: 7,
      name: "Greek Yogurt Bowl",
      image: "https://images.unsplash.com/photo-1593584785033-9c7604d0863f",
      readyInMinutes: 5,
      servings: 1,
      sourceUrl: "https://example.com/yogurtbowl",
      summary: "Quick and healthy Greek yogurt bowl with fruits and nuts.",
      instructions: "Add yogurt to bowl. Top with fruits, nuts, and honey.",
      calories: 280,
      protein: "18g",
      carbs: "32g",
      fat: "10g",
      diets: ["vegetarian", "gluten-free"],
      extendedIngredients: [],
      analyzedInstructions: [],
      created_at: new Date()
    },
    {
      id: 8,
      name: "Mediterranean Salad",
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd",
      readyInMinutes: 15,
      servings: 2,
      sourceUrl: "https://example.com/salad",
      summary: "Fresh and flavorful Mediterranean salad with feta cheese.",
      instructions: "Combine vegetables, olives, and feta. Dress with olive oil and lemon.",
      calories: 415,
      protein: "12g",
      carbs: "22g",
      fat: "32g",
      diets: ["vegetarian", "gluten-free"],
      extendedIngredients: [],
      analyzedInstructions: [],
      created_at: new Date()
    },
    {
      id: 9,
      name: "Breakfast Toast",
      image: "https://images.unsplash.com/photo-1484723091739-30a097e8f929",
      readyInMinutes: 10,
      servings: 1,
      sourceUrl: "https://example.com/breakfasttoast",
      summary: "Delicious toast topped with eggs and vegetables.",
      instructions: "Toast bread. Cook eggs. Assemble and add toppings.",
      calories: 320,
      protein: "14g",
      carbs: "30g",
      fat: "18g",
      diets: ["vegetarian"],
      extendedIngredients: [],
      analyzedInstructions: [],
      created_at: new Date()
    },
    {
      id: 10,
      name: "Pasta with Meatballs",
      image: "https://images.unsplash.com/photo-1622973536968-3ead9e780960",
      readyInMinutes: 45,
      servings: 4,
      sourceUrl: "https://example.com/meatballs",
      summary: "Classic pasta with homemade meatballs in tomato sauce.",
      instructions: "Make meatballs. Cook pasta. Combine with sauce.",
      calories: 580,
      protein: "32g",
      carbs: "60g",
      fat: "25g",
      diets: [],
      extendedIngredients: [],
      analyzedInstructions: [],
      created_at: new Date()
    },
    {
      id: 11,
      name: "Creamy Garlic Pasta",
      image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8",
      readyInMinutes: 25,
      servings: 4,
      sourceUrl: "https://example.com/creampasta",
      summary: "Pasta in a rich and creamy garlic sauce.",
      instructions: "Cook pasta. Prepare creamy garlic sauce. Combine and serve.",
      calories: 520,
      protein: "14g",
      carbs: "62g",
      fat: "24g",
      diets: ["vegetarian"],
      extendedIngredients: [],
      analyzedInstructions: [],
      created_at: new Date()
    },
    {
      id: 12,
      name: "Plov (Rice Pilaf)",
      image: "https://images.unsplash.com/photo-1568716508386-cde42ce1d4b7",
      readyInMinutes: 60,
      servings: 6,
      sourceUrl: "https://example.com/plov",
      summary: "Central Asian rice pilaf with meat, carrots, and spices.",
      instructions: "Sauté meat and onions. Add carrots and spices. Add rice and water. Cook until rice is tender.",
      calories: 480,
      protein: "24g",
      carbs: "65g",
      fat: "16g",
      diets: ["dairy-free"],
      extendedIngredients: [
        {
          id: 701,
          name: "lamb",
          amount: 1,
          unit: "pound",
          original: "1 pound lamb or beef, cubed"
        },
        {
          id: 702,
          name: "rice",
          amount: 2,
          unit: "cups",
          original: "2 cups long-grain rice"
        },
        {
          id: 703,
          name: "carrots",
          amount: 3,
          unit: "",
          original: "3 large carrots, julienned"
        },
        {
          id: 704,
          name: "onions",
          amount: 2,
          unit: "",
          original: "2 large onions, sliced"
        },
        {
          id: 705,
          name: "garlic",
          amount: 1,
          unit: "head",
          original: "1 whole head of garlic"
        },
        {
          id: 706,
          name: "cumin",
          amount: 1,
          unit: "teaspoon",
          original: "1 teaspoon cumin"
        }
      ],
      analyzedInstructions: [
        {
          name: "",
          steps: [
            {
              number: 1,
              step: "Heat oil in a large pot or Dutch oven over medium-high heat.",
              ingredients: [],
              equipment: []
            },
            {
              number: 2,
              step: "Add meat and brown on all sides, about 5 minutes.",
              ingredients: [],
              equipment: []
            },
            {
              number: 3,
              step: "Add sliced onions and cook until translucent, about 3 minutes.",
              ingredients: [],
              equipment: []
            },
            {
              number: 4,
              step: "Add julienned carrots and cook for another 5 minutes, stirring occasionally.",
              ingredients: [],
              equipment: []
            },
            {
              number: 5,
              step: "Add cumin, salt, and pepper. Stir well.",
              ingredients: [],
              equipment: []
            },
            {
              number: 6,
              step: "Add rice and stir to coat with oil.",
              ingredients: [],
              equipment: []
            },
            {
              number: 7,
              step: "Pour in hot water, enough to cover the rice by about 1 inch.",
              ingredients: [],
              equipment: []
            },
            {
              number: 8,
              step: "Push the whole head of garlic into the center of the mixture.",
              ingredients: [],
              equipment: []
            },
            {
              number: 9,
              step: "Bring to a boil, then reduce heat to low. Cover and simmer for 30-40 minutes until rice is tender.",
              ingredients: [],
              equipment: []
            },
            {
              number: 10,
              step: "Remove from heat and let rest for 10 minutes before serving.",
              ingredients: [],
              equipment: []
            }
          ]
        }
      ],
      created_at: new Date()
    }
  ];

  // Helper function to find a recipe by ID
  private findRecipeById(id: number): Recipe | undefined {
    return this.sampleRecipes.find(recipe => recipe.id === id);
  }

  async getPopularRecipes(): Promise<Recipe[]> {
    // In a real implementation, we would call the Spoonacular API
    // For the mock, return a subset of sample recipes as "popular"
    return this.sampleRecipes.slice(0, 4);
  }

  async getQuickRecipes(): Promise<Recipe[]> {
    // Return recipes that take 15 minutes or less
    return this.sampleRecipes.filter(recipe => recipe.readyInMinutes <= 15);
  }

  async getRecipeById(id: number): Promise<Recipe> {
    const recipe = this.findRecipeById(id);
    if (!recipe) {
      throw new Error(`Recipe with ID ${id} not found`);
    }
    return recipe;
  }

  async getSimilarRecipes(id: number): Promise<Recipe[]> {
    // Find the source recipe
    const sourceRecipe = this.findRecipeById(id);
    if (!sourceRecipe) {
      throw new Error(`Recipe with ID ${id} not found`);
    }
    
    // Get recipes that might be similar (excluding the source recipe)
    return this.sampleRecipes
      .filter(recipe => recipe.id !== id)
      .filter(recipe => {
        // Consider similar if they share a diet type or take similar time to prepare
        const sharedDiets = sourceRecipe.diets.some(diet => recipe.diets.includes(diet));
        const similarTime = Math.abs(recipe.readyInMinutes - sourceRecipe.readyInMinutes) <= 10;
        
        return sharedDiets || similarTime;
      })
      .slice(0, 2); // Return top 2 similar recipes
  }

  async searchRecipeByName(query: string): Promise<Recipe> {
    // Search for recipes by name (case-insensitive, partial match)
    const lowerQuery = query.toLowerCase().trim();
    
    // First try: exact match or substring match
    let matchingRecipes = this.sampleRecipes.filter(recipe => 
      recipe.name.toLowerCase().includes(lowerQuery)
    );
    
    // Second try: Check if query contains recipe name (reverse match)
    // This helps with cases where AI returns "Dish Name with details"
    if (matchingRecipes.length === 0) {
      matchingRecipes = this.sampleRecipes.filter(recipe => 
        lowerQuery.includes(recipe.name.toLowerCase())
      );
    }
    
    // Third try: Split query and see if any word matches beginning of recipe names
    // This helps with dishes like "Plov" matching "Plov (Rice Pilaf)"
    if (matchingRecipes.length === 0) {
      const queryWords = lowerQuery.split(/\s+|\(|\)|\./);
      matchingRecipes = this.sampleRecipes.filter(recipe => {
        const recipeName = recipe.name.toLowerCase();
        return queryWords.some(word => 
          word.length > 2 && (
            recipeName.startsWith(word) || 
            recipeName.includes(` ${word}`)
          )
        );
      });
    }
    
    if (matchingRecipes.length === 0) {
      // If no match at all, throw an error to trigger proper error handling
      console.log(`No recipe found matching query: "${query}"`);
      throw new Error(`No recipe found matching query: "${query}"`);
    }
    
    console.log(`Found recipe matching "${query}":`, matchingRecipes[0].name);
    // Return the first matching recipe
    return matchingRecipes[0];
  }

  async getRecipesByIngredients(ingredients: string[]): Promise<Recipe[]> {
    // In a real implementation, we would call the Spoonacular API with the ingredients
    
    // For the mock, filter recipes that contain at least one of the ingredients
    const lowerIngredients = ingredients.map(i => i.toLowerCase());
    
    return this.sampleRecipes.filter(recipe => {
      if (!recipe.extendedIngredients || recipe.extendedIngredients.length === 0) {
        // If recipe has no ingredients listed, include it with low probability
        return Math.random() < 0.2;
      }
      
      // Count how many of the provided ingredients match this recipe
      const matchingIngredients = recipe.extendedIngredients.filter(ingredient => 
        lowerIngredients.some(i => ingredient.name.toLowerCase().includes(i))
      );
      
      // Include if at least one ingredient matches
      return matchingIngredients.length > 0;
    });
  }
}

class SpoonacularRecipeApiService implements RecipeApiService {
  private readonly apiKey: string;
  private readonly baseUrl: string = "https://api.spoonacular.com";
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  private async fetchFromApi(endpoint: string): Promise<any> {
    const url = `${this.baseUrl}${endpoint}&apiKey=${this.apiKey}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }

  async getPopularRecipes(): Promise<Recipe[]> {
    const data = await this.fetchFromApi(
      "/recipes/random?number=4&tags=popular"
    );
    
    return data.recipes.map(this.mapSpoonacularToRecipe);
  }

  async getQuickRecipes(): Promise<Recipe[]> {
    const data = await this.fetchFromApi(
      "/recipes/complexSearch?maxReadyTime=15&number=4&addRecipeInformation=true"
    );
    
    return data.results.map(this.mapSpoonacularToRecipe);
  }

  async getRecipeById(id: number): Promise<Recipe> {
    const data = await this.fetchFromApi(
      `/recipes/${id}/information?includeNutrition=true`
    );
    
    return this.mapSpoonacularToRecipe(data);
  }

  async getSimilarRecipes(id: number): Promise<Recipe[]> {
    const data = await this.fetchFromApi(
      `/recipes/${id}/similar?number=2`
    );
    
    // The similar endpoint returns limited info, so fetch full details for each
    const recipePromises = data.map((item: any) => this.getRecipeById(item.id));
    return Promise.all(recipePromises);
  }

  async searchRecipeByName(query: string): Promise<Recipe> {
    const data = await this.fetchFromApi(
      `/recipes/complexSearch?query=${encodeURIComponent(query)}&number=1&addRecipeInformation=true`
    );
    
    if (!data.results || data.results.length === 0) {
      throw new Error(`No recipes found for query: ${query}`);
    }
    
    return this.mapSpoonacularToRecipe(data.results[0]);
  }

  async getRecipesByIngredients(ingredients: string[]): Promise<Recipe[]> {
    const ingredientsString = ingredients.join(",+");
    const data = await this.fetchFromApi(
      `/recipes/findByIngredients?ingredients=${encodeURIComponent(ingredientsString)}&number=5`
    );
    
    // This endpoint returns limited info, so fetch full details for each
    const recipePromises = data.map((item: any) => this.getRecipeById(item.id));
    return Promise.all(recipePromises);
  }
  
  // Helper to map Spoonacular API response to our Recipe model
  private mapSpoonacularToRecipe(data: any): Recipe {
    return {
      id: data.id,
      name: data.title,
      image: data.image,
      readyInMinutes: data.readyInMinutes,
      servings: data.servings,
      sourceUrl: data.sourceUrl,
      summary: data.summary,
      instructions: data.instructions,
      calories: data.nutrition?.nutrients?.find((n: any) => n.name === "Calories")?.amount || null,
      protein: data.nutrition?.nutrients?.find((n: any) => n.name === "Protein")?.amount + "g" || null,
      carbs: data.nutrition?.nutrients?.find((n: any) => n.name === "Carbohydrates")?.amount + "g" || null,
      fat: data.nutrition?.nutrients?.find((n: any) => n.name === "Fat")?.amount + "g" || null,
      diets: data.diets || [],
      extendedIngredients: data.extendedIngredients?.map((ingredient: any) => ({
        id: ingredient.id,
        name: ingredient.name,
        amount: ingredient.amount,
        unit: ingredient.unit,
        original: ingredient.original
      })) || [],
      analyzedInstructions: data.analyzedInstructions || [],
      created_at: new Date()
    };
  }
}

// Determine which service to use based on whether API key is available
const apiKey = process.env.SPOONACULAR_API_KEY;

// Export the appropriate service
export const recipeApiService: RecipeApiService = apiKey 
  ? new SpoonacularRecipeApiService(apiKey) 
  : new MockRecipeApiService();
