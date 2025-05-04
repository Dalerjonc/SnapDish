import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import IngredientItem from "@/components/IngredientItem";
import InstructionStep from "@/components/InstructionStep";
import RecipeCard from "@/components/RecipeCard";
import { recipeService } from "@/lib/services";
import { AnalyzedInstruction, Recipe } from "@shared/schema";

const RecipeDetail = () => {
  const [route] = useRoute("/recipe/:id");
  const [, navigate] = useLocation();
  
  // Added a safer way to parse the ID parameter
  const recipeId = route && route.params && route.params.id ? parseInt(route.params.id) : undefined;

  // Track if user has saved this recipe
  const [isSaved, setIsSaved] = useState(false);

  // Get recipe details
  const { data: recipe, isLoading } = useQuery({
    queryKey: [`/api/recipes/${recipeId}`],
    enabled: !!recipeId,
  });

  // Get similar recipes
  const { data: similarRecipes, isLoading: loadingSimilar } = useQuery({
    queryKey: [`/api/recipes/${recipeId}/similar`],
    enabled: !!recipeId,
  });

  const handleBack = () => {
    navigate(-1);
  };

  const handleShare = async () => {
    if (navigator.share && recipe) {
      try {
        await navigator.share({
          title: recipe.name,
          text: `Check out this recipe for ${recipe.name}!`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    }
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  const handleChatWithAI = () => {
    if (recipeId) {
      navigate(`/chat/${recipeId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-64 bg-neutral-200"></div>
        <div className="px-4 py-5">
          <div className="h-8 bg-neutral-200 rounded mb-2"></div>
          <div className="h-4 bg-neutral-200 rounded w-3/4 mb-4"></div>
          <div className="flex space-x-4 mb-4">
            <div className="h-6 bg-neutral-200 rounded w-1/4"></div>
            <div className="h-6 bg-neutral-200 rounded w-1/4"></div>
            <div className="h-6 bg-neutral-200 rounded w-1/4"></div>
          </div>
          <div className="bg-neutral-100 rounded-xl p-4 mb-6 h-32"></div>
          <div className="mb-6">
            <div className="h-6 bg-neutral-200 rounded mb-3"></div>
            <div className="space-y-2">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex items-start">
                  <div className="h-6 w-6 rounded-md bg-neutral-200 mr-3"></div>
                  <div className="h-6 bg-neutral-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="px-4 py-5 text-center">
        <h2 className="text-xl font-bold mb-2">Recipe not found</h2>
        <p className="mb-4">The recipe you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate("/")} className="bg-primary text-white">
          Return to Home
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Recipe Hero Image */}
      <div className="relative h-64">
        <img 
          src={recipe.image || "https://images.unsplash.com/photo-1548940740-204726a19be3"}
          alt={recipe.name} 
          className="w-full h-full object-cover" 
        />
        <div className="absolute top-4 left-4">
          <button 
            className="bg-white/80 backdrop-blur-sm p-2 rounded-full"
            onClick={handleBack}
          >
            <i className="ri-arrow-left-line text-neutral-800"></i>
          </button>
        </div>
        <div className="absolute top-4 right-4 flex space-x-2">
          <button 
            className="bg-white/80 backdrop-blur-sm p-2 rounded-full"
            onClick={handleSave}
          >
            <i className={`${isSaved ? 'ri-heart-fill text-primary' : 'ri-heart-line'} text-neutral-800`}></i>
          </button>
          <button 
            className="bg-white/80 backdrop-blur-sm p-2 rounded-full"
            onClick={handleShare}
          >
            <i className="ri-share-line text-neutral-800"></i>
          </button>
        </div>
      </div>

      {/* Recipe Content */}
      <div className="px-4 py-5">
        <h1 className="text-2xl font-bold font-heading mb-2">{recipe.name}</h1>
        
        {/* Recipe Info */}
        <div className="flex items-center text-sm text-neutral-600 mb-4">
          <div className="flex items-center mr-4">
            <i className="ri-time-line mr-1"></i>
            <span>{recipe.readyInMinutes || 30} mins</span>
          </div>
          <div className="flex items-center mr-4">
            <i className="ri-fire-line mr-1"></i>
            <span>{recipe.calories || "N/A"} cal</span>
          </div>
          <div className="flex items-center">
            <i className="ri-user-line mr-1"></i>
            <span>{recipe.servings || 4} servings</span>
          </div>
        </div>

        {/* Nutrition Info */}
        <div className="bg-neutral-100 rounded-xl p-4 mb-6">
          <h3 className="font-semibold font-heading mb-3">Nutrition Facts (per serving)</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-primary mr-2"></div>
              <span className="text-sm">Calories: {recipe.calories || "N/A"}</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-secondary mr-2"></div>
              <span className="text-sm">Protein: {recipe.protein || "N/A"}</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-accent mr-2"></div>
              <span className="text-sm">Carbs: {recipe.carbs || "N/A"}</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-neutral-600 mr-2"></div>
              <span className="text-sm">Fat: {recipe.fat || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Ingredients */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold font-heading mb-3">Ingredients</h3>
          <ul className="space-y-2">
            {recipe.extendedIngredients && recipe.extendedIngredients.length > 0 ? (
              recipe.extendedIngredients.map((ingredient, index) => (
                <IngredientItem
                  key={index}
                  name={ingredient.name}
                  amount={ingredient.amount}
                  unit={ingredient.unit}
                  original={ingredient.original}
                />
              ))
            ) : (
              <li>No ingredients information available</li>
            )}
          </ul>
        </div>

        {/* Instructions */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold font-heading mb-3">Cooking Steps</h3>
          {recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0 ? (
            <ol className="space-y-4">
              {recipe.analyzedInstructions.flatMap((instruction: AnalyzedInstruction) =>
                instruction.steps.map((step, index) => (
                  <InstructionStep
                    key={index}
                    number={step.number}
                    step={step.step}
                    ingredients={step.ingredients}
                    equipment={step.equipment}
                  />
                ))
              )}
            </ol>
          ) : (
            <p className="text-neutral-600">No detailed instructions available</p>
          )}
        </div>

        {/* Ask AI Button */}
        <div className="mb-6">
          <Button 
            className="w-full flex items-center justify-center bg-secondary text-white font-medium py-3 rounded-lg"
            onClick={handleChatWithAI}
          >
            <i className="ri-message-3-line mr-2"></i>
            Ask AI Assistant
          </Button>
        </div>

        {/* Similar Recipes */}
        {similarRecipes && similarRecipes.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold font-heading mb-3">You Might Also Like</h3>
            <div className="grid grid-cols-2 gap-4">
              {similarRecipes.slice(0, 2).map((recipe: any) => (
                <RecipeCard
                  key={recipe.id}
                  id={recipe.id}
                  title={recipe.name}
                  image={recipe.image}
                  readyInMinutes={recipe.readyInMinutes}
                  difficulty="Medium"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeDetail;
