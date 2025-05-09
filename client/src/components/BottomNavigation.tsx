import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";

const BottomNavigation = () => {
  const [location] = useLocation();

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 navbar px-3 py-3 flex justify-around max-w-lg mx-auto shadow-md border-t border-neutral-200 dark:border-slate-700"
    >
      <Link href="/">
        <div className={`flex flex-col items-center p-2 ${
          isActive("/") 
            ? "bg-primary/10 text-primary" 
            : "text-foreground hover:bg-neutral-100 dark:hover:bg-slate-800/50"
        }`}>
          <i className="ri-home-5-fill text-xl"></i>
          <span className="text-xs mt-1 font-medium">Home</span>
        </div>
      </Link>
      
      <Link href="/chat">
        <div className={`flex flex-col items-center p-2 ${
          isActive("/chat") 
            ? "bg-primary/10 text-primary" 
            : "text-foreground hover:bg-neutral-100 dark:hover:bg-slate-800/50"
        }`}>
          <i className="ri-restaurant-2-fill text-xl"></i>
          <span className="text-xs mt-1 font-medium">AI Chef</span>
        </div>
      </Link>
      
      <Link href="/profile">
        <div className={`flex flex-col items-center p-2 ${
          isActive("/profile") 
            ? "bg-primary/10 text-primary" 
            : "text-foreground hover:bg-neutral-100 dark:hover:bg-slate-800/50"
        }`}>
          <i className="ri-user-fill text-xl"></i>
          <span className="text-xs mt-1 font-medium">Profile</span>
        </div>
      </Link>
    </div>
  );
};

export default BottomNavigation;
