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
            content: `You are a culinary and nutrition expert. Provide detailed recipe and nutrition information for the specified dish in JSON format exactly as shown below:
            {
              "name": "Dish Name",
              "summary": "A short description of the dish and its origin",
              "readyInMinutes": 30,
              "servings": 4,
              "calories": 350,
              "protein": "25g",
              "carbs": "30g",
              "fat": "15g",
              "instructions": [
                "Heat 2 tbsp olive oil in large skillet over medium heat until shimmering.",
                "Add diced onions and cook for 3-4 minutes until translucent.",
                "Season with salt and pepper. Serve immediately while hot."
              ],
              "extendedIngredients": [
                {"name": "ingredient1", "amount": 2, "unit": "cups", "original": "2 cups of ingredient1"},
                {"name": "ingredient2", "amount": 1, "unit": "tbsp", "original": "1 tablespoon ingredient2"}
              ],
              "analyzedInstructions": [
                {
                  "name": "",
                  "steps": [
                    {
                      "number": 1,
                      "step": "Heat 2 tbsp olive oil in large skillet over medium heat until shimmering.",
                      "ingredients": [],
                      "equipment": []
                    },
                    {
                      "number": 2,
                      "step": "Add diced onions and cook for 3-4 minutes until translucent.",
                      "ingredients": [],
                      "equipment": []
                    },
                    {
                      "number": 3,
                      "step": "Season with salt and pepper. Serve immediately while hot.",
                      "ingredients": [],
                      "equipment": []
                    }
                  ]
                }
              ]
            }
            
            IMPORTANT: Write cooking instructions in clear, step-by-step format. Each step should describe one main action. Use short, simple sentences (max 15 words per step). Include important details like time, temperature, amounts, and visual/sensory cues. Example: "Heat 2 tbsp olive oil in a large skillet over medium heat until shimmering." NOT: "Heat the oil."
            The instructions MUST be an array of strings, where each string is a separate step. The analyzedInstructions must match the instructions array.
            Each object in the steps array should correspond to an instruction in the instructions array.`
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
      try {
        const recipeData = JSON.parse(response.choices[0].message.content || "{}");
        
        // Ensure instructions is an array
        if (recipeData.instructions && typeof recipeData.instructions === 'string') {
          // Split by new lines or numbered steps
          const instructionSteps = recipeData.instructions
            .split(/\n|(?=\d+\.\s)/)
            .filter(Boolean)
            .map((step: string) => step.replace(/^\d+\.\s*/, '').trim());
          
          recipeData.instructions = instructionSteps;
        } else if (!Array.isArray(recipeData.instructions)) {
          recipeData.instructions = ["No instructions available"];
        }
        
        // Ensure analyzedInstructions is properly structured
        if (!recipeData.analyzedInstructions || !Array.isArray(recipeData.analyzedInstructions) || recipeData.analyzedInstructions.length === 0) {
          // Create structured instructions from the array of instruction steps
          recipeData.analyzedInstructions = [{
            name: "",
            steps: (Array.isArray(recipeData.instructions) ? recipeData.instructions : [])
              .map((step: string, index: number) => ({
                number: index + 1,
                step: step,
                ingredients: [],
                equipment: []
              }))
          }];
        }
        
        console.log("Generated recipe and nutrition data for:", dishName);
        return recipeData;
      } catch (parseError) {
        console.error("Error parsing OpenAI recipe JSON:", parseError);
        
        // Return a basic structure with default values
        return {
          name: dishName,
          summary: `Recipe for ${dishName}`,
          readyInMinutes: 30,
          servings: 4,
          calories: 0,
          protein: "0g",
          carbs: "0g",
          fat: "0g",
          instructions: ["No instructions available"],
          extendedIngredients: [],
          analyzedInstructions: [{
            name: "",
            steps: [{
              number: 1,
              step: "No detailed instructions available",
              ingredients: [],
              equipment: []
            }]
          }]
        };
      }
    } catch (error) {
      console.error("Error getting recipe and nutrition with OpenAI:", error);
      // Return a basic structure rather than throwing an error
      return {
        name: dishName,
        summary: `Recipe for ${dishName}`,
        readyInMinutes: 30,
        servings: 4,
        calories: 0,
        protein: "0g",
        carbs: "0g",
        fat: "0g",
        instructions: ["No instructions available"],
        extendedIngredients: [],
        analyzedInstructions: [{
          name: "",
          steps: [{
            number: 1,
            step: "No detailed instructions available",
            ingredients: [],
            equipment: []
          }]
        }]
      };
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