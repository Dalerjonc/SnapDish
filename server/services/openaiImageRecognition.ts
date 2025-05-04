/**
 * Service for image recognition
 * Using OpenAI Vision API to identify dishes and ingredients from images
 */
import OpenAI from "openai";
import type { ImageRecognitionService } from "./imageRecognition";

// Check if OpenAI API key is available
const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey }) : null;

export class OpenAIVisionImageRecognitionService implements ImageRecognitionService {
  async identifyDish(imageBuffer: Buffer): Promise<string | null> {
    try {
      if (!openai) {
        throw new Error("OpenAI API key not configured");
      }

      console.log("Analyzing image with OpenAI Vision API");
      
      // Convert buffer to base64
      const base64Image = imageBuffer.toString('base64');
      
      // Determine MIME type based on signature
      // Simple check for common image formats
      let contentType = "image/jpeg"; // Default
      
      // Check for file signatures to determine type
      if (imageBuffer.length > 2) {
        const firstBytes = imageBuffer.slice(0, 4);
        
        // Check PNG signature (89 50 4E 47)
        if (firstBytes[0] === 0x89 && firstBytes[1] === 0x50 && 
            firstBytes[2] === 0x4E && firstBytes[3] === 0x47) {
          contentType = "image/png";
        }
        // Check JPEG signature (FF D8)
        else if (firstBytes[0] === 0xFF && firstBytes[1] === 0xD8) {
          contentType = "image/jpeg";
        }
        // Check GIF signature (47 49 46)
        else if (firstBytes[0] === 0x47 && firstBytes[1] === 0x49 && 
                firstBytes[2] === 0x46) {
          contentType = "image/gif";
        }
        // Check WebP signature (52 49 46 46 ... 57 45 42 50)
        // WebP files start with "RIFF" and contain "WEBP" at position 8
        else if (imageBuffer.length > 12 && 
                firstBytes[0] === 0x52 && firstBytes[1] === 0x49 && 
                firstBytes[2] === 0x46 && firstBytes[3] === 0x46 &&
                imageBuffer[8] === 0x57 && imageBuffer[9] === 0x45 && 
                imageBuffer[10] === 0x42 && imageBuffer[11] === 0x50) {
          contentType = "image/webp";
        }
      }
      
      console.log("Detected content type:", contentType);
      
      // Call OpenAI Vision API
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a food recognition AI. Identify the main dish in the image. Respond with ONLY the dish name, no explanation or additional text. Be specific (e.g., 'Beef Tacos' not just 'Tacos')."
          },
          {
            role: "user",
            content: [
              { type: "text", text: "What is this dish?" },
              {
                type: "image_url",
                image_url: {
                  url: `data:${contentType};base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 100
      });
      
      // Extract the dish name from response
      const dishName = response.choices[0].message.content?.trim();
      
      if (!dishName) {
        console.log("No dish detected in the image");
        return null;
      }
      
      console.log("OpenAI identified dish:", dishName);
      return dishName;
    } catch (error) {
      console.error("Error identifying dish with OpenAI:", error);
      return null;
    }
  }
  
  async getRecipeAndNutrition(dishName: string): Promise<any> {
    try {
      if (!openai) {
        throw new Error("OpenAI API key not configured");
      }

      console.log("Getting recipe and nutrition for:", dishName);
      
      // Call OpenAI API for recipe and nutrition information
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are a culinary and nutrition expert. Provide detailed recipe and nutrition information for the specified dish in JSON format. Include the following fields:
            - name: The dish name
            - summary: A short description of the dish and its origin
            - readyInMinutes: Estimated preparation time in minutes
            - servings: Number of servings the recipe makes
            - calories: Calories per serving
            - protein: Protein content per serving in grams
            - carbs: Carbohydrate content per serving in grams
            - fat: Fat content per serving in grams
            - instructions: Step-by-step cooking instructions
            - extendedIngredients: Array of ingredients with name, amount, and unit
            - analyzedInstructions: Structured cooking steps with equipment and ingredients used in each step
            
            Format the response as a valid JSON object with these fields.`
          },
          {
            role: "user",
            content: `Provide detailed recipe and nutrition information for: ${dishName}`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1500
      });
      
      // Parse the JSON response
      const recipeData = JSON.parse(response.choices[0].message.content || "{}");
      
      console.log("Generated recipe and nutrition data for:", dishName);
      return recipeData;
    } catch (error) {
      console.error("Error getting recipe and nutrition with OpenAI:", error);
      throw error;
    }
  }

  async identifyIngredients(imageBuffer: Buffer): Promise<string[]> {
    try {
      if (!openai) {
        throw new Error("OpenAI API key not configured");
      }

      console.log("Analyzing image for ingredients with OpenAI Vision API");
      
      // Convert buffer to base64
      const base64Image = imageBuffer.toString('base64');
      
      // Determine MIME type based on signature
      // Simple check for common image formats
      let contentType = "image/jpeg"; // Default
      
      // Check for file signatures to determine type
      if (imageBuffer.length > 2) {
        const firstBytes = imageBuffer.slice(0, 4);
        
        // Check PNG signature (89 50 4E 47)
        if (firstBytes[0] === 0x89 && firstBytes[1] === 0x50 && 
            firstBytes[2] === 0x4E && firstBytes[3] === 0x47) {
          contentType = "image/png";
        }
        // Check JPEG signature (FF D8)
        else if (firstBytes[0] === 0xFF && firstBytes[1] === 0xD8) {
          contentType = "image/jpeg";
        }
        // Check GIF signature (47 49 46)
        else if (firstBytes[0] === 0x47 && firstBytes[1] === 0x49 && 
                firstBytes[2] === 0x46) {
          contentType = "image/gif";
        }
        // Check WebP signature (52 49 46 46 ... 57 45 42 50)
        // WebP files start with "RIFF" and contain "WEBP" at position 8
        else if (imageBuffer.length > 12 && 
                firstBytes[0] === 0x52 && firstBytes[1] === 0x49 && 
                firstBytes[2] === 0x46 && firstBytes[3] === 0x46 &&
                imageBuffer[8] === 0x57 && imageBuffer[9] === 0x45 && 
                imageBuffer[10] === 0x42 && imageBuffer[11] === 0x50) {
          contentType = "image/webp";
        }
      }
      
      console.log("Detected content type for ingredients:", contentType);
      
      // Call OpenAI Vision API with a prompt specific to ingredient detection
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are an ingredients recognition AI. Identify visible ingredients in the image. Respond with a JSON array of ingredient names only, no explanation."
          },
          {
            role: "user",
            content: [
              { type: "text", text: "List all visible ingredients in this image." },
              {
                type: "image_url",
                image_url: {
                  url: `data:${contentType};base64,${base64Image}`
                }
              }
            ]
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 300
      });
      
      // Parse the JSON response to get array of ingredients
      const responseText = response.choices[0].message.content?.trim();
      
      if (!responseText) {
        console.log("No ingredients detected in the image");
        return [];
      }
      
      try {
        const parsedResponse = JSON.parse(responseText);
        const ingredients = Array.isArray(parsedResponse.ingredients) 
          ? parsedResponse.ingredients 
          : [];
          
        console.log("OpenAI identified ingredients:", ingredients);
        return ingredients;
      } catch (parseError) {
        console.error("Error parsing OpenAI ingredients response:", parseError);
        return [];
      }
    } catch (error) {
      console.error("Error identifying ingredients with OpenAI:", error);
      return [];
    }
  }
}