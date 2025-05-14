import { Link, useLocation } from "wouter";

const BottomNavigation = () => {
  const [location] = useLocation();

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-neutral-200 dark:border-gray-700 px-2 py-2 flex justify-around max-w-lg mx-auto">
      <Link href="/">
        <div className={`flex flex-col items-center p-2 ${isActive("/") ? "text-primary" : "text-neutral-500 dark:text-neutral-400"}`}>
          <i className="ri-home-5-line text-xl"></i>
          <span className="text-xs mt-1">Home</span>
        </div>
      </Link>
      <Link href="/chat">
        <div className={`flex flex-col items-center p-2 ${isActive("/chat") ? "text-primary" : "text-neutral-500 dark:text-neutral-400"}`}>
          <i className="ri-restaurant-2-line text-xl"></i>
          <span className="text-xs mt-1">AI Chef</span>
        </div>
      </Link>
      <Link href="/profile">
        <div className={`flex flex-col items-center p-2 ${isActive("/profile") ? "text-primary" : "text-neutral-500 dark:text-neutral-400"}`}>
          <i className="ri-user-line text-xl"></i>
          <span className="text-xs mt-1">Profile</span>
        </div>
      </Link>
    </nav>
  );
};

export default BottomNavigation;
