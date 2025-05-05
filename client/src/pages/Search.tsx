import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import RecipeCard from "@/components/RecipeCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Search = () => {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [submitted, setSubmitted] = useState(false);
  
  // Query for search results only when the form is submitted
  const { data: searchResults, isLoading, error } = useQuery({
    queryKey: ["search", searchTerm],
    queryFn: async () => {
      if (!searchTerm || !submitted) return { recipes: [] };
      
      const response = await fetch(`/api/recipes/search?query=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) {
        throw new Error("Failed to search recipes");
      }
      const recipes = await response.json();
      return { recipes };
    },
    enabled: submitted && searchTerm.length > 0
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 font-heading">Recipe Search</h1>
      
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Search for recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" className="bg-primary text-white">
            Search
          </Button>
        </div>
      </form>

      {isLoading && (
        <div className="py-8 text-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-36 bg-gray-200 rounded mb-4"></div>
            <div className="grid grid-cols-2 gap-4 w-full">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="py-8 text-center">
          <p className="text-red-500">Failed to load search results. Please try again.</p>
        </div>
      )}

      {submitted && searchResults && searchResults.recipes.length === 0 && !isLoading && (
        <div className="py-8 text-center">
          <p className="text-neutral-600">No recipes found for "{searchTerm}". Try a different search term.</p>
        </div>
      )}

      {searchResults && searchResults.recipes.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 font-heading">Search Results</h2>
          <div className="grid grid-cols-2 gap-4">
            {searchResults.recipes.map((recipe: any) => (
              <RecipeCard
                key={recipe.id}
                id={recipe.id}
                title={recipe.name}
                image={recipe.image}
                readyInMinutes={recipe.readyInMinutes}
                difficulty={recipe.difficulty || "Medium"}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;