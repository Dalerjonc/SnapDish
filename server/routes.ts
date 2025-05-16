import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { imageRecognitionService } from "./services/imageRecognition";
import { recipeApiService } from "./services/recipeApi";
import { EdamamRecipeApiService } from "./services/EdamamRecipeApiService";
import { openaiService } from "./services/openai";
import multer from "multer";
import { z } from "zod";
import { ingredientsSearchSchema, chatMessageSchema } from "@shared/schema";
import { ZodError } from "zod";

// Setup multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  app.use("/api", express.json());
  
  // Create a separate router just for recipe routes to better control their order
  const recipesRouter = express.Router();
  
  // Popular and quick recipes (home screen)
  // Static routes come first
  recipesRouter.get("/popular", async (req, res) => {
    try {
      const recipes = await recipeApiService.getPopularRecipes();
      res.json(recipes);
    } catch (error) {
      console.error("Error fetching popular recipes:", error);
      res.status(500).json({ message: "Error fetching popular recipes" });
    }
  });

  recipesRouter.get("/quick", async (req, res) => {
    try {
      const recipes = await recipeApiService.getQuickRecipes();
      res.json(recipes);
    } catch (error) {
      console.error("Error fetching quick recipes:", error);
      res.status(500).json({ message: "Error fetching quick recipes" });
    }
  });
  
  // Get saved recipes
  recipesRouter.get("/saved", async (req, res) => {
    try {
      // For simplicity, using a mock user ID since we don't have authentication
      const userId = 1;
      
      const savedRecipes = await storage.getSavedRecipes(userId);
      res.json(savedRecipes);
    } catch (error) {
      console.error("Error fetching saved recipes:", error);
      res.status(500).json({ message: "Error fetching saved recipes" });
    }
  });
  
  // Search recipes by name - IMPORTANT: This must come before the :id route
  recipesRouter.get("/search", async (req, res) => {
    try {
      const query = req.query.query as string;
      
      if (!query || query.trim().length === 0) {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      console.log("Searching for recipes with query:", query);
      
      try {
        const recipe = await recipeApiService.searchRecipeByName(query);
        // Return the result as an array for consistency with other recipe endpoints
        res.json([recipe]);
      } catch (searchError) {
        console.log("No exact match found, generating a recipe with OpenAI");
        
        try {
          // Generate a recipe using OpenAI
          const openAIRecipeData = await imageRecognitionService.getRecipeAndNutrition(query);
          
          if (!openAIRecipeData) {
            return res.status(404).json({ message: "Could not generate recipe for search query" });
          }
          
          // Create a recipe object with a random ID
          const recipe = {
            id: Math.floor(Math.random() * 10000) + 1000,
            name: openAIRecipeData.name || query,
            image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c", // Default food image
            readyInMinutes: openAIRecipeData.readyInMinutes || 30,
            servings: openAIRecipeData.servings || 4,
            sourceUrl: "",
            summary: openAIRecipeData.summary || `Recipe for ${query}`,
            instructions: Array.isArray(openAIRecipeData.instructions) 
              ? openAIRecipeData.instructions 
              : typeof openAIRecipeData.instructions === 'string'
                ? [openAIRecipeData.instructions] 
                : ["No instructions available"],
            calories: openAIRecipeData.calories || 0,
            protein: openAIRecipeData.protein || "0g",
            carbs: openAIRecipeData.carbs || "0g",
            fat: openAIRecipeData.fat || "0g",
            diets: openAIRecipeData.diets || [],
            extendedIngredients: openAIRecipeData.extendedIngredients || [],
            analyzedInstructions: 
              (openAIRecipeData.analyzedInstructions && Array.isArray(openAIRecipeData.analyzedInstructions) && openAIRecipeData.analyzedInstructions.length > 0)
                ? openAIRecipeData.analyzedInstructions 
                : [{
                    name: "",
                    steps: Array.isArray(openAIRecipeData.instructions) 
                      ? openAIRecipeData.instructions.map((step: string, index: number) => ({
                          number: index + 1,
                          step: step,
                          ingredients: [],
                          equipment: []
                        }))
                      : [{
                          number: 1,
                          step: "No detailed instructions available",
                          ingredients: [],
                          equipment: []
                        }]
                  }],
            created_at: new Date()
          };
          
          res.json([recipe]);
        } catch (openaiError) {
          console.error("Error generating recipe with OpenAI:", openaiError);
          res.status(500).json({ message: "Error generating recipe for search query" });
        }
      }
    } catch (error) {
      console.error("Error searching recipes:", error);
      res.status(500).json({ message: "Error searching recipes" });
    }
  });

  // Now add the parameter routes
  
  // Get recipe details
  recipesRouter.get("/:id", async (req, res) => {
    try {
      // Get the original ID string from the request
      const rawId = req.params.id;
      console.log(`Recipe lookup requested for ID: ${rawId}`);
      
      // Try to parse as number but don't reject string IDs (for Edamam recipe_xxx IDs)
      const numericId = parseInt(rawId);
      let lookupId: number | string;
      
      // If it's a valid recipe ID from Edamam (starting with "recipe_"), use it directly
      if (rawId && rawId.startsWith && rawId.startsWith('recipe_')) {
        console.log(`Detected Edamam recipe ID: ${rawId}`);
        lookupId = rawId;
      } else {
        // Otherwise, try to convert to number if possible
        lookupId = !isNaN(numericId) ? numericId : rawId;
      }
      
      // If it's a string ID, also compute a hash to try later as fallback
      let hashedId: number | null = null;
      if (typeof lookupId === 'string' && lookupId.length > 8) {
        // Compute a hash for long string IDs (like Edamam IDs)
        let hash = 0;
        for (let i = 0; i < lookupId.length; i++) {
          const char = lookupId.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash; // Convert to 32bit integer
        }
        // Ensure the hash is positive and within our ID range
        hashedId = 10000 + (Math.abs(hash) % 89999);
        console.log(`Generated numeric hash ${hashedId} from string ID: ${lookupId}`);
      }
      
      console.log(`Will try looking up recipe with ID: ${lookupId} (${typeof lookupId})`);

      try {
        // First try to get the recipe with the parsed ID
        const recipe = await recipeApiService.getRecipeById(lookupId);
        
        if (recipe) {
          console.log(`Found recipe in database: ${recipe.name}`);
          
          // Cache the recipe with both formats to ensure it's findable later
          if (recipeApiService instanceof EdamamRecipeApiService) {
            console.log(`Re-caching recipe with ID: ${recipe.id}`);
            recipeApiService.cacheRecipe(recipe);
          }
          
          return res.json(recipe);
        }
      } catch (firstLookupError) {
        console.log(`Recipe not found with ID ${lookupId}: ${firstLookupError instanceof Error ? firstLookupError.message : 'Unknown error'}`);
        
        // Try the alternative format if we get here (string->number or number->string)
        if (typeof lookupId === 'number') {
          // We tried with number, now try with string
          lookupId = rawId;
        } else if (!isNaN(numericId)) {
          // We tried with string, now try with number
          lookupId = numericId;
        }
        
        console.log(`Trying alternative ID format: ${lookupId} (${typeof lookupId})`);
        
        try {
          const recipe = await recipeApiService.getRecipeById(lookupId);
          if (recipe) {
            console.log(`Found recipe with alternative ID format: ${recipe.name}`);
            // Cache with both formats
            if (recipeApiService instanceof EdamamRecipeApiService) {
              recipeApiService.cacheRecipe(recipe);
            }
            return res.json(recipe);
          }
        } catch (secondLookupError) {
          console.log(`Recipe not found with alternative ID format: ${secondLookupError instanceof Error ? secondLookupError.message : 'Unknown error'}`);
          
          // Try the hashed ID as a last resort
          if (hashedId !== null) {
            console.log(`Trying hashed ID as last resort: ${hashedId}`);
            try {
              const recipe = await recipeApiService.getRecipeById(hashedId);
              if (recipe) {
                console.log(`Found recipe with hashed ID: ${recipe.name}`);
                // Cache with all formats
                if (recipeApiService instanceof EdamamRecipeApiService) {
                  recipeApiService.cacheRecipe(recipe);
                }
                return res.json(recipe);
              }
            } catch (hashedError) {
              console.log(`Recipe not found with hashed ID: ${hashedError instanceof Error ? hashedError.message : 'Unknown error'}`);
            }
          }
        }
        
        // If all lookups failed and it's a high ID, it could be a dynamically generated recipe
        if (numericId && numericId > 1000) {
          // Get the dish name from query params
          const dishName = req.query.name as string;
          
          if (dishName) {
            console.log("Regenerating recipe with OpenAI for:", dishName);
            
            try {
              // Generate the recipe data with OpenAI
              const openAIRecipeData = await imageRecognitionService.getRecipeAndNutrition(dishName);
              
              // Create a recipe object
              const generatedRecipe = {
                id: numericId, // Use the requested numeric ID
                name: openAIRecipeData.name || dishName,
                image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c", // Default food image
                readyInMinutes: openAIRecipeData.readyInMinutes || 30,
                servings: openAIRecipeData.servings || 4,
                sourceUrl: "",
                summary: openAIRecipeData.summary || `Recipe for ${dishName}`,
                instructions: Array.isArray(openAIRecipeData.instructions) 
                ? openAIRecipeData.instructions 
                : typeof openAIRecipeData.instructions === 'string'
                  ? [openAIRecipeData.instructions] 
                  : ["No instructions available"],
                calories: openAIRecipeData.calories || 0,
                protein: openAIRecipeData.protein || "0g",
                carbs: openAIRecipeData.carbs || "0g",
                fat: openAIRecipeData.fat || "0g",
                diets: openAIRecipeData.diets || [],
                extendedIngredients: openAIRecipeData.extendedIngredients || [],
                analyzedInstructions: openAIRecipeData.analyzedInstructions || [{
                  name: "",
                  steps: [
                    {
                      number: 1,
                      step: "No detailed instructions available",
                      ingredients: [],
                      equipment: []
                    }
                  ]
                }],
                created_at: new Date()
              };
              
              // Cache the regenerated recipe for future lookups
              if (recipeApiService instanceof EdamamRecipeApiService) {
                console.log(`Caching regenerated recipe with ID: ${numericId}`);
                recipeApiService.cacheRecipe(generatedRecipe);
                
                // Verify recipe is cached properly
                try {
                  const cachedRecipe = await recipeApiService.getRecipeById(numericId);
                  console.log(`Successfully verified cached recipe: ${cachedRecipe.name}`);
                } catch (cacheError) {
                  console.error(`Failed to verify recipe in cache: ${cacheError.message}`);
                }
              }
              
              return res.json(generatedRecipe);
            } catch (openaiError) {
              console.error("Error generating recipe with OpenAI:", openaiError);
            }
          }
        }
      }
      
      // If we get here, we couldn't find or generate the recipe
      return res.status(404).json({ message: "Recipe not found" });
    } catch (error) {
      console.error("Error fetching recipe:", error);
      res.status(500).json({ message: "Error fetching recipe details" });
    }
  });

  // Get similar recipes
  recipesRouter.get("/:id/similar", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid recipe ID" });
      }

      const recipes = await recipeApiService.getSimilarRecipes(id);
      res.json(recipes);
    } catch (error) {
      console.error("Error fetching similar recipes:", error);
      res.status(500).json({ message: "Error fetching similar recipes" });
    }
  });

  // Identify dish from photo
  recipesRouter.post("/identify", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image uploaded" });
      }

      console.log("Processing image for dish identification...");
      console.log("Uploaded file info:", req.file.originalname, req.file.mimetype, req.file.size);
      
      // Get image buffer
      const imageBuffer = req.file.buffer;
      
      let detectedDish;
      
      // First try to use OpenAI Vision API for dish identification
      try {
        if (!process.env.OPENAI_API_KEY) {
          throw new Error("OpenAI API key not configured");
        }
        
        // Use OpenAI Vision API for dish identification
        detectedDish = await imageRecognitionService.identifyDish(imageBuffer);
        console.log("OpenAI Vision API identified dish:", detectedDish);
        
        if (!detectedDish) {
          return res.status(404).json({ 
            message: "Could not identify any dish in the image. Please try with a clearer image of the food."
          });
        }
      } catch (visionError) {
        console.error("Error with OpenAI Vision API call:", visionError);
        return res.status(500).json({ 
          message: "Error identifying the dish", 
          error: visionError instanceof Error ? visionError.message : String(visionError)
        });
      }
      
      try {
        // Now search for the identified dish using Edamam Recipe API
        console.log("Searching for recipes for identified dish:", detectedDish);
        
        // Check if we have Edamam credentials configured
        if (!process.env.EDAMAM_RECIPE_APP_ID || !process.env.EDAMAM_RECIPE_APP_KEY) {
          console.warn("Edamam Recipe API credentials not configured, falling back to OpenAI for recipe generation");
          throw new Error("Edamam API credentials missing");
        }
        
        // First attempt: Direct search by dish name
        let recipe;
        
        try {
          console.log("Searching Edamam for recipe by name:", detectedDish);
          recipe = await recipeApiService.searchRecipeByName(detectedDish);
          console.log("Found recipe with Edamam by name:", recipe.name);
        } catch (nameSearchError) {
          console.warn("Error searching by name, trying ingredient search:", nameSearchError);
          
          // Second attempt: Try searching by ingredients
          try {
            console.log("Searching Edamam with dish as ingredient:", detectedDish);
            const ingredientRecipes = await recipeApiService.getRecipesByIngredients([detectedDish]);
            
            if (ingredientRecipes && ingredientRecipes.length > 0) {
              recipe = ingredientRecipes[0];
              console.log("Found recipe with Edamam by ingredient:", recipe.name);
            } else {
              throw new Error("No recipes found by ingredient search");
            }
          } catch (ingredientSearchError) {
            console.warn("Error in ingredient search:", ingredientSearchError);
            throw new Error("Edamam could not find matching recipes");
          }
        }
        
        // Process the Edamam recipe to ensure consistent ID format
        if (recipe) {
          // Ensure recipe has a consistent numeric ID
          let recipeId = recipe.id;
          
          if (!recipeId) {
            // Generate random ID if none exists
            recipeId = 10000 + Math.floor(Math.random() * 89999); // Generate ID between 10000-99999
            console.log(`Generated new ID ${recipeId} for Edamam recipe: ${recipe.name}`);
          } else if (typeof recipeId === 'string') {
            // Try to convert string ID to number
            if (!isNaN(parseInt(recipeId))) {
              recipeId = parseInt(recipeId);
              console.log(`Converted string ID "${recipe.id}" to number: ${recipeId}`);
            } else {
              // For non-numeric IDs, use a hash function
              let hash = 0;
              for (let i = 0; i < recipeId.length; i++) {
                const char = recipeId.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32bit integer
              }
              // Ensure the hash is positive and within our ID range
              recipeId = 10000 + (Math.abs(hash) % 89999);
              console.log(`Hashed string ID "${recipe.id}" to numeric ID: ${recipeId}`);
            }
          }
          
          // Complete recipe with any missing fields and consistent ID format
          const completeRecipe = {
            ...recipe,
            id: recipeId,
            instructions: recipe.instructions || [],
            summary: recipe.summary || `Recipe for ${detectedDish}`,
            created_at: new Date()
          };
          
          // Cache the recipe
          if (recipeApiService instanceof EdamamRecipeApiService) {
            console.log(`Caching Edamam recipe with ID: ${completeRecipe.id}`);
            recipeApiService.cacheRecipe(completeRecipe);
          }
          
          console.log("Successfully returned Edamam recipe for:", detectedDish);
          return res.json(completeRecipe);
        }
        
      } catch (edamamError) {
        // Edamam search failed, fall back to OpenAI for recipe generation
        console.warn("Edamam search failed, falling back to OpenAI recipe generation:", edamamError);
      }
      
      // If we get here, Edamam didn't return a recipe, generate with OpenAI
      console.log("Generating recipe with OpenAI for:", detectedDish);
      
      try {
        // Generate recipe with OpenAI
        const openAIRecipeData = await imageRecognitionService.getRecipeAndNutrition(detectedDish);
        console.log("Generated recipe with OpenAI:", openAIRecipeData.name || detectedDish);
        
        // Generate a consistent numeric ID for the recipe
        const recipeId = 50000 + Math.floor(Math.random() * 49999); // Generate ID between 50000-99999 (different range from Edamam)
        
        // Convert OpenAI recipe to our format
        const recipe = {
          id: recipeId,
          name: openAIRecipeData.name || detectedDish,
          image: openAIRecipeData.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c", // Default food image
          readyInMinutes: openAIRecipeData.readyInMinutes || 30,
          servings: openAIRecipeData.servings || 4,
          sourceUrl: "",
          summary: openAIRecipeData.summary || `Recipe for ${detectedDish}`,
          instructions: Array.isArray(openAIRecipeData.instructions) 
            ? openAIRecipeData.instructions 
            : typeof openAIRecipeData.instructions === 'string'
              ? [openAIRecipeData.instructions] 
              : ["No instructions available"],
          calories: openAIRecipeData.calories || 0,
          protein: openAIRecipeData.protein || "0g",
          carbs: openAIRecipeData.carbs || "0g",
          fat: openAIRecipeData.fat || "0g",
          diets: openAIRecipeData.diets || [],
          extendedIngredients: openAIRecipeData.extendedIngredients || [],
          analyzedInstructions: 
            (openAIRecipeData.analyzedInstructions && Array.isArray(openAIRecipeData.analyzedInstructions) && openAIRecipeData.analyzedInstructions.length > 0)
              ? openAIRecipeData.analyzedInstructions 
              : [{
                  name: "",
                  steps: Array.isArray(openAIRecipeData.instructions) 
                    ? openAIRecipeData.instructions.map((step: string, index: number) => ({
                        number: index + 1,
                        step: step,
                        ingredients: [],
                        equipment: []
                      }))
                    : [{
                        number: 1,
                        step: "No detailed instructions available",
                        ingredients: [],
                        equipment: []
                      }]
                }],
          created_at: new Date()
        };
        
        // Check if we got a valid recipe with all required fields
        if (!recipe || !recipe.id || !recipe.name) {
          console.error("Invalid recipe generated:", recipe);
          return res.status(404).json({ 
            message: "Could not generate valid recipe for the identified dish"
          });
        }
        
        console.log("Successfully generated OpenAI recipe for:", recipe.name, "with ID:", recipe.id);
        
        // Cache the OpenAI-generated recipe
        if (recipeApiService instanceof EdamamRecipeApiService) {
          recipeApiService.cacheRecipe(recipe);
        }
        
        return res.json(recipe);
      } catch (openaiError) {
        console.error("Error generating recipe with OpenAI:", openaiError);
        return res.status(500).json({ 
          message: "Failed to generate recipe with AI",
          error: openaiError instanceof Error ? openaiError.message : String(openaiError)
        });
      }
    } catch (error) {
      console.error("Error in dish identification process:", error);
      res.status(500).json({ 
        message: "Error processing image or finding matching recipe",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Get recipes by ingredients
  recipesRouter.post("/by-ingredients", async (req, res) => {
    try {
      const { ingredients } = ingredientsSearchSchema.parse(req.body);
      
      if (!ingredients || ingredients.length === 0) {
        return res.status(400).json({ message: "No ingredients provided" });
      }
      
      const recipes = await recipeApiService.getRecipesByIngredients(ingredients);
      res.json(recipes);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      console.error("Error finding recipes by ingredients:", error);
      res.status(500).json({ message: "Error finding recipes" });
    }
  });

  // Identify ingredients from photo
  app.post("/api/ingredients/identify", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image uploaded" });
      }

      console.log("Processing image for ingredients identification...");
      console.log("Uploaded file info:", req.file.originalname, req.file.mimetype, req.file.size);
      
      // Get image buffer
      const imageBuffer = req.file.buffer;
      
      let ingredients: string[] = [];
      
      // Use our imageRecognitionService which now prioritizes OpenAI
      try {
        console.log("Using image recognition service for ingredient detection");
        ingredients = await imageRecognitionService.identifyIngredients(imageBuffer);
        console.log("Identified ingredients:", ingredients);
      } catch (visionError) {
        console.error("Error identifying ingredients:", visionError);
        return res.status(500).json({ 
          message: "Error processing image for ingredients", 
          error: visionError instanceof Error ? visionError.message : String(visionError) 
        });
      }
      
      if (!ingredients || ingredients.length === 0) {
        return res.status(404).json({ message: "Could not identify any ingredients in the image" });
      }
      
      res.json(ingredients);
    } catch (error) {
      console.error("Error identifying ingredients:", error);
      res.status(500).json({ message: "Error processing image" });
    }
  });

  // Save recipe
  recipesRouter.post("/:id/save", async (req, res) => {
    try {
      const recipeId = parseInt(req.params.id);
      if (isNaN(recipeId)) {
        return res.status(400).json({ message: "Invalid recipe ID" });
      }

      // For simplicity, using a mock user ID since we don't have authentication
      const userId = 1;
      
      await storage.saveRecipe(userId, recipeId);
      res.status(200).json({ message: "Recipe saved" });
    } catch (error) {
      console.error("Error saving recipe:", error);
      res.status(500).json({ message: "Error saving recipe" });
    }
  });

  // Remove saved recipe
  recipesRouter.delete("/:id/save", async (req, res) => {
    try {
      const recipeId = parseInt(req.params.id);
      if (isNaN(recipeId)) {
        return res.status(400).json({ message: "Invalid recipe ID" });
      }

      // For simplicity, using a mock user ID since we don't have authentication
      const userId = 1;
      
      await storage.removeSavedRecipe(userId, recipeId);
      res.status(200).json({ message: "Recipe removed from saved" });
    } catch (error) {
      console.error("Error removing saved recipe:", error);
      res.status(500).json({ message: "Error removing saved recipe" });
    }
  });
  
  // Mount the recipes router
  app.use("/api/recipes", recipesRouter);
  
  // Create a chat router for all chat-related endpoints
  const chatRouter = express.Router();

  // Chat with AI
  chatRouter.post("/", async (req, res) => {
    try {
      const { message, recipeId } = chatMessageSchema.parse(req.body);
      
      // For simplicity, using a mock user ID since we don't have authentication
      const userId = 1;
      
      // Get recipe context if recipeId is provided
      let recipeContext = null;
      if (recipeId) {
        recipeContext = await recipeApiService.getRecipeById(recipeId);
      }
      
      // Get chat history
      const chatHistory = await storage.getChatHistory(userId);
      
      // Generate AI response
      const aiResponse = await openaiService.generateChatResponse(message, chatHistory, recipeContext);
      
      // Save the message to chat history
      await storage.addChatMessage(userId, {
        role: "user",
        content: message,
        timestamp: Date.now()
      });
      
      // Save AI response to chat history
      const responseMessage = {
        role: "assistant" as const,
        content: aiResponse,
        timestamp: Date.now()
      };
      
      await storage.addChatMessage(userId, responseMessage);
      
      res.json(responseMessage);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      console.error("Error generating chat response:", error);
      res.status(500).json({ message: "Error generating chat response" });
    }
  });

  // Get chat history
  chatRouter.get("/history", async (req, res) => {
    try {
      // For simplicity, using a mock user ID since we don't have authentication
      const userId = 1;
      
      const chatHistory = await storage.getChatHistory(userId);
      res.json(chatHistory);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      res.status(500).json({ message: "Error fetching chat history" });
    }
  });
  
  // Mount the chat router
  app.use("/api/chat", chatRouter);
  
  // Create an ingredients router
  const ingredientsRouter = express.Router();
  
  // Add nutrition analysis endpoint
  ingredientsRouter.post("/analyze", async (req, res) => {
    try {
      const { ingredients } = req.body;
      
      if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
        return res.status(400).json({ message: "No ingredients provided" });
      }
      
      // Import the OpenAI Nutrition Service
      const { nutritionService } = require('./services/OpenAINutritionService');
      
      if (!nutritionService) {
        return res.status(500).json({ message: "Nutrition service not available" });
      }
      
      const nutritionInfo = await nutritionService.analyzeIngredients(ingredients);
      res.json(nutritionInfo);
    } catch (error) {
      console.error("Error analyzing ingredients nutrition:", error);
      res.status(500).json({ 
        message: "Error analyzing nutrition information", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });
  
  // Add meal plan generation endpoint
  ingredientsRouter.post("/mealplan", async (req, res) => {
    try {
      const preferences = req.body;
      
      // Import the OpenAI Nutrition Service
      const { nutritionService } = require('./services/OpenAINutritionService');
      
      if (!nutritionService) {
        return res.status(500).json({ message: "Nutrition service not available" });
      }
      
      const mealPlan = await nutritionService.generateMealPlan(preferences);
      res.json(mealPlan);
    } catch (error) {
      console.error("Error generating meal plan:", error);
      res.status(500).json({ 
        message: "Error generating meal plan", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });
  
  // We already have a similar endpoint at /api/ingredients/identify
  // This endpoint is kept for backward compatibility
  ingredientsRouter.post("/identify", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image uploaded" });
      }

      console.log("Processing image for ingredients identification...");
      console.log("Uploaded file info:", req.file.originalname, req.file.mimetype, req.file.size);
      
      // Get image buffer
      const imageBuffer = req.file.buffer;
      
      // Use our imageRecognitionService which now prioritizes OpenAI
      const ingredients = await imageRecognitionService.identifyIngredients(imageBuffer);
      
      if (!ingredients || ingredients.length === 0) {
        return res.status(404).json({ message: "Could not identify any ingredients in the image" });
      }
      
      res.json(ingredients);
    } catch (error) {
      console.error("Error identifying ingredients:", error);
      res.status(500).json({ 
        message: "Error processing image for ingredients", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });
  
  // Mount the ingredients router
  app.use("/api/ingredients", ingredientsRouter);

  const httpServer = createServer(app);
  
  return httpServer;
}
