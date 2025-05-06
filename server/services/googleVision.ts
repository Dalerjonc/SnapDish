/**
 * Google Vision API service
 * Provides image analysis and recognition capabilities
 */

import * as vision from '@google-cloud/vision';

// Create Vision client using JSON credentials directly from the root folder
let client: vision.ImageAnnotatorClient | null = null;
try {
  client = new vision.ImageAnnotatorClient({
    keyFilename: './service-account.json'
  });
  console.log("Google Vision client created");
} catch (error) {
  console.error("Failed to create Google Vision client:", error);
}

// Food-related categories for filtering Vision API results
const FOOD_CATEGORIES = [
  'food', 'dish', 'cuisine', 'meal', 'recipe', 'ingredient', 'breakfast', 'lunch', 'dinner',
  'appetizer', 'dessert', 'snack', 'fruit', 'vegetable', 'meat', 'seafood', 'pasta', 'rice', 
  'sandwich', 'salad', 'soup', 'baked goods', 'bread', 'cake', 'pie', 'cookie', 'pastry'
];

// Specific cultural rice dishes for more accurate identification
const RICE_DISHES = [
  { name: 'plov', alternates: ['pilaf', 'pulao', 'pilau'], origin: 'Uzbek/Central Asian' },
  { name: 'biryani', alternates: ['biriyani', 'briyani'], origin: 'Indian/South Asian' },
  { name: 'paella', alternates: ['spanish rice'], origin: 'Spanish' },
  { name: 'risotto', alternates: ['italian rice'], origin: 'Italian' },
  { name: 'jambalaya', alternates: ['cajun rice'], origin: 'Creole/Cajun' },
  { name: 'tahdig', alternates: ['persian rice'], origin: 'Persian' },
  { name: 'congee', alternates: ['jook', 'rice porridge'], origin: 'Chinese/East Asian' },
  { name: 'arroz con pollo', alternates: ['chicken rice'], origin: 'Latin American' },
  { name: 'nasi goreng', alternates: ['fried rice', 'indonesian rice'], origin: 'Indonesian' }
];

