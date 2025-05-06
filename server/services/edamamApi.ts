/**
 * Edamam API Service
 * Provides recipe search and nutrition analysis capabilities
 */

// Recipe API credentials
const RECIPE_APP_ID = process.env.EDAMAM_RECIPE_APP_ID;
const RECIPE_APP_KEY = process.env.EDAMAM_RECIPE_APP_KEY;

// Nutrition API credentials
const NUTRITION_APP_ID = process.env.EDAMAM_NUTRITION_APP_ID;
const NUTRITION_APP_KEY = process.env.EDAMAM_NUTRITION_APP_KEY;

// API base URLs
const RECIPE_BASE_URL = 'https://api.edamam.com/api/recipes/v2';
const NUTRITION_BASE_URL = 'https://api.edamam.com/api/nutrition-details';

// Helper function for making API requests
async function fetchWithErrorHandling(url: string, options: RequestInit = {}) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Edamam API fetch error:', error);
    throw error;
  }
}

// Function to search for recipes by query term (dish name)
export async function searchRecipes(query: string, limit: number = 5) {
  // Validate credentials
  if (!RECIPE_APP_ID || !RECIPE_APP_KEY) {
    throw new Error('Edamam Recipe API credentials not configured');
  }

  const params = new URLSearchParams({
    type: 'public',
    q: query,
    app_id: RECIPE_APP_ID,
    app_key: RECIPE_APP_KEY,
    imageSize: 'REGULAR',
  });

  const url = `${RECIPE_BASE_URL}?${params.toString()}`;
  const data = await fetchWithErrorHandling(url);
  
  // Extract the relevant recipe information from the API response
  const recipes = data.hits.slice(0, limit).map((hit: any) => {
    const recipe = hit.recipe;
    
    return {
      id: recipe.uri.split('#recipe_')[1], // Extract unique identifier from URI
      name: recipe.label,
      image: recipe.image,
      sourceUrl: recipe.url,
      sourceName: recipe.source,
      servings: recipe.yield,
      readyInMinutes: Math.round((recipe.totalTime || 30) * (recipe.totalTime > 0 ? 1 : 1)), // Default to 30 if not provided
      calories: Math.round(recipe.calories / recipe.yield), // per serving
      protein: recipe.totalNutrients.PROCNT ? `${Math.round(recipe.totalNutrients.PROCNT.quantity / recipe.yield)}${recipe.totalNutrients.PROCNT.unit}` : "0g",
      carbs: recipe.totalNutrients.CHOCDF ? `${Math.round(recipe.totalNutrients.CHOCDF.quantity / recipe.yield)}${recipe.totalNutrients.CHOCDF.unit}` : "0g",
      fat: recipe.totalNutrients.FAT ? `${Math.round(recipe.totalNutrients.FAT.quantity / recipe.yield)}${recipe.totalNutrients.FAT.unit}` : "0g",
      summary: `A delicious recipe for ${recipe.label} from ${recipe.source}.`,
      diets: recipe.healthLabels || [],
      extendedIngredients: recipe.ingredients.map((ingredient: any, index: number) => ({
        id: index + 1000,
        name: ingredient.food,
        amount: ingredient.quantity,
        unit: ingredient.measure,
        original: ingredient.text
      })),
      analyzedInstructions: recipe.ingredientLines ? [{
        name: "",
        steps: [
          {
            number: 1,
            step: "Gather all ingredients:",
            ingredients: recipe.ingredientLines.map((line: string, idx: number) => ({
              id: idx,
              name: line,
              image: ""
            })),
            equipment: []
          },
          {
            number: 2,
            step: `Cook according to the original recipe instructions. Visit the source: ${recipe.url}`,
            ingredients: [],
            equipment: []
          }
        ]
      }] : []
    };
  });

  return recipes;
}

