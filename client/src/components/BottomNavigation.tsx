import { Link, useLocation } from "wouter";

const BottomNavigation = () => {
  const [location] = useLocation();

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass px-2 py-2 flex justify-around max-w-lg mx-auto shadow-lg backdrop-blur-md border-t border-white/20 dark:border-slate-700/30 pb-safe">
      <Link href="/">
        <div className={`flex flex-col items-center p-2 rounded-xl ${
          isActive("/") 
            ? "bg-gradient-to-r from-primary to-secondary text-white" 
            : "text-foreground hover:bg-white/30 dark:hover:bg-slate-800/30"
        }`}>
          <i className="ri-home-5-line text-xl"></i>
          <span className="text-xs mt-1 font-medium">Home</span>
        </div>
      </Link>
      <Link href="/chat">
        <div className={`flex flex-col items-center p-2 rounded-xl ${
          isActive("/chat") 
            ? "bg-gradient-to-r from-primary to-secondary text-white" 
            : "text-foreground hover:bg-white/30 dark:hover:bg-slate-800/30"
        }`}>
          <i className="ri-restaurant-2-line text-xl"></i>
          <span className="text-xs mt-1 font-medium">AI Chef</span>
        </div>
      </Link>
      <Link href="/profile">
        <div className={`flex flex-col items-center p-2 rounded-xl ${
          isActive("/profile") 
            ? "bg-gradient-to-r from-primary to-secondary text-white" 
            : "text-foreground hover:bg-white/30 dark:hover:bg-slate-800/30"
        }`}>
          <i className="ri-user-line text-xl"></i>
          <span className="text-xs mt-1 font-medium">Profile</span>
        </div>
      </Link>
    </nav>
  );
};

export default BottomNavigation;
