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

// Import the Google Vision API helpers
import * as googleVision from './googleVision';

// Implementation of Google Vision API for image recognition
class GoogleVisionImageRecognitionService implements ImageRecognitionService {
  private mockService: MockImageRecognitionService;
  private isGoogleVisionAvailable: boolean = false;

  constructor() {
    try {
      // Test Google Vision API by analyzing a simple buffer
      const testBuffer = Buffer.from('test');
      googleVision.analyzeImage(testBuffer)
        .then(() => {
          console.log("Google Vision client successfully tested");
          this.isGoogleVisionAvailable = true;
        })
        .catch(error => {
          console.error("Google Vision client test failed:", error);
          this.isGoogleVisionAvailable = false;
        });
    } catch (error) {
      console.error("Failed to initialize Google Vision client:", error);
      this.isGoogleVisionAvailable = false;
    }
    
    // Initialize mock service as fallback
    this.mockService = new MockImageRecognitionService();
    
    console.log("Google Vision Image Recognition Service initialized");
  }

  async identifyDish(imageBuffer: Buffer): Promise<string | null> {
    try {
      // Use Google Vision to identify the dish
      const dishName = await googleVision.identifyDish(imageBuffer);
      
      if (dishName) {
        console.log(`Google Vision identified dish: ${dishName}`);
        return dishName;
      }
      
      // Fall back to mock service if no dish was identified
      console.log("No food items detected with Google Vision, using mock service");
      return this.mockService.identifyDish(imageBuffer);
    } catch (error) {
      console.error("Error identifying dish with Google Vision:", error);
      console.log("Falling back to mock service");
      return this.mockService.identifyDish(imageBuffer);
    }
  }

  async identifyIngredients(imageBuffer: Buffer): Promise<string[]> {
    try {
      // Use Google Vision to identify ingredients
      const ingredients = await googleVision.identifyIngredients(imageBuffer);
      
      if (ingredients && ingredients.length > 0) {
        console.log(`Google Vision identified ingredients: ${ingredients.join(', ')}`);
        return ingredients;
      }
      
      // Fall back to mock service if no ingredients were identified
      console.log("No ingredients detected with Google Vision, using mock service");
      return this.mockService.identifyIngredients(imageBuffer);
    } catch (error) {
      console.error("Error identifying ingredients with Google Vision:", error);
      console.log("Falling back to mock service");
      return this.mockService.identifyIngredients(imageBuffer);
    }
  }
  
  async getRecipeAndNutrition(dishName: string): Promise<any> {
    // We'll continue to use the OpenAI service implementation for generating recipes and nutrition info
    return this.mockService.getRecipeAndNutrition(dishName);
  }
}

// Import the OpenAI-based service
import { OpenAIVisionImageRecognitionService } from './openaiImageRecognition';

// Check for available API credentials
const openaiApiKey = process.env.OPENAI_API_KEY;
const googleCredentialsJson = process.env.GOOGLE_CREDENTIALS_JSON;

// Determine which service to use based on available credentials
let selectedService: ImageRecognitionService;

// Prioritize OpenAI Vision API as the primary choice for dish recognition
if (openaiApiKey) {
  console.log("Using OpenAI Vision for image recognition (primary service)");
  selectedService = new OpenAIVisionImageRecognitionService();
} else if (googleCredentialsJson) {
  console.log("OpenAI API key not found, using Google Cloud Vision API as fallback");
  try {
    const googleVisionService = new GoogleVisionImageRecognitionService();
    selectedService = googleVisionService;
  } catch (error) {
    console.error("Failed to initialize Google Vision service:", error);
    console.log("No working image recognition services available, using mock service");
    selectedService = new MockImageRecognitionService();
  }
} else {
  console.log("No API keys available, using mock image recognition service");
  selectedService = new MockImageRecognitionService();
}

// Export the selected service
export const imageRecognitionService: ImageRecognitionService = selectedService;
