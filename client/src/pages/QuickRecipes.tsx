import { useQuery } from "@tanstack/react-query";
import RecipeCardHorizontal from "@/components/RecipeCardHorizontal";
import { useLocation } from "wouter";

const QuickRecipes = () => {
  const [_, navigate] = useLocation();
  
  const { data: quickRecipes, isLoading } = useQuery({
    queryKey: ["/api/recipes/quick"],
  });

  const handleBack = () => {
    navigate("/");
  };

  return (
    <div className="px-4 py-4">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button 
          className="w-8 h-8 flex items-center justify-center bg-neutral-100 rounded-full mr-3"
          onClick={handleBack}
        >
          <i className="ri-arrow-left-s-line text-neutral-700"></i>
        </button>
        <h1 className="text-xl font-bold font-heading">Quick & Easy Recipes</h1>
      </div>
      
      {/* Recipe List */}
      <div className="space-y-4">
        {isLoading ? (
          // Loading skeleton
          Array(6).fill(0).map((_, index) => (
            <div key={index} className="flex bg-white rounded-xl overflow-hidden shadow-sm h-24">
              <div className="w-1/3 bg-neutral-200 animate-pulse"></div>
              <div className="w-2/3 p-3">
                <div className="h-4 bg-neutral-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 bg-neutral-200 rounded animate-pulse w-2/3 mb-1"></div>
                <div className="h-3 bg-neutral-200 rounded animate-pulse w-1/2"></div>
              </div>
            </div>
          ))
        ) : quickRecipes && quickRecipes.length > 0 ? (
          quickRecipes.map((recipe: any) => (
            <div key={recipe.id} className="w-full">
              <RecipeCardHorizontal
                id={recipe.id}
                title={recipe.name}
                image={recipe.image}
                readyInMinutes={recipe.readyInMinutes}
                calories={recipe.calories}
              />
            </div>
          ))
        ) : (
          <div className="text-center w-full py-8 text-neutral-500">
            No quick recipes found
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickRecipes;