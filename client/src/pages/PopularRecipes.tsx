import { useQuery } from "@tanstack/react-query";
import RecipeCard from "@/components/RecipeCard";
import { useLocation } from "wouter";

const PopularRecipes = () => {
  const [_, navigate] = useLocation();
  
  const { data: popularRecipes, isLoading } = useQuery({
    queryKey: ["/api/recipes/popular"],
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
        <h1 className="text-xl font-bold font-heading">Popular Recipes</h1>
      </div>
      
      {/* Recipe Grid */}
      <div className="grid grid-cols-2 gap-4">
        {isLoading ? (
          // Loading skeleton
          Array(6).fill(0).map((_, index) => (
            <div key={index} className="rounded-xl overflow-hidden shadow-sm bg-white">
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
          <div className="text-center w-full col-span-2 py-8 text-neutral-500">
            No popular recipes found
          </div>
        )}
      </div>
    </div>
  );
};

export default PopularRecipes;