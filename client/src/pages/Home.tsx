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
      {/* Hero Banner - Minimal Version */}
      <div className="bg-gradient-to-r from-primary/90 to-primary rounded-xl p-2 mb-3 text-white">
        <h2 className="text-sm font-bold">Hungry but not sure what to cook?</h2>
        <p className="text-xs">Snap a photo of ingredients or dish for AI suggestions</p>
      </div>

      {/* Main Container - All buttons */}
      <div className="flex flex-col h-full">
        {/* Main Options - Big Buttons - 75% of available height */}
        <div className="grid grid-cols-2 gap-3 h-[75%] mb-2">
          {/* Identify Dish - Half Width but taller */}
          <a 
            href="/identify-dish" 
            className="flex flex-col items-center justify-center bg-primary/10 rounded-xl text-center hover:bg-primary/20 h-full"
          >
            <div className="w-14 h-14 flex items-center justify-center bg-primary/20 text-primary rounded-full mb-1">
              <i className="ri-camera-line text-xl"></i>
            </div>
            <h3 className="text-base font-semibold">Identify Dish</h3>
            <p className="text-xs text-neutral-600">Snap a photo of any meal</p>
          </a>
          
          {/* What's in My Kitchen - Half Width but taller */}
          <a 
            href="/kitchen-ingredients" 
            className="flex flex-col items-center justify-center bg-secondary/10 rounded-xl text-center hover:bg-secondary/20 h-full"
          >
            <div className="w-14 h-14 flex items-center justify-center bg-secondary/20 text-secondary rounded-full mb-1">
              <i className="ri-refrigerator-line text-xl"></i>
            </div>
            <h3 className="text-base font-semibold">What's in My Kitchen</h3>
            <p className="text-xs text-neutral-600">Find recipes based on what you have</p>
          </a>
        </div>

        {/* Category Navigation Buttons - Horizontal - 20% of available height */}
        <div className="grid grid-cols-2 gap-3 h-[20%]">
          <a 
            href="/popular-recipes" 
            className="bg-gradient-to-r from-primary/30 to-primary/10 rounded-xl text-center flex flex-col items-center justify-center h-full"
          >
            <i className="ri-fire-line text-primary text-xl"></i>
            <span className="text-sm font-medium">Popular Recipes</span>
          </a>
          <a 
            href="/quick-recipes" 
            className="bg-gradient-to-r from-secondary/30 to-secondary/10 rounded-xl text-center flex flex-col items-center justify-center h-full"
          >
            <i className="ri-time-line text-secondary text-xl"></i>
            <span className="text-sm font-medium">Quick & Easy</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Home;
