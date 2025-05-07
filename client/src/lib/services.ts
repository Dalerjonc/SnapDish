import { apiRequest } from "./queryClient";
import { Recipe, ChatMessage } from "@shared/schema";

// API service for recipe-related operations
export const recipeService = {
  async identifyDish(imageFile: File): Promise<Recipe> {
    console.log("Starting dish identification with image file:", imageFile.name, imageFile.type, imageFile.size);
    const formData = new FormData();
    formData.append("image", imageFile);

    try {
      const response = await fetch("/api/recipes/identify", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      console.log("Dish identification response status:", response.status);

      if (!response.ok) {
        let errorMessage = "Failed to identify dish";
        try {
          const errorData = await response.json();
          console.error("Error response from server:", errorData);
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          // If cannot parse as JSON, get the text
          const errorText = await response.text();
          console.error("Error response text:", errorText);
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Identified recipe data:", data);
      
      // Validate that we have a proper recipe object
      if (!data || !data.id || !data.name) {
        console.error("Invalid recipe data:", data);
        throw new Error("Received invalid recipe data from server");
      }
      
      return data;
    } catch (error) {
      console.error("Error in identifyDish service:", error);
      throw error;
    }
  },

  async getRecipesByIngredients(ingredients: string[]): Promise<Recipe[]> {
    console.log("Searching for recipes with ingredients:", ingredients);
    
    try {
      const response = await apiRequest("POST", "/api/recipes/by-ingredients", {
        ingredients,
      });
      
      const data = await response.json();
      console.log("Recipe search results:", data);
      
      // Handle both array and single object responses
      return Array.isArray(data) ? data : [data];
    } catch (error) {
      console.error("Error in getRecipesByIngredients:", error);
      throw error;
    }
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