// Function to analyze uploaded image for general labels
export async function analyzeImage(imageBuffer: Buffer) {
  try {
    if (!client) {
      throw new Error("Google Vision client not initialized");
    }
    
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
    if (!client) {
      throw new Error("Google Vision client not initialized");
    }
    
    // Get labels from the image with more results
    const [result] = await client.labelDetection(imageBuffer);
    const labels = result.labelAnnotations || [];
    
    console.log("Vision API labels:", labels.map(l => `${l.description} (${l.score})`).join(', '));
    
    // First, check for all image labels as lowercase strings for easier matching
    const labelTexts = labels.map(label => (label.description || '').toLowerCase());
    
    // Check for cultural rice dishes using our dictionary
    for (const dish of RICE_DISHES) {
      // Check if the main dish name is in the labels
      if (labelTexts.some(text => text.includes(dish.name))) {
        console.log(`Cultural rice dish detected: ${dish.name} (${dish.origin})`);
        return `${dish.origin} ${dish.name}`;
      }
      
      // Check for alternate names
      const matchedAlternate = dish.alternates.find(alt => 
        labelTexts.some(text => text.includes(alt))
      );
      
      if (matchedAlternate) {
        console.log(`Cultural rice dish detected via alternate name: ${matchedAlternate} -> ${dish.name} (${dish.origin})`);
        return `${dish.origin} ${dish.name}`;
      }
    }
    
    // Check if the image specifically has plov or pilaf characteristics
    const isPlov = 
      (labelTexts.some(text => text.includes('rice') || text.includes('pilaf')) &&
       labelTexts.some(text => text.includes('carrot') || text.includes('meat')));
    
    if (isPlov) {
      console.log("Characteristics of plov/pilaf detected");
      return "Uzbek plov";
    }
    
    // Check if rice dish is detected - many rice dishes need special handling
    const isRiceDish = labelTexts.some(text => 
      text.includes('rice') || 
      text.includes('pilaf') || 
      text.includes('biryani') || 
      text.includes('paella')
    );
    
    if (isRiceDish) {
      console.log("Rice dish detected, creating specialized description");
      
      // Look for meat types and other key ingredients in the rice dish
      const meatTypes = labels.filter(label => {
        const description = (label.description || '').toLowerCase();
        return description.includes('beef') || 
               description.includes('chicken') || 
               description.includes('pork') || 
               description.includes('lamb') || 
               description.includes('meat');
      });
      
      // Look for vegetables or other important ingredients
      const vegetables = labels.filter(label => {
        const description = (label.description || '').toLowerCase();
        return description.includes('carrot') || 
               description.includes('peas') || 
               description.includes('tomato') ||
               description.includes('vegetable');
      });
      
      // Look for cooking methods
      const cookingMethods = labels.filter(label => {
        const description = (label.description || '').toLowerCase();
        return description.includes('fried') || 
               description.includes('steamed') || 
               description.includes('boiled') ||
               description.includes('roasted');
      });
      
      // Build a more specific dish name for rice dishes
      let dishName = '';
      
      // Add cooking method if found
      if (cookingMethods.length > 0) {
        dishName += cookingMethods[0].description + ' ';
      }
      
      // Add meat type if found
      if (meatTypes.length > 0) {
        dishName += meatTypes[0].description + ' ';
      }
      
      // Add vegetable if found
      if (vegetables.length > 0) {
        dishName += vegetables[0].description + ' ';
      }
      
      // Check for specific rice dish types
      const riceDishType = labels.find(label => {
        const description = (label.description || '').toLowerCase();
        return description.includes('pilaf') || 
               description.includes('biryani') || 
               description.includes('paella') ||
               description.includes('fried rice');
      });
      
      if (riceDishType) {
        dishName += riceDishType.description;
      } else {
        dishName += 'Rice';
      }
      
      console.log(`Generated specific rice dish name: ${dishName}`);
      return dishName.trim();
    }
    
    // Filter for labels that are related to food but exclude generic "food" label
    const foodLabels = labels.filter(label => {
      const description = label.description?.toLowerCase() || '';
      // Exclude generic food descriptions
      if (description === 'food' || description === 'dish' || description === 'cuisine') {
        return false;
      }
      return FOOD_CATEGORIES.some(category => description.includes(category)) && 
             (label.score || 0) > 0.7; // Require good confidence
    });
    
    // If we found specific food labels, use the highest confidence one
    if (foodLabels.length > 0) {
      // Sort by score (highest first) and return the top result
      foodLabels.sort((a, b) => (b.score || 0) - (a.score || 0));
      const dishName = foodLabels[0].description || null;
      console.log(`Google Vision identified specific dish: ${dishName}`);
      return dishName;
    }
    
    // If no specific food-related labels were found, check for objects
    try {
      console.log("No specific food labels found, using object detection");
      
      // Make sure client exists before trying to use it
      if (!client) {
        throw new Error("Google Vision client not initialized");
      }
      
      let objectResult: any = { localizedObjectAnnotations: [] };
      if (client) {
        try {
          const result = await client.objectLocalization(imageBuffer);
          objectResult = result[0];
        } catch (objError) {
          console.error("Error during object localization:", objError);
        }
      }
      const objects = objectResult.localizedObjectAnnotations || [];
      
      console.log("Vision API objects:", objects.map(o => `${o.name || 'unnamed'} (${o.score || 0})`).join(', '));
      
      // Only use food objects and exclude generic "Food" object
      const foodObjects = objects.filter(obj => {
        const name = obj.name?.toLowerCase() || '';
        if (name === 'food') return false;
        return FOOD_CATEGORIES.some(category => name.includes(category)) && 
              (obj.score || 0) > 0.7; // Require high confidence
      });
      
      if (foodObjects.length > 0) {
        // Sort by score (highest first) and return the top result
        foodObjects.sort((a, b) => (b.score || 0) - (a.score || 0));
        const dishName = foodObjects[0].name || null;
        console.log(`Google Vision identified dish from objects: ${dishName}`);
        return dishName;
      }
    } catch (error) {
      console.error("Error during object localization:", error);
      // Continue to next method if object detection fails
    }
    
    // Try combining relevant high-confidence labels to create a meaningful dish description
    const relevantLabels = labels
      .filter(label => {
        const desc = label.description?.toLowerCase() || '';
        const score = label.score || 0;
        
        // Skip generic terms like "food" and "dish" when combining labels
        if (desc === 'food' || desc === 'dish' || desc === 'cuisine' || desc === 'meal') {
          return false;
        }
        
        // Include ingredient and cooking method terms with good confidence
        return (FOOD_CATEGORIES.some(category => desc.includes(category)) || 
                ['meat', 'rice', 'noodle', 'pasta', 'bread', 'potato', 'vegetable', 'fruit', 
                 'fried', 'baked', 'roasted', 'grilled', 'stewed'].some(term => desc.includes(term)))
                && score > 0.7;
      })
      .map(label => label.description)
      .filter(Boolean)
      .slice(0, 3); // Take top 3 most relevant terms
    
    if (relevantLabels.length > 0) {
      const combinedDishName = relevantLabels.join(' ');
      console.log(`Google Vision combining relevant food labels: ${combinedDishName}`);
      return combinedDishName;
    }
    
    // Last resort - use the most confident food-related label, even if generic
    const anyFoodLabel = labels.find(label => {
      const description = label.description?.toLowerCase() || '';
      return FOOD_CATEGORIES.some(category => description.includes(category));
    });
    
    if (anyFoodLabel && anyFoodLabel.description) {
      console.log(`Using generic food label as fallback: ${anyFoodLabel.description}`);
      return anyFoodLabel.description;
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
    if (!client) {
      throw new Error("Google Vision client not initialized");
    }
    
    // Use both label detection and object localization for better ingredient identification
    const [labelResult] = await client.labelDetection(imageBuffer);
    let objectResult: any = { localizedObjectAnnotations: [] };
    if (client) {
      try {
        const result = await client.objectLocalization(imageBuffer);
        objectResult = result[0];
      } catch (objError) {
        console.error("Error during object localization:", objError);
      }
    }
    
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