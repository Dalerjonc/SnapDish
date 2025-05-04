/**
 * Service for OpenAI integration
 * Provides chat functionality for cooking assistance
 */
import { ChatMessage } from "@shared/schema";
import OpenAI from "openai";

interface OpenAIService {
  generateChatResponse(
    userMessage: string,
    chatHistory: ChatMessage[],
    recipeContext?: any
  ): Promise<string>;
}

class MockOpenAIService implements OpenAIService {
  private readonly cookingResponses = [
    "You can substitute canned tomatoes with fresh ones. Use about 6-8 medium ripe tomatoes, blanch them to remove skins, and cook them slightly longer to reduce the water content.",
    "To make this recipe spicy, you can add 1-2 teaspoons of red pepper flakes or a diced jalapeño. Add them when sautéing the garlic for best flavor distribution.",
    "For a vegetarian version, try replacing the meat with mushrooms, tofu, or lentils. These will provide a similar texture and are great protein sources.",
    "A low-carb alternative would be to use zucchini noodles or spaghetti squash instead of pasta. The sauce works perfectly with these alternatives!",
    "For wine pairing, this dish would go well with a medium-bodied red wine like Chianti or Sangiovese. The acidity in these wines complements the tomato sauce.",
    "To make this creamier, you could add 1/4 cup of heavy cream or 2 tablespoons of cream cheese to the sauce just before serving. Stir until fully incorporated.",
    "For meal prep, you can make this sauce ahead of time and store it in the refrigerator for up to 3 days or freeze it for up to 3 months.",
    "To enhance the flavor, try adding a Parmesan rind to the sauce while it simmers. Remove it before serving - it adds amazing depth to the sauce!",
    "If you don't have fresh basil, you can use 1 teaspoon of dried basil instead. Add it earlier in the cooking process so it has time to release its flavors.",
    "For a healthier version, use whole wheat pasta and add extra vegetables like diced bell peppers, zucchini, or spinach to the sauce."
  ];

  async generateChatResponse(
    userMessage: string,
    chatHistory: ChatMessage[],
    recipeContext?: any
  ): Promise<string> {
    // For this mock implementation, return a random cooking-related response
    const randomIndex = Math.floor(Math.random() * this.cookingResponses.length);
    
    // If there's recipe context, make the response more specific
    if (recipeContext) {
      return `For the ${recipeContext.name} recipe: ${this.cookingResponses[randomIndex]}`;
    }
    
    return this.cookingResponses[randomIndex];
  }
}

class RealOpenAIService implements OpenAIService {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async generateChatResponse(
    userMessage: string,
    chatHistory: ChatMessage[],
    recipeContext?: any
  ): Promise<string> {
    try {
      // Format chat history for OpenAI API
      const formattedHistory = chatHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Prepare system message
      let systemMessage = "You are a helpful cooking assistant that provides advice about recipes, cooking techniques, ingredient substitutions, and other food-related questions. Keep responses concise but informative.";
      
      if (recipeContext) {
        // Add recipe context to the system message if available
        systemMessage += ` The user is currently viewing a recipe for ${recipeContext.name}. Here are the ingredients and instructions for reference: 
        Ingredients: ${recipeContext.extendedIngredients.map((i: any) => i.original).join(", ")}
        Cooking time: ${recipeContext.readyInMinutes} minutes
        Servings: ${recipeContext.servings}`;
      }

      // Make the API request
      const response = await this.client.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: systemMessage },
          ...formattedHistory,
          { role: "user", content: userMessage }
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      return response.choices[0].message.content || "I'm not sure how to answer that. Could you try rephrasing your question?";
    } catch (error) {
      console.error("OpenAI API error:", error);
      return "Sorry, I'm having trouble connecting to my cooking knowledge database. Please try again later.";
    }
  }
}

// Determine which service to use based on whether API key is available
const apiKey = process.env.OPENAI_API_KEY;

// Export the appropriate service
export const openaiService: OpenAIService = apiKey 
  ? new RealOpenAIService(apiKey) 
  : new MockOpenAIService();
