/**
 * Service for image recognition
 * Interface and default implementation for image recognition services
 */

export interface ImageRecognitionService {
  identifyDish(imageBuffer: Buffer): Promise<string | null>;
  identifyIngredients(imageBuffer: Buffer): Promise<string[]>;
  getRecipeAndNutrition(dishName: string): Promise<any>;
}

class MockImageRecognitionService implements ImageRecognitionService {
  // Sample dishes that could be identified
  private readonly sampleDishes = [
    "Pasta with Tomato Sauce",
    "Vegetable Stir Fry",
    "Grilled Salmon",
    "Mediterranean Salad",
    "Beef Tacos",
    "Pasta Carbonara",
    "Avocado Toast",
    "Greek Yogurt Bowl"
  ];

  // Sample ingredients that could be identified
  private readonly sampleIngredients = [
    "tomatoes",
    "onions",
    "garlic",
    "bell peppers",
    "carrots",
    "broccoli",
    "spinach",
    "lettuce",
    "potatoes",
    "chicken",
    "beef",
    "pork",
    "salmon",
    "tuna",
    "eggs",
    "milk",
    "cheese",
    "yogurt",
    "pasta",
    "rice",
    "bread",
    "flour",
    "olive oil",
    "butter",
    "salt",
    "pepper",
    "oregano",
    "basil",
    "cilantro",
    "lemon",
    "lime",
    "avocado"
  ];

  async identifyDish(imageBuffer: Buffer): Promise<string | null> {
    try {
      // In a real implementation, we would send the image to Google Cloud Vision API
      // and get back labels/entities for what's in the image
      
      // For this mock implementation, return a random dish from the sample list
      const randomIndex = Math.floor(Math.random() * this.sampleDishes.length);
      return this.sampleDishes[randomIndex];
    } catch (error) {
      console.error("Error identifying dish:", error);
      return null;
    }
  }

  async identifyIngredients(imageBuffer: Buffer): Promise<string[]> {
    try {
      // In a real implementation, we would send the image to Google Cloud Vision API
      // and get back labels/entities for what ingredients are visible
      
      // For this mock implementation, return 3-6 random ingredients from the sample list
      const count = Math.floor(Math.random() * 4) + 3; // 3 to 6 ingredients
      const shuffled = [...this.sampleIngredients].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    } catch (error) {
      console.error("Error identifying ingredients:", error);
      return [];
    }
  }

  async getRecipeAndNutrition(dishName: string): Promise<any> {
    // For the mock implementation, just return a basic recipe template
    // In real implementation, this would call external API or database
    return {
      name: dishName,
      summary: `A delicious recipe for ${dishName}.`,
      readyInMinutes: 30,
      servings: 4,
      calories: 350,
      protein: "15g",
      carbs: "40g",
      fat: "12g",
      instructions: "Prepare ingredients. Cook according to instructions. Serve hot.",
      extendedIngredients: [
        {
          id: 1001,
          name: "ingredient 1",
          amount: 1,
          unit: "cup",
          original: "1 cup of ingredient 1"
        },
        {
          id: 1002,
          name: "ingredient 2",
          amount: 2,
          unit: "tbsp",
          original: "2 tablespoons of ingredient 2"
        }
      ],
      analyzedInstructions: [
        {
          name: "",
          steps: [
            {
              number: 1,
              step: "Prepare all ingredients.",
              ingredients: [],
              equipment: []
            },
            {
              number: 2,
              step: "Cook according to recipe instructions.",
              ingredients: [],
              equipment: []
            },
            {
              number: 3,
              step: "Serve and enjoy.",
              ingredients: [],
              equipment: []
            }
          ]
        }
      ]
    };
  }
}

class GoogleVisionImageRecognitionService implements ImageRecognitionService {
  async identifyDish(imageBuffer: Buffer): Promise<string | null> {
    try {
      // This would be a real implementation using the Google Cloud Vision API
      // First, we'd need to import the necessary clients:
      // const vision = require('@google-cloud/vision');
      // const client = new vision.ImageAnnotatorClient();
      
      // Then encode the image and call the API:
      // const [result] = await client.labelDetection(imageBuffer);
      // const labels = result.labelAnnotations;
      
      // Process the labels to identify food items
      // const foodLabels = labels.filter(label => foodCategories.includes(label.description));
      
      // Return the highest confidence food item
      // return foodLabels.length > 0 ? foodLabels[0].description : null;
      
      // For now, we'll use the mock implementation
      const mockService = new MockImageRecognitionService();
      return mockService.identifyDish(imageBuffer);
    } catch (error) {
      console.error("Error identifying dish with Google Vision:", error);
      return null;
    }
  }

  async identifyIngredients(imageBuffer: Buffer): Promise<string[]> {
    try {
      // This would be a real implementation using the Google Cloud Vision API
      // However, for now we'll use the mock implementation
      const mockService = new MockImageRecognitionService();
      return mockService.identifyIngredients(imageBuffer);
    } catch (error) {
      console.error("Error identifying ingredients with Google Vision:", error);
      return [];
    }
  }
  
  async getRecipeAndNutrition(dishName: string): Promise<any> {
    // Forward to mock implementation for now
    const mockService = new MockImageRecognitionService();
    return mockService.getRecipeAndNutrition(dishName);
  }
}

// Import the OpenAI-based service
import { OpenAIVisionImageRecognitionService } from './openaiImageRecognition';

// Check if OpenAI API key is available
const apiKey = process.env.OPENAI_API_KEY;

// Export the appropriate service based on API key availability
export const imageRecognitionService: ImageRecognitionService = apiKey 
  ? new OpenAIVisionImageRecognitionService()
  : new MockImageRecognitionService();
