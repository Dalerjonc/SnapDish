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
  
  // Popular and quick recipes (home screen)
  app.get("/api/recipes/popular", async (req, res) => {
    try {
      const recipes = await recipeApiService.getPopularRecipes();
      res.json(recipes);
    } catch (error) {
      console.error("Error fetching popular recipes:", error);
      res.status(500).json({ message: "Error fetching popular recipes" });
    }
  });

  app.get("/api/recipes/quick", async (req, res) => {
    try {
      const recipes = await recipeApiService.getQuickRecipes();
      res.json(recipes);
    } catch (error) {
      console.error("Error fetching quick recipes:", error);
      res.status(500).json({ message: "Error fetching quick recipes" });
    }
  });

  // Get recipe details
  app.get("/api/recipes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid recipe ID" });
      }

      const recipe = await recipeApiService.getRecipeById(id);
      res.json(recipe);
    } catch (error) {
      console.error("Error fetching recipe:", error);
      res.status(500).json({ message: "Error fetching recipe details" });
    }
  });

  // Get similar recipes
  app.get("/api/recipes/:id/similar", async (req, res) => {
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
  app.post("/api/recipes/identify", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image uploaded" });
      }

      console.log("Processing image for dish identification...");
      console.log("Uploaded file info:", req.file.originalname, req.file.mimetype, req.file.size);
      
      // Get image buffer
      const imageBuffer = req.file.buffer;
      
      // Identify the dish using image recognition
      const detectedDish = await imageRecognitionService.identifyDish(imageBuffer);
      console.log("Image recognition result:", detectedDish);
      
      if (!detectedDish) {
        console.log("No dish detected in the image");
        return res.status(404).json({ message: "Could not identify any dish in the image" });
      }
      
      try {
        // First try to find recipe in our database
        let recipe;
        
        try {
          console.log("Trying to find recipe in database:", detectedDish);
          recipe = await recipeApiService.searchRecipeByName(detectedDish);
          console.log("Found recipe in database:", recipe.name);
        } catch (dbError) {
          console.log("Recipe not found in database, generating with OpenAI...");
          
          // If not found in database, generate recipe with OpenAI
          const openAIRecipeData = await imageRecognitionService.getRecipeAndNutrition(detectedDish);
          console.log("Generated recipe with OpenAI:", openAIRecipeData.name);
          
          // Convert OpenAI recipe to our format
          recipe = {
            id: Math.floor(Math.random() * 10000) + 1000, // Generate a random ID
            name: openAIRecipeData.name || detectedDish,
            image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c", // Default food image
            readyInMinutes: openAIRecipeData.readyInMinutes || 30,
            servings: openAIRecipeData.servings || 4,
            sourceUrl: "",
            summary: openAIRecipeData.summary || `Recipe for ${detectedDish}`,
            instructions: openAIRecipeData.instructions || "No instructions available",
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
        }
        
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
  app.post("/api/recipes/by-ingredients", async (req, res) => {
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
  app.post("/api/recipes/:id/save", async (req, res) => {
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
  app.delete("/api/recipes/:id/save", async (req, res) => {
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

  // Get saved recipes
  app.get("/api/recipes/saved", async (req, res) => {
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

  // Chat with AI
  app.post("/api/chat", async (req, res) => {
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
  app.get("/api/chat/history", async (req, res) => {
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

  const httpServer = createServer(app);
  
  return httpServer;
}
