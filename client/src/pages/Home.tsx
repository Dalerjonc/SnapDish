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

      {/* Main Options */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <OptionCard
          title="Identify Dish"
          description="Snap a photo of any meal"
          icon="ri-camera-line"
          href="/identify-dish"
          bgColor="bg-primary/10"
          iconColor="text-primary"
        />
        <OptionCard
          title="What's in My Kitchen"
          description="Find recipes based on what you have"
          icon="ri-refrigerator-line"
          href="/kitchen-ingredients"
          bgColor="bg-secondary/10"
          iconColor="text-secondary"
        />
      </div>

      {/* Popular Recipes Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold font-heading">Popular Recipes</h2>
          <a href="#" className="text-sm text-primary font-medium">See all</a>
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
          <a href="#" className="text-sm text-primary font-medium">See all</a>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {loadingQuick ? (
            // Loading skeleton
            Array(4).fill(0).map((_, index) => (
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
            quickRecipes.map((recipe: any) => (
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
