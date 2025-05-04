import { Recipe, ChatMessage, SavedRecipe } from "@shared/schema";
import { recipeApiService } from "./services/recipeApi";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User methods (from original interface)
  getUser(id: number): Promise<any | undefined>;
  getUserByUsername(username: string): Promise<any | undefined>;
  createUser(user: any): Promise<any>;
  
  // Recipe methods
  saveRecipe(userId: number, recipeId: number): Promise<void>;
  removeSavedRecipe(userId: number, recipeId: number): Promise<void>;
  getSavedRecipes(userId: number): Promise<Recipe[]>;
  
  // Chat methods
  addChatMessage(userId: number, message: ChatMessage): Promise<void>;
  getChatHistory(userId: number): Promise<ChatMessage[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, any>;
  private savedRecipes: Map<number, Set<number>>;
  private chatHistory: Map<number, ChatMessage[]>;
  
  currentId: number;

  constructor() {
    this.users = new Map();
    this.savedRecipes = new Map();
    this.chatHistory = new Map();
    this.currentId = 1;
  }

  async getUser(id: number): Promise<any | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<any | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: any): Promise<any> {
    const id = this.currentId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async saveRecipe(userId: number, recipeId: number): Promise<void> {
    if (!this.savedRecipes.has(userId)) {
      this.savedRecipes.set(userId, new Set());
    }
    
    this.savedRecipes.get(userId)!.add(recipeId);
  }
  
  async removeSavedRecipe(userId: number, recipeId: number): Promise<void> {
    if (this.savedRecipes.has(userId)) {
      this.savedRecipes.get(userId)!.delete(recipeId);
    }
  }
  
  async getSavedRecipes(userId: number): Promise<Recipe[]> {
    if (!this.savedRecipes.has(userId)) {
      return [];
    }
    
    const recipeIds = Array.from(this.savedRecipes.get(userId)!);
    
    // Fetch recipe details for each saved recipe ID
    const recipePromises = recipeIds.map(id => recipeApiService.getRecipeById(id));
    const recipes = await Promise.all(recipePromises);
    
    return recipes;
  }
  
  async addChatMessage(userId: number, message: ChatMessage): Promise<void> {
    if (!this.chatHistory.has(userId)) {
      this.chatHistory.set(userId, []);
    }
    
    this.chatHistory.get(userId)!.push(message);
  }
  
  async getChatHistory(userId: number): Promise<ChatMessage[]> {
    if (!this.chatHistory.has(userId)) {
      return [];
    }
    
    return this.chatHistory.get(userId)!;
  }
}

export const storage = new MemStorage();
