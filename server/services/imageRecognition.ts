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

// Import Google Vision API
import * as vision from '@google-cloud/vision';

// Food-related categories for filtering Vision API results
const FOOD_CATEGORIES = [
  'food', 'dish', 'cuisine', 'meal', 'recipe', 'ingredient', 'breakfast', 'lunch', 'dinner',
  'appetizer', 'dessert', 'snack', 'fruit', 'vegetable', 'meat', 'seafood', 'pasta', 'rice', 
  'sandwich', 'salad', 'soup', 'baked goods', 'bread', 'cake', 'pie', 'cookie', 'pastry'
];

// Proper implementation of Google Vision API for image recognition
class GoogleVisionImageRecognitionService implements ImageRecognitionService {
  private visionClient: vision.ImageAnnotatorClient | null = null;
  private mockService: MockImageRecognitionService;

  constructor() {
    try {
      // First try to use the service-account.json file in the project root
      try {
        // Create the client with the keyFilename option
        this.visionClient = new vision.ImageAnnotatorClient({
          keyFilename: './service-account.json'
        });
        
        console.log("Google Vision client initialized with service-account.json file");
      } catch (fileError) {
        console.error("Failed to initialize with service-account.json:", fileError);
        console.error("Error details:", fileError instanceof Error ? fileError.message : String(fileError));
        
        // Fall back to environment variable if available
        const googleCredentials = process.env.GOOGLE_CREDENTIALS_JSON;
        
        if (googleCredentials) {
          try {
            // Check if the credentials start with '{' (indicating JSON)
            if (googleCredentials.trim().startsWith('{')) {
              // Parse the JSON credentials
              const credentials = JSON.parse(googleCredentials);
              
              // Create the client with the credentials
              this.visionClient = new vision.ImageAnnotatorClient({
                credentials: credentials
              });
              
              console.log("Google Vision client initialized with JSON credentials from env var");
            } else {
              // It's probably an API key, use it directly
              this.visionClient = new vision.ImageAnnotatorClient({
                apiKey: googleCredentials
              });
              
              console.log("Google Vision client initialized with API key from env var");
            }
          } catch (jsonError) {
            console.error("Failed to parse Google credentials:", jsonError);
            console.error("Error details:", jsonError instanceof Error ? jsonError.message : String(jsonError));
            this.visionClient = null;
          }
        } else {
          console.log("No Google credentials available in environment");
          this.visionClient = null;
        }
      }
    } catch (error) {
      console.error("Failed to initialize Google Vision client:", error);
      console.error("Error details:", error instanceof Error ? error.message : String(error));
      this.visionClient = null;
    }
    
    // Initialize mock service as fallback
    this.mockService = new MockImageRecognitionService();
    
    // Log whether we're using the real service or fallback
    if (this.visionClient) {
      console.log("Google Vision client successfully initialized");
    } else {
      console.log("Google Vision client initialization failed, will use fallback service");
    }
  }

