import { pgTable, text, serial, integer, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(), // bcrypt hash
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Recipe model
export const recipes = pgTable("recipes", {
  id: serial("id").primaryKey(), // For database storage
  name: text("name").notNull(),
  image: text("image"),
  readyInMinutes: integer("ready_in_minutes"),
  servings: integer("servings"),
  sourceUrl: text("source_url"),
  summary: text("summary"),
  instructions: jsonb("instructions").$type<string[] | string>(),
  calories: integer("calories"),
  protein: text("protein"),
  carbs: text("carbs"),
  fat: text("fat"),
  diets: jsonb("diets").$type<string[]>(),
  extendedIngredients: jsonb("extended_ingredients").$type<Ingredient[]>(),
  analyzedInstructions: jsonb("analyzed_instructions").$type<AnalyzedInstruction[]>(),
  created_at: timestamp("created_at").defaultNow(),
});

export const insertRecipeSchema = createInsertSchema(recipes).omit({
  id: true,
  created_at: true,
});

// Ingredient model (for recipes)
export type Ingredient = {
  id: number;
  name: string;
  amount: number;
  unit: string;
  original: string;
};

// AnalyzedInstruction for step-by-step cooking instructions
export type AnalyzedInstruction = {
  name: string;
  steps: {
    number: number;
    step: string;
    ingredients?: { id: number; name: string; image: string }[];
    equipment?: { id: number; name: string; image: string }[];
  }[];
};

// SavedRecipe model — stores external string IDs (e.g. Edamam "recipe_xxx")
export const savedRecipes = pgTable("saved_recipes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  recipeId: text("recipe_id").notNull(), // String ID to support Edamam "recipe_xxx" format
  created_at: timestamp("created_at").defaultNow(),
});

export const insertSavedRecipeSchema = createInsertSchema(savedRecipes).omit({
  id: true,
  created_at: true,
});

// CachedRecipe — persists in-memory recipe cache to the database
export const cachedRecipes = pgTable("cached_recipes", {
  id: serial("id").primaryKey(),
  externalId: text("external_id").notNull().unique(), // Edamam "recipe_xxx" or generated ID
  data: jsonb("data").$type<RecipeData>().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Subscription model
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  plan: text("plan").notNull().default("free"), // "free" | "pro"
  expiresAt: timestamp("expires_at"), // null = free tier (no expiry), or pro expiry date
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Chat model to store user-AI chat history
export const chats = pgTable("chats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  messages: jsonb("messages").$type<ChatMessage[]>(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
};

export const insertChatSchema = createInsertSchema(chats).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// RecipeData type used in cachedRecipes
export type RecipeData = {
  id: string;
  name: string;
  image?: string | null;
  readyInMinutes?: number | null;
  servings?: number | null;
  sourceUrl?: string | null;
  summary?: string | null;
  instructions?: string[] | string | null;
  calories?: number | null;
  protein?: string | null;
  carbs?: string | null;
  fat?: string | null;
  diets?: string[] | null;
  extendedIngredients?: Ingredient[] | null;
  analyzedInstructions?: AnalyzedInstruction[] | null;
  created_at?: string | Date | null;
};

// Recipe type used in API responses — id is always a string
export type Recipe = RecipeData;

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type SavedRecipe = typeof savedRecipes.$inferSelect;
export type InsertSavedRecipe = z.infer<typeof insertSavedRecipeSchema>;
export type Chat = typeof chats.$inferSelect;
export type InsertChat = z.infer<typeof insertChatSchema>;
export type Subscription = typeof subscriptions.$inferSelect;

// API request/response schemas
export const imageUploadSchema = z.object({
  image: z.instanceof(File),
});

export const ingredientsSearchSchema = z.object({
  ingredients: z.array(z.string()),
});

export const chatMessageSchema = z.object({
  message: z.string(),
  recipeId: z.string().optional(), // String recipe ID
});

export const loginSchema = z.object({
  username: z.string().min(2),
  password: z.string().min(6),
});

export const signupSchema = z.object({
  username: z.string().min(2),
  password: z.string().min(6),
});
