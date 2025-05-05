import { pgTable, text, serial, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model from original schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Recipe model
export const recipes = pgTable("recipes", {
  id: serial("id").primaryKey(),
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

// SavedRecipe model to track user's saved recipes
export const savedRecipes = pgTable("saved_recipes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  recipeId: integer("recipe_id").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const insertSavedRecipeSchema = createInsertSchema(savedRecipes).omit({
  id: true,
  created_at: true,
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

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Recipe = typeof recipes.$inferSelect;
export type InsertRecipe = z.infer<typeof insertRecipeSchema>;
export type SavedRecipe = typeof savedRecipes.$inferSelect;
export type InsertSavedRecipe = z.infer<typeof insertSavedRecipeSchema>;
export type Chat = typeof chats.$inferSelect;
export type InsertChat = z.infer<typeof insertChatSchema>;

// API response schemas
export const imageUploadSchema = z.object({
  image: z.instanceof(File),
});

export const ingredientsSearchSchema = z.object({
  ingredients: z.array(z.string()),
});

export const chatMessageSchema = z.object({
  message: z.string(),
  recipeId: z.number().optional(),
});
