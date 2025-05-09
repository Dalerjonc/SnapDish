import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion } from "framer-motion";
import OptionCard from "@/components/OptionCard";
import RecipeCard from "@/components/RecipeCard";
import RecipeCardHorizontal from "@/components/RecipeCardHorizontal";
import FloatingCard from "@/components/FloatingCard";
import AnimatedButton from "@/components/AnimatedButton";

const Home = () => {
  const { data: popularRecipes, isLoading: loadingPopular } = useQuery({
    queryKey: ["/api/recipes/popular"],
  });

  const { data: quickRecipes, isLoading: loadingQuick } = useQuery({
    queryKey: ["/api/recipes/quick"],
  });

  // Loading skeleton for the home page
  const renderSkeletonHome = () => (
    <div className="h-[calc(100vh-140px)] flex flex-col px-4 py-3 animate-pulse">
      {/* Hero Banner Skeleton */}
      <div className="bg-neutral-200 rounded-xl p-3 mb-3 h-14"></div>

      {/* Main Container - Skeleton */}
      <div className="flex flex-col h-full">
        {/* Main Options - Big Buttons Skeleton */}
        <div className="flex flex-col gap-3 flex-grow mb-3">
          {/* Identify Dish - Skeleton */}
          <div className="bg-neutral-200 rounded-xl flex-1 flex flex-col items-center justify-center">
            <div className="w-12 h-12 bg-neutral-300 rounded-full mb-2"></div>
            <div className="h-4 bg-neutral-300 rounded-lg w-1/3 mb-1"></div>
            <div className="h-3 bg-neutral-300 rounded-lg w-1/2"></div>
          </div>
          
          {/* What's in My Kitchen - Skeleton */}
          <div className="bg-neutral-200 rounded-xl flex-1 flex flex-col items-center justify-center">
            <div className="w-12 h-12 bg-neutral-300 rounded-full mb-2"></div>
            <div className="h-4 bg-neutral-300 rounded-lg w-2/5 mb-1"></div>
            <div className="h-3 bg-neutral-300 rounded-lg w-3/5"></div>
          </div>
        </div>

        {/* Category Buttons - Skeleton */}
        <div className="grid grid-cols-2 gap-3 h-16">
          <div className="bg-neutral-200 rounded-xl flex items-center justify-center h-full"></div>
          <div className="bg-neutral-200 rounded-xl flex items-center justify-center h-full"></div>
        </div>
      </div>
    </div>
  );

  // Display loading state
  if (loadingPopular || loadingQuick) {
    return renderSkeletonHome();
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  // Actual rendered UI
  return (
    <motion.div 
      className="h-[calc(100vh-140px)] flex flex-col px-4 py-3"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Hero Banner - Compact Version */}
      <motion.div 
        className="glass-card p-3 mb-4 overflow-hidden"
        variants={itemVariants}
      >
        <div className="bg-gradient-to-r from-primary to-secondary bg-clip-text">
          <h2 className="text-lg font-bold text-transparent">Hungry but not sure what to cook?</h2>
          <p className="text-sm text-foreground/80">Snap a photo of ingredients or dish for AI suggestions</p>
        </div>
      </motion.div>

      {/* Main Container - All buttons */}
      <div className="flex flex-col h-full">
        {/* Main Options - Big Buttons */}
        <div className="flex flex-col gap-4 flex-grow mb-4">
          {/* Identify Dish - Full Width */}
          <motion.div variants={itemVariants}>
            <FloatingCard className="flex-1 p-6">
              <Link href="/identify-dish">
                <div className="flex flex-col items-center justify-center btn-3d-touch">
                  <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-primary to-secondary text-white rounded-full mb-3 shadow-lg highlight-accent">
                    <i className="ri-camera-line text-3xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold gradient-text">Identify Dish</h3>
                  <p className="text-sm text-foreground/70 text-center mt-1">Snap a photo of any meal</p>
                </div>
              </Link>
            </FloatingCard>
          </motion.div>
          
          {/* What's in My Kitchen - Full Width */}
          <motion.div variants={itemVariants}>
            <FloatingCard className="flex-1 p-6" delay={0.2}>
              <Link href="/kitchen-ingredients">
                <div className="flex flex-col items-center justify-center btn-3d-touch">
                  <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-accent to-secondary text-white rounded-full mb-3 shadow-lg highlight-accent">
                    <i className="ri-shopping-basket-2-line text-3xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold gradient-text">What's in My Kitchen</h3>
                  <p className="text-sm text-foreground/70 text-center mt-1">Find recipes based on what you have</p>
                </div>
              </Link>
            </FloatingCard>
          </motion.div>
        </div>

        {/* Category Navigation Buttons - Horizontal */}
        <motion.div 
          className="grid grid-cols-2 gap-4 h-20"
          variants={itemVariants}
        >
          <Link href="/popular-recipes">
            <AnimatedButton 
              className="h-full w-full font-medium text-sm bg-primary text-white"
              iconLeft={<i className="ri-fire-line text-lg"></i>}
            >
              Popular Recipes
            </AnimatedButton>
          </Link>
          
          <Link href="/quick-recipes">
            <AnimatedButton 
              className="h-full w-full font-medium text-sm bg-primary text-white"
              iconLeft={<i className="ri-time-line text-lg"></i>}
            >
              Quick & Easy
            </AnimatedButton>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Home;
