/**
 * OpenAI Nutrition Analysis Service
 * Uses OpenAI to analyze nutrition information for ingredients and recipes
 */
import OpenAI from "openai";

export interface NutritionInfo {
  calories: number;
  protein: string;
  carbs: string;
  fat: string;
  [key: string]: any;
}

export interface NutritionService {
  analyzeIngredients(ingredients: string[]): Promise<NutritionInfo>;
  analyzeMeal(meal: string): Promise<NutritionInfo>;
  generateMealPlan(preferences: any): Promise<any>;
}

export class OpenAINutritionService implements NutritionService {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
    console.log("OpenAI Nutrition Service initialized");
  }

  async analyzeIngredients(ingredients: string[]): Promise<NutritionInfo> {
    console.log(`Analyzing nutrition for ingredients: ${ingredients.join(', ')}`);
    
    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are a nutrition expert. Analyze the nutritional content of these ingredients: ${ingredients.join(', ')}. 
            Return the nutritional information in the exact JSON format shown below:
            {
              "calories": 450,
              "protein": "20g",
              "carbs": "35g",
              "fat": "15g",
              "fiber": "8g",
              "sugar": "10g",
              "sodium": "500mg",
              "analysis": "Brief explanation of the nutritional profile"
            }
            Provide accurate estimates for a typical serving. Consider the combined nutrition of all ingredients listed.`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1000
      });

      const data = JSON.parse(response.choices[0].message.content || "{}");
      
      if (!data || typeof data.calories === 'undefined') {
        throw new Error("OpenAI did not return valid nutrition information");
      }

      return {
        calories: data.calories || 0,
        protein: data.protein || "0g",
        carbs: data.carbs || "0g",
        fat: data.fat || "0g",
        fiber: data.fiber || "0g",
        sugar: data.sugar || "0g",
        sodium: data.sodium || "0mg",
        analysis: data.analysis || "No detailed analysis available"
      };
    } catch (error) {
      console.error("Error analyzing ingredients with OpenAI:", error);
      return {
        calories: 0,
        protein: "0g",
        carbs: "0g",
        fat: "0g",
        analysis: "Failed to analyze ingredients"
      };
    }
  }

  async analyzeMeal(meal: string): Promise<NutritionInfo> {
    console.log(`Analyzing nutrition for meal: ${meal}`);
    
    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are a nutrition expert. Analyze the nutritional content of this meal: "${meal}". 
            Return the nutritional information in the exact JSON format shown below:
            {
              "calories": 650,
              "protein": "30g",
              "carbs": "45g",
              "fat": "25g",
              "fiber": "8g",
              "sugar": "12g",
              "sodium": "800mg",
              "analysis": "Brief explanation of the nutritional profile of this meal, including key nutrients and health considerations"
            }
            Provide accurate estimates for a typical portion. If the meal description is vague, make reasonable assumptions.`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1000
      });

      const data = JSON.parse(response.choices[0].message.content || "{}");
      
      if (!data || typeof data.calories === 'undefined') {
        throw new Error("OpenAI did not return valid nutrition information");
      }

      return {
        calories: data.calories || 0,
        protein: data.protein || "0g",
        carbs: data.carbs || "0g",
        fat: data.fat || "0g",
        fiber: data.fiber || "0g",
        sugar: data.sugar || "0g",
        sodium: data.sodium || "0mg",
        analysis: data.analysis || "No detailed analysis available"
      };
    } catch (error) {
      console.error("Error analyzing meal with OpenAI:", error);
      return {
        calories: 0,
        protein: "0g",
        carbs: "0g",
        fat: "0g",
        analysis: "Failed to analyze meal"
      };
    }
  }

  async generateMealPlan(preferences: any): Promise<any> {
    console.log(`Generating meal plan with preferences:`, preferences);
    
    // Extract preferences
    const days = preferences.days || 3;
    const calories = preferences.calories || 2000;
    const diet = preferences.diet || "balanced";
    const allergies = preferences.allergies || [];
    const cuisinePreferences = preferences.cuisines || [];
    
    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are a nutrition expert and meal planner. Generate a ${days}-day meal plan with these preferences:
            - Target calories: ${calories} per day
            - Diet type: ${diet}
            - Allergies/Restrictions: ${allergies.join(', ') || 'None'}
            - Preferred cuisines: ${cuisinePreferences.join(', ') || 'Any'}
            
            Return the meal plan in the exact JSON format shown below:
            {
              "plan": [
                {
                  "day": 1,
                  "meals": [
                    {
                      "type": "Breakfast",
                      "name": "Meal name",
                      "ingredients": ["ingredient 1", "ingredient 2"],
                      "nutritionSummary": {
                        "calories": 400,
                        "protein": "20g",
                        "carbs": "40g",
                        "fat": "15g"
                      }
                    },
                    {
                      "type": "Lunch",
                      "name": "Meal name",
                      "ingredients": ["ingredient 1", "ingredient 2"],
                      "nutritionSummary": {
                        "calories": 650,
                        "protein": "35g",
                        "carbs": "60g",
                        "fat": "25g"
                      }
                    },
                    {
                      "type": "Dinner",
                      "name": "Meal name",
                      "ingredients": ["ingredient 1", "ingredient 2"],
                      "nutritionSummary": {
                        "calories": 700,
                        "protein": "40g",
                        "carbs": "50g",
                        "fat": "30g"
                      }
                    },
                    {
                      "type": "Snack",
                      "name": "Snack name",
                      "ingredients": ["ingredient 1", "ingredient 2"],
                      "nutritionSummary": {
                        "calories": 250,
                        "protein": "10g",
                        "carbs": "25g",
                        "fat": "10g"
                      }
                    }
                  ],
                  "dailyNutrition": {
                    "calories": 2000,
                    "protein": "105g",
                    "carbs": "175g",
                    "fat": "80g"
                  }
                }
              ],
              "shoppingList": [
                {"category": "Protein", "items": ["chicken breast", "eggs"]},
                {"category": "Produce", "items": ["spinach", "apples"]},
                {"category": "Grains", "items": ["brown rice", "quinoa"]},
                {"category": "Dairy", "items": ["greek yogurt", "cheese"]},
                {"category": "Other", "items": ["olive oil", "nuts"]}
              ]
            }
            
            Create a meal plan with a variety of foods that match the preferences. Each day should have breakfast, lunch, dinner, and at least one snack.
            Ensure meals align with the target calories and diet type. Avoid any allergens listed. Match cuisine preferences where possible.
            Include a consolidated shopping list for all days, categorized by food group.`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 2500
      });

      const data = JSON.parse(response.choices[0].message.content || "{}");
      
      if (!data || !data.plan || !Array.isArray(data.plan)) {
        throw new Error("OpenAI did not return a valid meal plan");
      }

      return data;
    } catch (error) {
      console.error("Error generating meal plan with OpenAI:", error);
      return {
        error: "Failed to generate meal plan",
        message: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
}

// Export an instance with environment API key
const apiKey = process.env.OPENAI_API_KEY;
export const nutritionService = apiKey
  ? new OpenAINutritionService(apiKey)
  : null;