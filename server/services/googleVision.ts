/**
 * Google Vision API service
 * Provides image analysis and recognition capabilities
 */

import * as vision from '@google-cloud/vision';

// Create Vision client using JSON credentials directly from the root folder
const client = new vision.ImageAnnotatorClient({
  keyFilename: './service-account.json'
});

// Food-related categories for filtering Vision API results
const FOOD_CATEGORIES = [
  'food', 'dish', 'cuisine', 'meal', 'recipe', 'ingredient', 'breakfast', 'lunch', 'dinner',
  'appetizer', 'dessert', 'snack', 'fruit', 'vegetable', 'meat', 'seafood', 'pasta', 'rice', 
  'sandwich', 'salad', 'soup', 'baked goods', 'bread', 'cake', 'pie', 'cookie', 'pastry'
];

// Function to analyze uploaded image for general labels
export async function analyzeImage(imageBuffer: Buffer) {
  try {
    const [result] = await client.labelDetection(imageBuffer);
    const labels = result.labelAnnotations || [];
    return labels.map(label => ({
      description: label.description,
      score: label.score
    }));
  } catch (error) {
    console.error("Error analyzing image with Google Vision:", error);
    throw error;
  }
}

// Function to identify a dish from an image
export async function identifyDish(imageBuffer: Buffer): Promise<string | null> {
  try {
    // Get labels from the image
    const [result] = await client.labelDetection(imageBuffer);
    const labels = result.labelAnnotations || [];
    
    console.log("Vision API labels:", labels.map(l => `${l.description} (${l.score})`).join(', '));
    
    // Filter for labels that are related to food
    const foodLabels = labels.filter(label => {
      const description = label.description?.toLowerCase() || '';
      return FOOD_CATEGORIES.some(category => description.includes(category)) || 
             (label.score !== null && label.score !== undefined && label.score > 0.8); // Include high confidence labels too
    });
    
    // If we found food labels, use them directly
    if (foodLabels.length > 0) {
      // Sort by score (highest first) and return the top result
      foodLabels.sort((a, b) => (b.score || 0) - (a.score || 0));
      return foodLabels[0].description || null;
    }
    
    // If no food-related labels were found, check for generic objects
    try {
      console.log("No food labels found, using object detection");
      const [objectResult] = await client.objectLocalization(imageBuffer);
      const objects = objectResult.localizedObjectAnnotations || [];
      
      console.log("Vision API objects:", objects.map(o => `${o.name || 'unnamed'} (${o.score || 0})`).join(', '));
      
      const foodObjects = objects.filter(obj => {
        const name = obj.name?.toLowerCase() || '';
        return FOOD_CATEGORIES.some(category => name.includes(category)) || 
              (obj.score !== null && obj.score !== undefined && obj.score > 0.8);
      });
      
      if (foodObjects.length > 0) {
        // Sort by score (highest first) and return the top result
        foodObjects.sort((a, b) => (b.score || 0) - (a.score || 0));
        return foodObjects[0].name || null;
      }
    } catch (error) {
      console.error("Error during object localization:", error);
    }
    
    // If we haven't identified a food item, return null
    return null;
  } catch (error) {
    console.error("Error identifying dish with Google Vision:", error);
    throw error;
  }
}

// Function to identify ingredients in an image
export async function identifyIngredients(imageBuffer: Buffer): Promise<string[]> {
  try {
    // Use both label detection and object localization for better ingredient identification
    const [labelResult] = await client.labelDetection(imageBuffer);
    const [objectResult] = await client.objectLocalization(imageBuffer);
    
    const labels = labelResult.labelAnnotations || [];
    const objects = objectResult.localizedObjectAnnotations || [];
    
    console.log("Vision API labels for ingredients:", labels.map(l => `${l.description || 'unnamed'} (${l.score || 0})`).join(', '));
    console.log("Vision API objects for ingredients:", objects.map(o => `${o.name || 'unnamed'} (${o.score || 0})`).join(', '));
    
    // Extract potential ingredients from labels
    const ingredientsFromLabels = labels
      .filter(label => (label.score !== null && label.score !== undefined && label.score > 0.6)) // Only consider labels with decent confidence
      .map(label => label.description || "")
      .filter(desc => desc.length > 0);
    
    // Extract potential ingredients from objects
    const ingredientsFromObjects = objects
      .filter(obj => (obj.score !== null && obj.score !== undefined && obj.score > 0.6)) // Only consider objects with decent confidence
      .map(obj => obj.name || "")
      .filter(name => name.length > 0);
    
    // Combine both sets and remove duplicates
    const ingredientSet = new Set([...ingredientsFromLabels, ...ingredientsFromObjects]);
    const allIngredients = Array.from(ingredientSet);
    
    // If we found ingredients, return them
    if (allIngredients.length > 0) {
      return allIngredients.slice(0, 10); // Limit to top 10 to avoid overwhelming results
    }
    
    return []; // Return empty array if no ingredients detected
  } catch (error) {
    console.error("Error identifying ingredients with Google Vision:", error);
    throw error;
  }
}