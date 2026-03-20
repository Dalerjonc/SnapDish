/**
 * Storage layer — wraps database access for users, recipes, chat, subscriptions, and cached recipes.
 */
import { eq, and } from "drizzle-orm";
import { db } from "./db";
import {
  users,
  savedRecipes,
  chats,
  cachedRecipes,
  subscriptions,
  type User,
  type Recipe,
  type ChatMessage,
  type RecipeData,
  type Subscription,
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  getUserByAppleId(appleId: string): Promise<User | undefined>;
  createUser(user: { username: string; password?: string; email?: string; googleId?: string; appleId?: string }): Promise<User>;
  updateUser(id: number, data: Partial<{ googleId: string; appleId: string; email: string }>): Promise<User>;

  // Recipe save/unsave
  saveRecipe(userId: number, recipeId: string): Promise<void>;
  removeSavedRecipe(userId: number, recipeId: string): Promise<void>;
  getSavedRecipeIds(userId: number): Promise<string[]>;

  // Chat history
  addChatMessage(userId: number, message: ChatMessage): Promise<void>;
  getChatHistory(userId: number): Promise<ChatMessage[]>;
  clearChatHistory(userId: number): Promise<void>;

  // Recipe cache (DB-backed)
  getCachedRecipe(externalId: string): Promise<Recipe | null>;
  setCachedRecipe(recipe: Recipe): Promise<void>;

  // Subscriptions
  getSubscription(userId: number): Promise<Subscription | null>;
  upsertSubscription(userId: number, plan: "free" | "pro", expiresAt?: Date): Promise<Subscription>;

  // Daily identification count (for free-tier rate limiting)
  incrementIdentifyCount(userId: number): Promise<number>;
  getIdentifyCount(userId: number): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  // ─── Users ───────────────────────────────────────────────────────────────

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user;
  }

  async getUserByAppleId(appleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.appleId, appleId));
    return user;
  }

  async createUser(data: { username: string; password?: string; email?: string; googleId?: string; appleId?: string }): Promise<User> {
    const [user] = await db.insert(users).values({
      username: data.username,
      password: data.password ?? "",
      email: data.email,
      googleId: data.googleId,
      appleId: data.appleId,
    }).returning();
    return user;
  }

  async updateUser(id: number, data: Partial<{ googleId: string; appleId: string; email: string }>): Promise<User> {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user;
  }

  // ─── Saved Recipes ───────────────────────────────────────────────────────

  async saveRecipe(userId: number, recipeId: string): Promise<void> {
    // Upsert — ignore duplicates
    await db
      .insert(savedRecipes)
      .values({ userId, recipeId })
      .onConflictDoNothing();
  }

  async removeSavedRecipe(userId: number, recipeId: string): Promise<void> {
    await db
      .delete(savedRecipes)
      .where(and(eq(savedRecipes.userId, userId), eq(savedRecipes.recipeId, recipeId)));
  }

  async getSavedRecipeIds(userId: number): Promise<string[]> {
    const rows = await db
      .select({ recipeId: savedRecipes.recipeId })
      .from(savedRecipes)
      .where(eq(savedRecipes.userId, userId));
    return rows.map((r) => r.recipeId);
  }

  // ─── Chat History ─────────────────────────────────────────────────────────

  async addChatMessage(userId: number, message: ChatMessage): Promise<void> {
    const existing = await db
      .select()
      .from(chats)
      .where(eq(chats.userId, userId))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(chats).values({
        userId,
        messages: [message],
      });
    } else {
      const current = existing[0].messages ?? [];
      await db
        .update(chats)
        .set({ messages: [...current, message], updated_at: new Date() })
        .where(eq(chats.userId, userId));
    }
  }

  async getChatHistory(userId: number): Promise<ChatMessage[]> {
    const [chat] = await db
      .select()
      .from(chats)
      .where(eq(chats.userId, userId));
    return chat?.messages ?? [];
  }

  async clearChatHistory(userId: number): Promise<void> {
    await db.delete(chats).where(eq(chats.userId, userId));
  }

  // ─── Recipe Cache ─────────────────────────────────────────────────────────

  async getCachedRecipe(externalId: string): Promise<Recipe | null> {
    const [row] = await db
      .select()
      .from(cachedRecipes)
      .where(eq(cachedRecipes.externalId, externalId));
    if (!row) return null;
    return row.data as Recipe;
  }

  async setCachedRecipe(recipe: Recipe): Promise<void> {
    const externalId = String(recipe.id);
    const data: RecipeData = {
      id: externalId,
      name: recipe.name,
      image: recipe.image,
      readyInMinutes: recipe.readyInMinutes,
      servings: recipe.servings,
      sourceUrl: recipe.sourceUrl,
      summary: recipe.summary,
      instructions: recipe.instructions,
      calories: recipe.calories,
      protein: recipe.protein,
      carbs: recipe.carbs,
      fat: recipe.fat,
      diets: recipe.diets,
      extendedIngredients: recipe.extendedIngredients,
      analyzedInstructions: recipe.analyzedInstructions,
      created_at: new Date().toISOString(),
    };
    await db
      .insert(cachedRecipes)
      .values({ externalId, data })
      .onConflictDoUpdate({
        target: cachedRecipes.externalId,
        set: { data, updatedAt: new Date() },
      });
  }

  // ─── Subscriptions ────────────────────────────────────────────────────────

  async getSubscription(userId: number): Promise<Subscription | null> {
    const [sub] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId));
    return sub ?? null;
  }

  async upsertSubscription(
    userId: number,
    plan: "free" | "pro",
    expiresAt?: Date
  ): Promise<Subscription> {
    const [sub] = await db
      .insert(subscriptions)
      .values({ userId, plan, expiresAt: expiresAt ?? null })
      .onConflictDoUpdate({
        target: subscriptions.userId,
        set: { plan, expiresAt: expiresAt ?? null, updatedAt: new Date() },
      })
      .returning();
    return sub;
  }

  // ─── Rate Limiting (identify count) ──────────────────────────────────────
  // Simple in-memory store for daily identification counts.
  // Keyed by `userId:YYYY-MM-DD`.
  private identifyCounts: Map<string, number> = new Map();

  private identifyKey(userId: number): string {
    const today = new Date().toISOString().slice(0, 10);
    return `${userId}:${today}`;
  }

  async incrementIdentifyCount(userId: number): Promise<number> {
    const key = this.identifyKey(userId);
    const current = (this.identifyCounts.get(key) ?? 0) + 1;
    this.identifyCounts.set(key, current);
    return current;
  }

  async getIdentifyCount(userId: number): Promise<number> {
    const key = this.identifyKey(userId);
    return this.identifyCounts.get(key) ?? 0;
  }
}

export const storage = new DatabaseStorage();
