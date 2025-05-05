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

  // Loading skeleton for the home page
  const renderSkeletonHome = () => (
    <div className="min-h-[calc(100vh-140px)] flex flex-col px-4 py-3 animate-pulse">
      {/* Hero Banner Skeleton */}
      <div className="bg-neutral-200 rounded-xl p-3 mb-4 h-14"></div>

      {/* Main Container - Skeleton */}
      <div className="flex flex-col flex-1">
        {/* Main Options - Big Buttons Skeleton (70% of available space) */}
        <div className="flex flex-col gap-4 mb-4" style={{ flex: '0.7' }}>
          {/* Identify Dish - Skeleton */}
          <div className="bg-neutral-200 rounded-xl h-full min-h-[120px] flex flex-col items-center justify-center p-4">
            <div className="w-14 h-14 bg-neutral-300 rounded-full mb-2"></div>
            <div className="h-4 bg-neutral-300 rounded-lg w-1/3 mb-1"></div>
            <div className="h-3 bg-neutral-300 rounded-lg w-1/2"></div>
          </div>
          
          {/* What's in My Kitchen - Skeleton */}
          <div className="bg-neutral-200 rounded-xl h-full min-h-[120px] flex flex-col items-center justify-center p-4">
            <div className="w-14 h-14 bg-neutral-300 rounded-full mb-2"></div>
            <div className="h-4 bg-neutral-300 rounded-lg w-2/5 mb-1"></div>
            <div className="h-3 bg-neutral-300 rounded-lg w-3/5"></div>
          </div>
        </div>

        {/* Category Buttons - Skeleton (30% of available space) */}
        <div className="grid grid-cols-2 gap-4" style={{ flex: '0.3' }}>
          <div className="bg-neutral-200 rounded-xl flex items-center justify-center min-h-[80px]"></div>
          <div className="bg-neutral-200 rounded-xl flex items-center justify-center min-h-[80px]"></div>
        </div>
      </div>
    </div>
  );

  // Display loading state
  if (loadingPopular || loadingQuick) {
    return renderSkeletonHome();
  }

  // Actual rendered UI
  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col px-4 py-3">
      {/* Hero Banner - Compact Version */}
      <div className="bg-gradient-to-r from-primary/90 to-primary rounded-xl p-3 mb-4 text-white">
        <h2 className="text-base font-bold">Hungry but not sure what to cook?</h2>
        <p className="text-xs">Snap a photo of ingredients or dish for AI suggestions</p>
      </div>

      {/* Main Container - All buttons */}
      <div className="flex flex-col flex-1">
        {/* Main Options - Big Buttons (70% of available space) */}
        <div className="flex flex-col gap-4 mb-4" style={{ flex: '0.7' }}>
          {/* Identify Dish - Full Width */}
          <a 
            href="/identify-dish" 
            className="bg-primary/10 rounded-xl h-full min-h-[120px] flex flex-col items-center justify-center p-4"
          >
            <div className="w-14 h-14 flex items-center justify-center bg-primary/20 text-primary rounded-full mb-2">
              <i className="ri-camera-line text-2xl"></i>
            </div>
            <h3 className="text-base font-semibold">Identify Dish</h3>
            <p className="text-xs text-neutral-600">Snap a photo of any meal</p>
          </a>
          
          {/* What's in My Kitchen - Full Width */}
          <a 
            href="/kitchen-ingredients" 
            className="bg-secondary/10 rounded-xl h-full min-h-[120px] flex flex-col items-center justify-center p-4"
          >
            <div className="w-14 h-14 flex items-center justify-center bg-secondary/20 text-secondary rounded-full mb-2">
              <i className="ri-shopping-basket-2-line text-2xl"></i>
            </div>
            <h3 className="text-base font-semibold">What's in My Kitchen</h3>
            <p className="text-xs text-neutral-600">Find recipes based on what you have</p>
          </a>
        </div>

        {/* Category Navigation Buttons - Horizontal (30% of available space) */}
        <div className="grid grid-cols-2 gap-4" style={{ flex: '0.3' }}>
          <a 
            href="/popular-recipes" 
            className="bg-gradient-to-r from-primary/30 to-primary/10 rounded-xl flex flex-col items-center justify-center p-3 min-h-[80px]"
          >
            <i className="ri-fire-line text-primary text-lg"></i>
            <span className="text-xs font-medium text-center">Popular Recipes</span>
          </a>
          <a 
            href="/quick-recipes" 
            className="bg-gradient-to-r from-secondary/30 to-secondary/10 rounded-xl flex flex-col items-center justify-center p-3 min-h-[80px]"
          >
            <i className="ri-time-line text-secondary text-lg"></i>
            <span className="text-xs font-medium text-center">Quick & Easy</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Home;
