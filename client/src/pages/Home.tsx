import { useQuery } from "@tanstack/react-query";
import OptionCard from "@/components/OptionCard";
import RecipeCard from "@/components/RecipeCard";
import RecipeCardHorizontal from "@/components/RecipeCardHorizontal";

const Home = () => {
  const { data: popularRecipes, isLoading: loadingPopular } = useQuery({
    queryKey: ["/api/recipes/popular"],
  });

  const { data: quickRecipes, isLoading: loadingQuick } = useQuery({
    queryKey: ["/api/recipes/quick"],
  });

  return (
    <div className="px-4 py-4">
      {/* Hero Banner - Smaller Version */}
      <div className="bg-gradient-to-r from-primary/90 to-primary rounded-xl p-4 mb-5 text-white">
        <h2 className="text-lg font-bold font-heading mb-1">Hungry but not sure what to cook?</h2>
        <p className="text-xs mb-3">Snap a photo of your ingredients or a dish you like, and let our AI suggest recipes!</p>
        <div className="flex space-x-2">
          <button className="bg-white text-primary font-medium py-1.5 px-3 rounded-full text-xs flex items-center">
            <i className="ri-information-line mr-1"></i> Learn how
          </button>
        </div>
      </div>

      {/* Main Options - Larger Buttons */}
      <div className="flex flex-col gap-4 mb-6">
        {/* Identify Dish - Full Width */}
        <a 
          href="/identify-dish" 
          className="flex flex-col items-center justify-center bg-primary/10 p-8 rounded-xl text-center transition-all hover:bg-primary/20"
        >
          <div className="w-16 h-16 flex items-center justify-center bg-primary/20 text-primary rounded-full mb-3">
            <i className="ri-camera-line text-2xl"></i>
          </div>
          <h3 className="text-lg font-semibold mb-1">Identify Dish</h3>
          <p className="text-sm text-neutral-600">Snap a photo of any meal</p>
        </a>
        
        {/* What's in My Kitchen - Full Width */}
        <a 
          href="/kitchen-ingredients" 
          className="flex flex-col items-center justify-center bg-secondary/10 p-8 rounded-xl text-center transition-all hover:bg-secondary/20"
        >
          <div className="w-16 h-16 flex items-center justify-center bg-secondary/20 text-secondary rounded-full mb-3">
            <i className="ri-refrigerator-line text-2xl"></i>
          </div>
          <h3 className="text-lg font-semibold mb-1">What's in My Kitchen</h3>
          <p className="text-sm text-neutral-600">Find recipes based on what you have</p>
        </a>
      </div>

      {/* Category Navigation Buttons - Horizontal */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <a 
          href="/popular-recipes" 
          className="bg-gradient-to-r from-primary/30 to-primary/10 p-3 rounded-xl text-center flex flex-col items-center"
        >
          <i className="ri-fire-line text-primary text-xl mb-1"></i>
          <span className="text-sm font-medium">Popular Recipes</span>
        </a>
        <a 
          href="/quick-recipes" 
          className="bg-gradient-to-r from-secondary/30 to-secondary/10 p-3 rounded-xl text-center flex flex-col items-center"
        >
          <i className="ri-time-line text-secondary text-xl mb-1"></i>
          <span className="text-sm font-medium">Quick & Easy</span>
        </a>
      </div>

      {/* Popular Recipes Preview */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold font-heading">Popular Recipes</h2>
          <a href="/popular-recipes" className="text-sm text-primary font-medium">See all</a>
        </div>
        
        <div className="overflow-x-auto hide-scrollbar snap-x flex gap-4 -mx-4 px-4">
          {loadingPopular ? (
            // Loading skeleton
            Array(4).fill(0).map((_, index) => (
              <div key={index} className="snap-start min-w-[160px] max-w-[160px] rounded-xl overflow-hidden shadow-sm bg-white">
                <div className="aspect-square bg-neutral-200 animate-pulse"></div>
                <div className="p-2">
                  <div className="h-4 bg-neutral-200 rounded animate-pulse mb-2"></div>
                  <div className="h-3 bg-neutral-200 rounded animate-pulse w-2/3"></div>
                </div>
              </div>
            ))
          ) : popularRecipes && popularRecipes.length > 0 ? (
            popularRecipes.map((recipe: any) => (
              <RecipeCard
                key={recipe.id}
                id={recipe.id}
                title={recipe.name}
                image={recipe.image}
                readyInMinutes={recipe.readyInMinutes}
                difficulty={recipe.difficulty || "Easy"}
              />
            ))
          ) : (
            <div className="text-center w-full py-4 text-neutral-500">No recipes found</div>
          )}
        </div>
      </div>
      
      {/* Quick & Easy Recipes */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold font-heading">Quick & Easy</h2>
          <a href="/quick-recipes" className="text-sm text-primary font-medium">See all</a>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {loadingQuick ? (
            // Loading skeleton
            Array(2).fill(0).map((_, index) => (
              <div key={index} className="flex bg-white rounded-xl overflow-hidden shadow-sm">
                <div className="w-1/3 bg-neutral-200 animate-pulse"></div>
                <div className="w-2/3 p-2">
                  <div className="h-4 bg-neutral-200 rounded animate-pulse mb-2"></div>
                  <div className="h-3 bg-neutral-200 rounded animate-pulse w-2/3 mb-1"></div>
                  <div className="h-3 bg-neutral-200 rounded animate-pulse w-1/2"></div>
                </div>
              </div>
            ))
          ) : quickRecipes && quickRecipes.length > 0 ? (
            quickRecipes.slice(0, 2).map((recipe: any) => (
              <RecipeCardHorizontal
                key={recipe.id}
                id={recipe.id}
                title={recipe.name}
                image={recipe.image}
                readyInMinutes={recipe.readyInMinutes}
                calories={recipe.calories}
              />
            ))
          ) : (
            <div className="text-center w-full col-span-2 py-4 text-neutral-500">No recipes found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
