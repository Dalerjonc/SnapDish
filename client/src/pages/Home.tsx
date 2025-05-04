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
      <div className="grid grid-cols-2 gap-3">
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
    </div>
  );
};

export default Home;
