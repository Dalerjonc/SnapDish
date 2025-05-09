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
    <motion.nav 
      className="fixed bottom-0 left-0 right-0 glass-navbar px-3 py-3 flex justify-around max-w-lg mx-auto shadow-xl backdrop-blur-xl border-t border-white/20 dark:border-slate-700/20 pb-safe rounded-t-3xl"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", damping: 20 }}
    >
      <Link href="/">
        <div className={`flex flex-col items-center p-2.5 rounded-2xl btn-3d-touch ${
          isActive("/") 
            ? "bg-gradient-to-br from-primary/90 to-primary/70 text-white shadow-glow" 
            : "text-foreground hover:bg-white/20 dark:hover:bg-slate-800/20"
        }`}>
          <div className={`${isActive("/") ? "animate-pulse-subtle" : ""}`}>
            <i className={`ri-home-5-fill text-xl ${isActive("/") ? "text-shadow-glow" : ""}`}></i>
          </div>
          <span className="text-xs mt-1 font-medium">Home</span>
        </div>
      </Link>
      
      <Link href="/chat">
        <div className={`flex flex-col items-center p-2.5 rounded-2xl btn-3d-touch ${
          isActive("/chat") 
            ? "bg-gradient-to-br from-secondary/90 to-secondary/70 text-white shadow-glow" 
            : "text-foreground hover:bg-white/20 dark:hover:bg-slate-800/20"
        }`}>
          <div className={`${isActive("/chat") ? "animate-pulse-subtle" : ""}`}>
            <i className={`ri-restaurant-2-fill text-xl ${isActive("/chat") ? "text-shadow-glow" : ""}`}></i>
          </div>
          <span className="text-xs mt-1 font-medium">AI Chef</span>
        </div>
      </Link>
      
      <Link href="/profile">
        <div className={`flex flex-col items-center p-2.5 rounded-2xl btn-3d-touch ${
          isActive("/profile") 
            ? "bg-gradient-to-br from-accent/90 to-accent/70 text-white shadow-glow" 
            : "text-foreground hover:bg-white/20 dark:hover:bg-slate-800/20"
        }`}>
          <div className={`${isActive("/profile") ? "animate-pulse-subtle" : ""}`}>
            <i className={`ri-user-fill text-xl ${isActive("/profile") ? "text-shadow-glow" : ""}`}></i>
          </div>
          <span className="text-xs mt-1 font-medium">Profile</span>
        </div>
      </Link>
    </motion.nav>
  );
};

export default BottomNavigation;
