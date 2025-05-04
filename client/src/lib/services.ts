import { apiRequest } from "./queryClient";
import { Recipe, ChatMessage } from "@shared/schema";

// API service for recipe-related operations
export const recipeService = {
  async identifyDish(imageFile: File): Promise<Recipe> {
    const formData = new FormData();
    formData.append("image", imageFile);

    const response = await fetch("/api/recipes/identify", {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to identify dish");
    }

    return response.json();
  },

  async getRecipesByIngredients(ingredients: string[]): Promise<Recipe[]> {
    const response = await apiRequest("POST", "/api/recipes/by-ingredients", {
      ingredients,
    });
    return response.json();
  },

  async saveRecipe(recipeId: number): Promise<void> {
    await apiRequest("POST", `/api/recipes/${recipeId}/save`, {});
  },

  async unsaveRecipe(recipeId: number): Promise<void> {
    await apiRequest("DELETE", `/api/recipes/${recipeId}/save`, {});
  },

  async getSavedRecipes(): Promise<Recipe[]> {
    const response = await fetch("/api/recipes/saved", {
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch saved recipes");
    }
    return response.json();
  },
};

// API service for image recognition operations
export const imageService = {
  async identifyIngredients(imageFile: File): Promise<string[]> {
    const formData = new FormData();
    formData.append("image", imageFile);

    const response = await fetch("/api/ingredients/identify", {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to identify ingredients");
    }

    return response.json();
  },
};

// API service for chat assistant operations
export const chatService = {
  async sendMessage(message: string, recipeId?: number): Promise<ChatMessage> {
    const response = await apiRequest("POST", "/api/chat", {
      message,
      recipeId,
    });
    return response.json();
  },

  async getChatHistory(): Promise<ChatMessage[]> {
    const response = await fetch("/api/chat/history", {
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch chat history");
    }
    return response.json();
  },
};
