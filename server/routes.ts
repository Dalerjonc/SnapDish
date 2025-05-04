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

      // Get image buffer
      const imageBuffer = req.file.buffer;
      
      // Identify the dish using image recognition
      const detectedDish = await imageRecognitionService.identifyDish(imageBuffer);
      
      if (!detectedDish) {
        return res.status(404).json({ message: "Could not identify any dish in the image" });
      }
      
      // Get recipe details based on the identified dish
      const recipe = await recipeApiService.searchRecipeByName(detectedDish);
      
      res.json(recipe);
    } catch (error) {
      console.error("Error identifying dish:", error);
      res.status(500).json({ message: "Error processing image" });
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
