import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import IdentifyDish from "@/pages/IdentifyDish";
import KitchenIngredients from "@/pages/KitchenIngredients";
import RecipeDetail from "@/pages/RecipeDetail";
import ChatAssistant from "@/pages/ChatAssistant";
import PopularRecipes from "@/pages/PopularRecipes";
import QuickRecipes from "@/pages/QuickRecipes";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";

function Router() {
  return (
    <div className="max-w-lg mx-auto bg-white min-h-screen relative pb-16">
      <Header />
      <main className="pb-16">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/identify-dish" component={IdentifyDish} />
          <Route path="/kitchen-ingredients" component={KitchenIngredients} />
          <Route path="/recipe/:id" component={RecipeDetail} />
          <Route path="/chat" component={ChatAssistant} />
          <Route path="/chat/:recipeId" component={ChatAssistant} />
          <Route path="/popular-recipes" component={PopularRecipes} />
          <Route path="/quick-recipes" component={QuickRecipes} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <BottomNavigation />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
