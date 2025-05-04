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
                  url: `data:image/jpeg;base64,${base64Image}`
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

  async identifyIngredients(imageBuffer: Buffer): Promise<string[]> {
    try {
      if (!openai) {
        throw new Error("OpenAI API key not configured");
      }

      console.log("Analyzing image for ingredients with OpenAI Vision API");
      
      // Convert buffer to base64
      const base64Image = imageBuffer.toString('base64');
      
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
                  url: `data:image/jpeg;base64,${base64Image}`
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