  async identifyDish(imageBuffer: Buffer): Promise<string | null> {
    try {
      if (!this.visionClient) {
        console.log("No Vision client available, using mock service");
        return this.mockService.identifyDish(imageBuffer);
      }

      // Call the Vision API to get annotations for the image
      const [result] = await this.visionClient.labelDetection(imageBuffer);
      const labels = result.labelAnnotations || [];
      
      console.log("Vision API labels:", labels.map(l => `${l.description} (${l.score})`).join(', '));
      
      // Filter for labels that are related to food
      const foodLabels = labels.filter(label => {
        const description = label.description?.toLowerCase() || '';
        return FOOD_CATEGORIES.some(category => description.includes(category)) || 
               (label.score !== null && label.score !== undefined && label.score > 0.8); // Include high confidence labels too
      });
      
      // If we found food labels, use them directly
      if (foodLabels.length > 0) {
        // Sort by score (highest first) and return the top result
        foodLabels.sort((a, b) => (b.score || 0) - (a.score || 0));
        return foodLabels[0].description || null;
      }
      
      // If no food-related labels were found, check for generic objects
      if (this.visionClient) {
        try {
          console.log("No food labels found, using object detection");
          const [objectResult] = await this.visionClient.objectLocalization(imageBuffer);
          const objects = objectResult.localizedObjectAnnotations || [];
          
          console.log("Vision API objects:", objects.map(o => `${o.name || 'unnamed'} (${o.score || 0})`).join(', '));
          
          const foodObjects = objects.filter(obj => {
            const name = obj.name?.toLowerCase() || '';
            return FOOD_CATEGORIES.some(category => name.includes(category)) || 
                  (obj.score !== null && obj.score !== undefined && obj.score > 0.8);
          });
          
          if (foodObjects.length > 0) {
            // Sort by score (highest first) and return the top result
            foodObjects.sort((a, b) => (b.score || 0) - (a.score || 0));
            return foodObjects[0].name || null;
          }
        } catch (error) {
          console.error("Error during object localization:", error);
        }
      }
      
      // If we haven't returned yet, use the mock service as a fallback
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
      if (!this.visionClient) {
        console.log("No Vision client available, using mock service");
        return this.mockService.identifyIngredients(imageBuffer);
      }
      
      // Use both label detection and object localization for better ingredient identification
      try {
        const [labelResult] = await this.visionClient.labelDetection(imageBuffer);
        const [objectResult] = await this.visionClient.objectLocalization(imageBuffer);
        
        const labels = labelResult.labelAnnotations || [];
        const objects = objectResult.localizedObjectAnnotations || [];
        
        console.log("Vision API labels for ingredients:", labels.map(l => `${l.description || 'unnamed'} (${l.score || 0})`).join(', '));
        console.log("Vision API objects for ingredients:", objects.map(o => `${o.name || 'unnamed'} (${o.score || 0})`).join(', '));
        
        // Extract potential ingredients from labels
        const ingredientsFromLabels = labels
          .filter(label => (label.score !== null && label.score !== undefined && label.score > 0.6)) // Only consider labels with decent confidence
          .map(label => label.description || "")
          .filter(desc => desc.length > 0);
        
        // Extract potential ingredients from objects
        const ingredientsFromObjects = objects
          .filter(obj => (obj.score !== null && obj.score !== undefined && obj.score > 0.6)) // Only consider objects with decent confidence
          .map(obj => obj.name || "")
          .filter(name => name.length > 0);
        
        // Combine both sets and remove duplicates
        const ingredientSet = new Set([...ingredientsFromLabels, ...ingredientsFromObjects]);
        const allIngredients = Array.from(ingredientSet);
        
        // If we found ingredients, return them
        if (allIngredients.length > 0) {
          return allIngredients.slice(0, 10); // Limit to top 10 to avoid overwhelming results
        }
      } catch (error) {
        console.error("Error analyzing ingredients with Google Vision:", error);
      }
      
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

if (googleCredentialsJson) {
  console.log("Google Cloud Vision credentials found, trying to use Google Vision API");
  try {
    const googleVisionService = new GoogleVisionImageRecognitionService();
    selectedService = googleVisionService;
  } catch (error) {
    console.error("Failed to initialize Google Vision service:", error);
    console.log("Falling back to OpenAI Vision");
    
    if (openaiApiKey) {
      selectedService = new OpenAIVisionImageRecognitionService();
    } else {
      selectedService = new MockImageRecognitionService();
    }
  }
} else if (openaiApiKey) {
  console.log("Using OpenAI Vision for image recognition");
  selectedService = new OpenAIVisionImageRecognitionService();
} else {
  console.log("No API keys available, using mock image recognition service");
  selectedService = new MockImageRecognitionService();
}

// Export the selected service
export const imageRecognitionService: ImageRecognitionService = selectedService;
