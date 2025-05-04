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
    <div className="h-[calc(100vh-140px)] flex flex-col px-4 py-3">
      {/* Hero Banner - Compact Version */}
      <div className="bg-gradient-to-r from-primary/90 to-primary rounded-xl p-3 mb-3 text-white">
        <h2 className="text-base font-bold">Hungry but not sure what to cook?</h2>
        <p className="text-xs">Snap a photo of ingredients or dish for AI suggestions</p>
      </div>

      {/* Main Container - All buttons */}
      <div className="flex flex-col h-full">
        {/* Main Options - Big Buttons */}
        <div className="flex flex-col gap-3 flex-grow mb-3">
          {/* Identify Dish - Full Width */}
          <a 
            href="/identify-dish" 
            className="bg-primary/10 rounded-xl flex-1 flex flex-col items-center justify-center"
          >
            <div className="w-12 h-12 flex items-center justify-center bg-primary/20 text-primary rounded-full mb-1">
              <i className="ri-camera-line text-2xl"></i>
            </div>
            <h3 className="text-base font-semibold">Identify Dish</h3>
            <p className="text-xs text-neutral-600">Snap a photo of any meal</p>
          </a>
          
          {/* What's in My Kitchen - Full Width */}
          <a 
            href="/kitchen-ingredients" 
            className="bg-secondary/10 rounded-xl flex-1 flex flex-col items-center justify-center"
          >
            <div className="w-12 h-12 flex items-center justify-center bg-secondary/20 text-secondary rounded-full mb-1">
              <i className="ri-shopping-basket-2-line text-2xl"></i>
            </div>
            <h3 className="text-base font-semibold">What's in My Kitchen</h3>
            <p className="text-xs text-neutral-600">Find recipes based on what you have</p>
          </a>
        </div>

        {/* Category Navigation Buttons - Horizontal */}
        <div className="grid grid-cols-2 gap-3 h-16">
          <a 
            href="/popular-recipes" 
            className="bg-gradient-to-r from-primary/30 to-primary/10 rounded-xl flex flex-col items-center justify-center h-full"
          >
            <i className="ri-fire-line text-primary text-lg"></i>
            <span className="text-xs font-medium">Popular Recipes</span>
          </a>
          <a 
            href="/quick-recipes" 
            className="bg-gradient-to-r from-secondary/30 to-secondary/10 rounded-xl flex flex-col items-center justify-center h-full"
          >
            <i className="ri-time-line text-secondary text-lg"></i>
            <span className="text-xs font-medium">Quick & Easy</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Home;
