import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { recipeService, imageService } from "@/lib/services";
import { queryClient } from "@/lib/queryClient";
import ImageUploader from "@/components/ImageUploader";
import RecipeCardHorizontal from "@/components/RecipeCardHorizontal";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const KitchenIngredients = () => {
  const [activeTab, setActiveTab] = useState("type");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const { toast } = useToast();

  // Query for recipes by ingredients
  const { data: recipes = [], isLoading: loadingRecipes } = useQuery<any[]>({
    queryKey: ["/api/recipes/by-ingredients", ingredients],
    queryFn: () => {
      if (ingredients.length === 0) return [];
      console.log("Query function for ingredients:", ingredients);
      return recipeService.getRecipesByIngredients(ingredients);
    },
    enabled: ingredients.length > 0,
  });

  // Mutation for identifying ingredients from image
  const identifyIngredientsMutation = useMutation({
    mutationFn: (file: File) => imageService.identifyIngredients(file),
    onSuccess: (data) => {
      // Deduplicate ingredients without using Set
      setIngredients(prev => {
        const combined = [...prev, ...data];
        return combined.filter((item, index) => combined.indexOf(item) === index);
      });
      toast({
        title: "Ingredients detected",
        description: `Found: ${data.join(", ")}`,
      });
      // Auto-search for recipes
      findRecipesMutation.mutate(data);
    },
    onError: (error) => {
      toast({
        title: "Error detecting ingredients",
        description: error instanceof Error ? error.message : "Please try again with a clearer photo",
        variant: "destructive",
      });
    },
  });

  // Mutation for finding recipes
  const findRecipesMutation = useMutation({
    mutationFn: (ingredientList: string[]) => recipeService.getRecipesByIngredients(ingredientList),
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/recipes/by-ingredients", ingredients], data);
      toast({
        title: `Found ${data.length} recipes`,
        description: "Recipes that match your ingredients",
      });
    },
    onError: (error) => {
      toast({
        title: "Error finding recipes",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleAddIngredient = () => {
    if (inputValue.trim()) {
      const newIngredient = inputValue.trim();
      if (!ingredients.includes(newIngredient)) {
        setIngredients([...ingredients, newIngredient]);
        setInputValue("");
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddIngredient();
    }
  };

  const handleRemoveIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter(i => i !== ingredient));
  };

  const handleFindRecipes = () => {
    if (ingredients.length > 0) {
      findRecipesMutation.mutate(ingredients);
    } else {
      toast({
        title: "No ingredients added",
        description: "Please add at least one ingredient",
        variant: "destructive",
      });
    }
  };

  const handleImageSelect = (file: File) => {
    identifyIngredientsMutation.mutate(file);
  };

  return (
    <div className="px-4 py-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold font-heading mb-2">What's In My Kitchen?</h2>
        <p className="text-sm text-neutral-600">Find recipes based on ingredients you have available</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="type" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="w-full border-b border-neutral-200 mb-6 grid grid-cols-2">
          <TabsTrigger value="type" className="py-2 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary font-medium text-sm">
            Type Ingredients
          </TabsTrigger>
          <TabsTrigger value="photo" className="py-2 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary font-medium text-sm">
            Snap Photo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="type" className="mt-0">
          <div className="mb-6">
            <div className="relative mb-4">
              <Input
                type="text"
                placeholder="Enter ingredients (e.g., eggs, spinach, cheese)"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full border border-neutral-300 rounded-lg py-3 px-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-primary"
                onClick={handleAddIngredient}
              >
                <i className="ri-add-line"></i>
              </button>
            </div>

            {/* Selected Ingredients - iOS Style */}
            <div className="flex flex-wrap gap-2 mb-4">
              {ingredients.map((ingredient, index) => (
                <motion.div 
                  key={index} 
                  className="bg-gradient-to-r from-primary/20 to-secondary/20 backdrop-blur-sm border border-white/30 dark:border-slate-700/30 shadow-sm rounded-full py-1.5 px-4 text-sm font-medium flex items-center"
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="gradient-text">{ingredient}</span>
                  <motion.button
                    className="ml-2 bg-white/50 dark:bg-slate-800/50 rounded-full h-5 w-5 flex items-center justify-center shadow-sm"
                    onClick={() => handleRemoveIngredient(ingredient)}
                    whileHover={{ rotate: 90 }}
                    whileTap={{ scale: 0.8 }}
                  >
                    <i className="ri-close-line text-xs text-primary/80"></i>
                  </motion.button>
                </motion.div>
              ))}
            </div>

            <div className="relative w-full mb-4">
              <motion.div 
                whileTap={{ scale: 0.98 }}
                className="w-full"
              >
                <Button
                  className="w-full glass-card text-primary font-medium py-3 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 backdrop-blur-md shadow-lg border border-white/30"
                  onClick={handleFindRecipes}
                  disabled={findRecipesMutation.isPending || ingredients.length === 0}
                >
                  {findRecipesMutation.isPending ? (
                    <div className="flex items-center justify-center space-x-2">
                      <span>Searching</span>
                      <div className="typing-indicator">
                        <div className="typing-indicator-dot"></div>
                        <div className="typing-indicator-dot"></div>
                        <div className="typing-indicator-dot"></div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <span className="mr-2">Find Recipes</span>
                      <i className="ri-search-line"></i>
                    </div>
                  )}
                </Button>
              </motion.div>
              
              {/* iOS-style Progress Indicator */}
              {findRecipesMutation.isPending && (
                <motion.div 
                  className="absolute bottom-0 left-0 h-1 bg-primary/10 w-full rounded-b-full overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div 
                    className="h-full bg-gradient-to-r from-primary to-secondary absolute"
                    initial={{ width: "0%" }}
                    animate={{ 
                      width: ["0%", "40%", "60%", "80%", "100%"],
                      x: ["0%", "0%", "0%", "0%", "100%"] 
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      ease: "easeInOut" 
                    }}
                  />
                </motion.div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="photo" className="mt-0">
          <ImageUploader
            onImageSelect={handleImageSelect}
            title="Snap a photo of your ingredients"
            description="Take a clear photo of multiple ingredients together"
            className="mb-6"
            isProcessing={identifyIngredientsMutation.isPending}
          />
          
          {identifyIngredientsMutation.isPending && (
            <div className="text-center py-4 mb-2 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-sm font-medium text-primary">Analyzing ingredients with AI vision<span className="animate-pulse">...</span></p>
              <p className="text-xs text-neutral-600 mt-1">This might take a few seconds</p>
              {/* Progress indicator */}
              <div className="w-full h-1 bg-primary/10 rounded-full overflow-hidden mt-3 mx-auto max-w-xs">
                <div className="h-full w-[40%] bg-primary absolute animate-progress-indeterminate"></div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Results */}
      {(loadingRecipes || findRecipesMutation.isPending) && (
        <div className="py-4">
          <motion.div 
            className="mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-base font-semibold font-heading mb-3">
              <span className="gradient-text">
                {ingredients.length > 0 
                  ? `Found ${ingredients.length} recipes` 
                  : "Searching..."}
              </span>
            </h3>
            <LoadingSkeleton 
              type="search"
              message="Searching..."
              count={3}
            />
          </motion.div>
        </div>
      )}

      {recipes && recipes.length > 0 && !loadingRecipes && !findRecipesMutation.isPending && (
        <div>
          <h3 className="text-base font-semibold font-heading mb-3">
            Recipes with your ingredients ({recipes.length})
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {recipes.map((recipe: any) => (
              <RecipeCardHorizontal
                key={recipe.id}
                id={recipe.id}
                title={recipe.name}
                image={recipe.image}
                readyInMinutes={recipe.readyInMinutes}
                calories={recipe.calories}
              />
            ))}
          </div>
        </div>
      )}

      {/* Example ingredient photos */}
      {!recipes.length && !loadingRecipes && !findRecipesMutation.isPending && (
        <div>
          <h3 className="text-base font-semibold font-heading mb-3">Example Ingredients</h3>
          <div className="overflow-x-auto hide-scrollbar snap-x flex gap-4 -mx-4 px-4">
            <div className="snap-start rounded-xl overflow-hidden shadow-sm bg-white aspect-square min-w-[160px] max-w-[160px]">
              <img 
                src="https://images.unsplash.com/photo-1584473457409-2a40b9841397" 
                alt="Vegetable spread" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="snap-start rounded-xl overflow-hidden shadow-sm bg-white aspect-square min-w-[160px] max-w-[160px]">
              <img 
                src="https://images.unsplash.com/photo-1567306226408-c02fe98d5b0e" 
                alt="Fresh herbs and vegetables" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="snap-start rounded-xl overflow-hidden shadow-sm bg-white aspect-square min-w-[160px] max-w-[160px]">
              <img 
                src="https://images.unsplash.com/photo-1573246123716-6b1782bfc499" 
                alt="Various raw meats and vegetables" 
                className="w-full h-full object-cover" 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KitchenIngredients;