// Function to get detailed recipe by ID
export async function getRecipeById(recipeId: string) {
  // Validate credentials
  if (!RECIPE_APP_ID || !RECIPE_APP_KEY) {
    throw new Error('Edamam Recipe API credentials not configured');
  }

  const params = new URLSearchParams({
    type: 'public',
    app_id: RECIPE_APP_ID,
    app_key: RECIPE_APP_KEY,
  });

  const url = `${RECIPE_BASE_URL}/${recipeId}?${params.toString()}`;
  const data = await fetchWithErrorHandling(url);
  
  // Format the recipe data
  const recipe = data.recipe;
  
  return {
    id: recipeId,
    name: recipe.label,
    image: recipe.image,
    sourceUrl: recipe.url,
    sourceName: recipe.source,
    servings: recipe.yield,
    readyInMinutes: Math.round((recipe.totalTime || 30) * (recipe.totalTime > 0 ? 1 : 1)), // Default to 30 if not provided
    calories: Math.round(recipe.calories / recipe.yield), // per serving
    protein: recipe.totalNutrients.PROCNT ? `${Math.round(recipe.totalNutrients.PROCNT.quantity / recipe.yield)}${recipe.totalNutrients.PROCNT.unit}` : "0g",
    carbs: recipe.totalNutrients.CHOCDF ? `${Math.round(recipe.totalNutrients.CHOCDF.quantity / recipe.yield)}${recipe.totalNutrients.CHOCDF.unit}` : "0g",
    fat: recipe.totalNutrients.FAT ? `${Math.round(recipe.totalNutrients.FAT.quantity / recipe.yield)}${recipe.totalNutrients.FAT.unit}` : "0g",
    summary: `A delicious recipe for ${recipe.label} from ${recipe.source}.`,
    diets: recipe.healthLabels || [],
    extendedIngredients: recipe.ingredients.map((ingredient: any, index: number) => ({
      id: index + 1000,
      name: ingredient.food,
      amount: ingredient.quantity,
      unit: ingredient.measure,
      original: ingredient.text
    })),
    analyzedInstructions: recipe.ingredientLines ? [{
      name: "",
      steps: [
        {
          number: 1,
          step: "Gather all ingredients:",
          ingredients: recipe.ingredientLines.map((line: string, idx: number) => ({
            id: idx,
            name: line,
            image: ""
          })),
          equipment: []
        },
        {
          number: 2,
          step: `Cook according to the original recipe instructions. Visit the source: ${recipe.url}`,
          ingredients: [],
          equipment: []
        }
      ]
    }] : []
  };
}

// Function to get similar recipes
export async function getSimilarRecipes(query: string, limit: number = 3) {
  return searchRecipes(query, limit);
}

// Function to get nutrition analysis for a recipe
export async function getNutritionAnalysis(ingredients: string[]) {
  // Validate credentials
  if (!NUTRITION_APP_ID || !NUTRITION_APP_KEY) {
    throw new Error('Edamam Nutrition API credentials not configured');
  }

  const url = `${NUTRITION_BASE_URL}?app_id=${NUTRITION_APP_ID}&app_key=${NUTRITION_APP_KEY}`;
  
  const data = await fetchWithErrorHandling(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ingr: ingredients
    })
  });

  // Extract the nutrition data
  return {
    calories: Math.round(data.calories),
    totalWeight: Math.round(data.totalWeight),
    dietLabels: data.dietLabels || [],
    healthLabels: data.healthLabels || [],
    nutrients: {
      protein: data.totalNutrients.PROCNT ? {
        quantity: Math.round(data.totalNutrients.PROCNT.quantity),
        unit: data.totalNutrients.PROCNT.unit
      } : null,
      fat: data.totalNutrients.FAT ? {
        quantity: Math.round(data.totalNutrients.FAT.quantity),
        unit: data.totalNutrients.FAT.unit
      } : null,
      carbs: data.totalNutrients.CHOCDF ? {
        quantity: Math.round(data.totalNutrients.CHOCDF.quantity),
        unit: data.totalNutrients.CHOCDF.unit
      } : null,
      fiber: data.totalNutrients.FIBTG ? {
        quantity: Math.round(data.totalNutrients.FIBTG.quantity),
        unit: data.totalNutrients.FIBTG.unit
      } : null,
      sugar: data.totalNutrients.SUGAR ? {
        quantity: Math.round(data.totalNutrients.SUGAR.quantity),
        unit: data.totalNutrients.SUGAR.unit
      } : null,
      sodium: data.totalNutrients.NA ? {
        quantity: Math.round(data.totalNutrients.NA.quantity),
        unit: data.totalNutrients.NA.unit
      } : null,
      calcium: data.totalNutrients.CA ? {
        quantity: Math.round(data.totalNutrients.CA.quantity),
        unit: data.totalNutrients.CA.unit
      } : null,
      iron: data.totalNutrients.FE ? {
        quantity: Math.round(data.totalNutrients.FE.quantity),
        unit: data.totalNutrients.FE.unit
      } : null,
    }
  };
}

// Export all functions as a service object
export const edamamService = {
  searchRecipes,
  getRecipeById,
  getSimilarRecipes,
  getNutritionAnalysis
};