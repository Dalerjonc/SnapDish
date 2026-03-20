import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import IdentifyDish from "@/pages/IdentifyDish";
import KitchenIngredients from "@/pages/KitchenIngredients";
import RecipeDetail from "@/pages/RecipeDetail";
import ChatAssistant from "@/pages/ChatAssistant";
import PopularRecipes from "@/pages/PopularRecipes";
import QuickRecipes from "@/pages/QuickRecipes";
import Profile from "@/pages/Profile";
import Search from "@/pages/Search";
import Login from "@/pages/Login";
import Subscription from "@/pages/Subscription";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";

// Public routes that don't require authentication
const PUBLIC_PATHS = ["/login", "/signup"];

function ProtectedApp() {
  const { user, isLoading } = useAuth();
  const [location, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !user && !PUBLIC_PATHS.includes(location)) {
      navigate("/login");
    }
  }, [user, isLoading, location, navigate]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">Loading SnapDish…</p>
        </div>
      </div>
    );
  }

  // If not authenticated and not on a public route, render nothing (redirect in effect)
  if (!user && !PUBLIC_PATHS.includes(location)) {
    return null;
  }

  return (
    <div className="max-w-lg mx-auto bg-white dark:bg-gray-900 dark:text-white min-h-screen relative pb-16">
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Login} />
        <Route>
          <>
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
                <Route path="/profile" component={Profile} />
                <Route path="/search" component={Search} />
                <Route path="/subscription" component={Subscription} />
                <Route component={NotFound} />
              </Switch>
            </main>
            <BottomNavigation />
          </>
        </Route>
      </Switch>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <ProtectedApp />
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
