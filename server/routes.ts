import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { imageRecognitionService } from "./services/imageRecognition";
import { recipeApiService } from "./services/recipeApi";
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
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid recipe ID" });
      }

      try {
        // First try to get from predefined recipes
        const recipe = await recipeApiService.getRecipeById(id);
        
        if (recipe) {
          console.log("Found recipe in database:", recipe.name);
          return res.json(recipe);
        }
      } catch (dbError) {
        console.log("Recipe not found in database, ID:", id);
        
        // If it's a high ID (above 1000), it's likely a dynamically generated recipe
        if (id > 1000) {
          // Get the dish name from query params
          const dishName = req.query.name as string;
          
          if (dishName) {
            console.log("Regenerating recipe with OpenAI for:", dishName);
            
            try {
              // Generate the recipe data with OpenAI
              const openAIRecipeData = await imageRecognitionService.getRecipeAndNutrition(dishName);
              
              // Create a recipe object
              const generatedRecipe = {
                id: id, // Use the requested ID
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
      
      // Identify the dish using Google Vision API
      const detectedDish = await imageRecognitionService.identifyDish(imageBuffer);
      console.log("Google Vision API result:", detectedDish);
      
      if (!detectedDish) {
        console.log("No dish detected in the image");
        return res.status(404).json({ message: "Could not identify any dish in the image" });
      }
      
      try {
        // Use the detected dish name to search for recipes through Edamam API
        console.log("Searching for recipes for:", detectedDish);
        
        let recipes: any[] = [];
        
        try {
          // First try to get recipes from Edamam
          recipes = await recipeApiService.searchRecipeByName(detectedDish)
            .then(recipe => [recipe]) // Convert single recipe to array
            .catch(async (err) => {
              console.log("Error getting recipe from Edamam, trying by ingredients:", err);
              // If recipe search fails, try searching by the dish name as ingredient
              return await recipeApiService.getRecipesByIngredients([detectedDish]);
            });
          
          console.log(`Found ${recipes.length} recipes through Edamam API`);
        } catch (edamamError) {
          console.error("Edamam search failed:", edamamError);
          // If Edamam search fails, fall back to OpenAI recipe generation
          console.log("Falling back to OpenAI recipe generation");
        }
        
        // If we got recipes from Edamam, use the first one
        if (recipes && recipes.length > 0) {
          const recipe = recipes[0];
          console.log("Successfully found recipe with Edamam:", recipe.name);
          return res.json(recipe);
        }
        
        // If we get here, Edamam didn't return recipes, so fall back to OpenAI
        console.log("No Edamam recipes found, generating with OpenAI for:", detectedDish);
        
        // Generate recipe with OpenAI
        const openAIRecipeData = await imageRecognitionService.getRecipeAndNutrition(detectedDish);
        console.log("Generated recipe with OpenAI:", openAIRecipeData.name || detectedDish);
        
        // Convert OpenAI recipe to our format
        const recipe = {
          id: Math.floor(Math.random() * 10000) + 1000, // Generate a random ID
          name: openAIRecipeData.name || detectedDish,
          image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c", // Default food image
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
          console.log("Invalid recipe generated:", recipe);
          return res.status(404).json({ message: "Could not generate valid recipe for the identified dish" });
        }
        
        console.log("Successfully identified dish:", recipe.name, "with ID:", recipe.id);
        res.json(recipe);
      } catch (recipeError) {
        console.error("Error generating recipe:", recipeError);
        return res.status(500).json({ 
          message: `Error processing recipe data: ${recipeError instanceof Error ? recipeError.message : String(recipeError)}`
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
      
      // Identify ingredients using image recognition
      const ingredients = await imageRecognitionService.identifyIngredients(imageBuffer);
      
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
  
  // Identify ingredients from photo
  ingredientsRouter.post("/identify", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image uploaded" });
      }

      console.log("Processing image for ingredients identification...");
      console.log("Uploaded file info:", req.file.originalname, req.file.mimetype, req.file.size);
      
      // Get image buffer
      const imageBuffer = req.file.buffer;
      
      // Identify ingredients using image recognition
      const ingredients = await imageRecognitionService.identifyIngredients(imageBuffer);
      
      if (!ingredients || ingredients.length === 0) {
        return res.status(404).json({ message: "Could not identify any ingredients in the image" });
      }
      
      res.json(ingredients);
    } catch (error) {
      console.error("Error identifying ingredients:", error);
      res.status(500).json({ message: "Error processing image" });
    }
  });
  
  // Mount the ingredients router
  app.use("/api/ingredients", ingredientsRouter);

  const httpServer = createServer(app);
  
  return httpServer;
}
