import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { imageRecognitionService } from "./services/imageRecognition";
import { recipeApiService } from "./services/recipeApi";
import { EdamamRecipeApiService } from "./services/EdamamRecipeApiService";
import { openaiService } from "./services/openai";
import { requireAuth, getCurrentUserId, hashPassword, verifyPassword } from "./auth";
import multer from "multer";
import { z } from "zod";
import { ingredientsSearchSchema, chatMessageSchema, loginSchema, signupSchema } from "@shared/schema";
import { ZodError } from "zod";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

/** Generate an ID for OpenAI-generated recipes */
function generateOpenAIRecipeId(): string {
  return `generated_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Build a Recipe object from OpenAI data */
function buildOpenAIRecipe(openAIData: any, nameHint: string, idOverride?: string) {
  const id = idOverride ?? generateOpenAIRecipeId();
  return {
    id,
    name: openAIData.name || nameHint,
    image: openAIData.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
    readyInMinutes: openAIData.readyInMinutes || 30,
    servings: openAIData.servings || 4,
    sourceUrl: "",
    summary: openAIData.summary || `Recipe for ${nameHint}`,
    instructions: Array.isArray(openAIData.instructions)
      ? openAIData.instructions
      : typeof openAIData.instructions === "string"
        ? [openAIData.instructions]
        : ["No instructions available"],
    calories: openAIData.calories || 0,
    protein: openAIData.protein || "0g",
    carbs: openAIData.carbs || "0g",
    fat: openAIData.fat || "0g",
    diets: openAIData.diets || [],
    extendedIngredients: openAIData.extendedIngredients || [],
    analyzedInstructions:
      openAIData.analyzedInstructions?.length > 0
        ? openAIData.analyzedInstructions
        : [{
            name: "",
            steps: Array.isArray(openAIData.instructions)
              ? openAIData.instructions.map((step: string, idx: number) => ({
                  number: idx + 1, step, ingredients: [], equipment: []
                }))
              : [{ number: 1, step: "No detailed instructions available", ingredients: [], equipment: [] }]
          }],
    created_at: new Date(),
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.use("/api", express.json());

  // ─── Auth Routes ──────────────────────────────────────────────────────────

  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { username, password } = signupSchema.parse(req.body);
      const existing = await storage.getUserByUsername(username);
      if (existing) {
        return res.status(409).json({ message: "Username already taken" });
      }
      const hashed = await hashPassword(password);
      const user = await storage.createUser({ username, password: hashed });
      req.session.userId = user.id;
      req.session.username = user.username;
      res.status(201).json({ id: user.id, username: user.username });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid request", errors: error.errors });
      }
      console.error("Signup error:", error);
      res.status(500).json({ message: "Error creating account" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      const user = await storage.getUserByUsername(username);
      if (!user || !(await verifyPassword(password, user.password))) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      req.session.userId = user.id;
      req.session.username = user.username;
      res.json({ id: user.id, username: user.username });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid request", errors: error.errors });
      }
      console.error("Login error:", error);
      res.status(500).json({ message: "Error logging in" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out" });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json({ id: req.session.userId, username: req.session.username });
  });

  // ─── Subscription Routes ──────────────────────────────────────────────────

  app.get("/api/subscription", requireAuth, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      const sub = await storage.getSubscription(userId);
      if (!sub) {
        return res.json({ plan: "free", expiresAt: null });
      }
      // Check if pro subscription has expired
      const isExpired = sub.plan === "pro" && sub.expiresAt && sub.expiresAt < new Date();
      if (isExpired) {
        await storage.upsertSubscription(userId, "free");
        return res.json({ plan: "free", expiresAt: null });
      }
      res.json({ plan: sub.plan, expiresAt: sub.expiresAt });
    } catch (error) {
      console.error("Error fetching subscription:", error);
      res.status(500).json({ message: "Error fetching subscription" });
    }
  });

  app.post("/api/subscription/upgrade", requireAuth, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      // In a real app, process payment here (Stripe, etc.)
      // For now, just upgrade to pro for 30 days
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      const sub = await storage.upsertSubscription(userId, "pro", expiresAt);
      res.json({ plan: sub.plan, expiresAt: sub.expiresAt, message: "Upgraded to Pro!" });
    } catch (error) {
      console.error("Error upgrading subscription:", error);
      res.status(500).json({ message: "Error upgrading subscription" });
    }
  });

  // Helper: check if user is pro
  async function isProUser(userId: number): Promise<boolean> {
    if (!userId) return false;
    const sub = await storage.getSubscription(userId);
    if (!sub || sub.plan !== "pro") return false;
    if (sub.expiresAt && sub.expiresAt < new Date()) return false;
    return true;
  }

  // ─── Recipe Routes ─────────────────────────────────────────────────────────

  const recipesRouter = express.Router();

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

  // Get saved recipe IDs
  recipesRouter.get("/saved", requireAuth, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      const ids = await storage.getSavedRecipeIds(userId);

      // Hydrate recipes from cache
      const recipes = await Promise.all(
        ids.map(async (id) => {
          try {
            return await recipeApiService.getRecipeById(id);
          } catch {
            return null;
          }
        })
      );

      res.json(recipes.filter(Boolean));
    } catch (error) {
      console.error("Error fetching saved recipes:", error);
      res.status(500).json({ message: "Error fetching saved recipes" });
    }
  });

  // Search recipes by name
  recipesRouter.get("/search", async (req, res) => {
    try {
      const query = req.query.query as string;
      if (!query?.trim()) {
        return res.status(400).json({ message: "Search query is required" });
      }

      try {
        const recipe = await recipeApiService.searchRecipeByName(query);
        return res.json([recipe]);
      } catch {
        // Fall back to OpenAI
        const openAIData = await imageRecognitionService.getRecipeAndNutrition(query);
        if (!openAIData) {
          return res.status(404).json({ message: "Could not generate recipe for search query" });
        }
        const recipe = buildOpenAIRecipe(openAIData, query);
        if (recipeApiService instanceof EdamamRecipeApiService) {
          await recipeApiService.cacheRecipe(recipe);
        }
        return res.json([recipe]);
      }
    } catch (error) {
      console.error("Error searching recipes:", error);
      res.status(500).json({ message: "Error searching recipes" });
    }
  });

  // Get recipe details by string ID
  recipesRouter.get("/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const recipe = await recipeApiService.getRecipeById(id);
      return res.json(recipe);
    } catch (error) {
      // Try OpenAI fallback with name hint
      const dishName = req.query.name as string;
      if (dishName) {
        try {
          const openAIData = await imageRecognitionService.getRecipeAndNutrition(dishName);
          const recipe = buildOpenAIRecipe(openAIData, dishName, req.params.id);
          if (recipeApiService instanceof EdamamRecipeApiService) {
            await recipeApiService.cacheRecipe(recipe);
          }
          return res.json(recipe);
        } catch (aiError) {
          console.error("OpenAI fallback failed:", aiError);
        }
      }
      return res.status(404).json({ message: "Recipe not found" });
    }
  });

  // Get similar recipes
  recipesRouter.get("/:id/similar", async (req, res) => {
    try {
      const recipes = await recipeApiService.getSimilarRecipes(req.params.id);
      res.json(recipes);
    } catch (error) {
      console.error("Error fetching similar recipes:", error);
      res.status(500).json({ message: "Error fetching similar recipes" });
    }
  });

  // Identify dish from photo (free: 5/day, pro: unlimited)
  recipesRouter.post("/identify", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image uploaded" });
      }

      const userId = getCurrentUserId(req);

      // Rate limit for free users
      if (userId) {
        const pro = await isProUser(userId);
        if (!pro) {
          const count = await storage.getIdentifyCount(userId);
          if (count >= 5) {
            return res.status(429).json({
              message: "Daily limit reached. Upgrade to Pro for unlimited dish identification.",
              upgradeRequired: true,
            });
          }
          await storage.incrementIdentifyCount(userId);
        }
      }

      const imageBuffer = req.file.buffer;

      // Identify dish with OpenAI Vision
      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ message: "OpenAI API key not configured" });
      }

      const detectedDish = await imageRecognitionService.identifyDish(imageBuffer);
      if (!detectedDish) {
        return res.status(404).json({
          message: "Could not identify any dish in the image. Please try with a clearer food photo."
        });
      }

      // Try Edamam first
      if (process.env.EDAMAM_RECIPE_APP_ID && process.env.EDAMAM_RECIPE_APP_KEY) {
        try {
          let recipe;
          try {
            recipe = await recipeApiService.searchRecipeByName(detectedDish);
          } catch {
            const ingredientRecipes = await recipeApiService.getRecipesByIngredients([detectedDish]);
            if (ingredientRecipes?.length > 0) {
              recipe = ingredientRecipes[0];
            } else {
              throw new Error("No Edamam results");
            }
          }

          if (recipe) {
            if (recipeApiService instanceof EdamamRecipeApiService) {
              await recipeApiService.cacheRecipe(recipe);
            }
            return res.json(recipe);
          }
        } catch (edamamError) {
          console.warn("Edamam search failed, falling back to OpenAI:", edamamError);
        }
      }

      // Fall back to OpenAI recipe generation
      const openAIData = await imageRecognitionService.getRecipeAndNutrition(detectedDish);
      const recipe = buildOpenAIRecipe(openAIData, detectedDish);
      if (recipeApiService instanceof EdamamRecipeApiService) {
        await recipeApiService.cacheRecipe(recipe);
      }
      return res.json(recipe);
    } catch (error) {
      console.error("Error in dish identification:", error);
      res.status(500).json({
        message: "Error processing image",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Get recipes by ingredients
  recipesRouter.post("/by-ingredients", async (req, res) => {
    try {
      const { ingredients } = ingredientsSearchSchema.parse(req.body);
      if (!ingredients?.length) {
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

  // Save recipe
  recipesRouter.post("/:id/save", requireAuth, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      await storage.saveRecipe(userId, req.params.id);
      res.json({ message: "Recipe saved" });
    } catch (error) {
      console.error("Error saving recipe:", error);
      res.status(500).json({ message: "Error saving recipe" });
    }
  });

  // Remove saved recipe
  recipesRouter.delete("/:id/save", requireAuth, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      await storage.removeSavedRecipe(userId, req.params.id);
      res.json({ message: "Recipe removed from saved" });
    } catch (error) {
      console.error("Error removing saved recipe:", error);
      res.status(500).json({ message: "Error removing saved recipe" });
    }
  });

  app.use("/api/recipes", recipesRouter);

  // ─── Chat Routes ──────────────────────────────────────────────────────────

  const chatRouter = express.Router();

  chatRouter.post("/", requireAuth, async (req, res) => {
    try {
      const { message, recipeId } = chatMessageSchema.parse(req.body);
      const userId = getCurrentUserId(req);

      // Nutrition analysis is a pro feature
      const isPro = await isProUser(userId);
      const isNutritionQuery = /nutri|calor|macro|protein|carb|fat|vitamin/i.test(message);
      if (isNutritionQuery && !isPro) {
        return res.status(403).json({
          message: "Nutrition analysis requires a Pro subscription.",
          upgradeRequired: true,
        });
      }

      let recipeContext = null;
      if (recipeId) {
        try {
          recipeContext = await recipeApiService.getRecipeById(recipeId);
        } catch {
          // Context unavailable, proceed without it
        }
      }

      const chatHistory = await storage.getChatHistory(userId);
      const aiResponse = await openaiService.generateChatResponse(message, chatHistory, recipeContext);

      await storage.addChatMessage(userId, { role: "user", content: message, timestamp: Date.now() });
      const responseMessage = { role: "assistant" as const, content: aiResponse, timestamp: Date.now() };
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

  chatRouter.get("/history", requireAuth, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      const chatHistory = await storage.getChatHistory(userId);
      res.json(chatHistory);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      res.status(500).json({ message: "Error fetching chat history" });
    }
  });

  chatRouter.delete("/history", requireAuth, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      await storage.clearChatHistory(userId);
      res.json({ message: "Chat history cleared" });
    } catch (error) {
      console.error("Error clearing chat history:", error);
      res.status(500).json({ message: "Error clearing chat history" });
    }
  });

  app.use("/api/chat", chatRouter);

  // ─── Ingredient Routes ────────────────────────────────────────────────────

  const ingredientsRouter = express.Router();

  // Nutrition analysis (pro only)
  ingredientsRouter.post("/analyze", requireAuth, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      const isPro = await isProUser(userId);
      if (!isPro) {
        return res.status(403).json({
          message: "Nutrition analysis requires a Pro subscription.",
          upgradeRequired: true,
        });
      }

      const { ingredients } = req.body;
      if (!Array.isArray(ingredients) || ingredients.length === 0) {
        return res.status(400).json({ message: "No ingredients provided" });
      }

      const { nutritionService } = await import('./services/OpenAINutritionService');
      if (!nutritionService) {
        return res.status(500).json({ message: "Nutrition service not available" });
      }
      const nutritionInfo = await nutritionService.analyzeIngredients(ingredients);
      res.json(nutritionInfo);
    } catch (error) {
      console.error("Error analyzing nutrition:", error);
      res.status(500).json({ message: "Error analyzing nutrition information" });
    }
  });

  // Meal plan generation (pro only)
  ingredientsRouter.post("/mealplan", requireAuth, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      const isPro = await isProUser(userId);
      if (!isPro) {
        return res.status(403).json({
          message: "Meal plan generation requires a Pro subscription.",
          upgradeRequired: true,
        });
      }

      const { nutritionService } = await import('./services/OpenAINutritionService');
      if (!nutritionService) {
        return res.status(500).json({ message: "Nutrition service not available" });
      }
      const mealPlan = await nutritionService.generateMealPlan(req.body);
      res.json(mealPlan);
    } catch (error) {
      console.error("Error generating meal plan:", error);
      res.status(500).json({ message: "Error generating meal plan" });
    }
  });

  ingredientsRouter.post("/identify", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image uploaded" });
      }
      const ingredients = await imageRecognitionService.identifyIngredients(req.file.buffer);
      if (!ingredients?.length) {
        return res.status(404).json({ message: "Could not identify any ingredients in the image" });
      }
      res.json(ingredients);
    } catch (error) {
      console.error("Error identifying ingredients:", error);
      res.status(500).json({ message: "Error processing image for ingredients" });
    }
  });

  // Legacy endpoint kept for compatibility
  app.post("/api/ingredients/identify", upload.single("image"), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No image uploaded" });
    try {
      const ingredients = await imageRecognitionService.identifyIngredients(req.file.buffer);
      res.json(ingredients ?? []);
    } catch (error) {
      res.status(500).json({ message: "Error processing image" });
    }
  });

  app.use("/api/ingredients", ingredientsRouter);

  const httpServer = createServer(app);
  return httpServer;
}
