import { Link, useLocation } from "wouter";
import snapdishLogo from "../assets/snapdish-logo.png";

const Header = () => {
  const [, setLocation] = useLocation();

  const handleSearchClick = () => {
    setLocation("/search");
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-sm">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/">
            <img 
              src={snapdishLogo} 
              alt="SnapDish Logo" 
              className="h-8"
            />
          </Link>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleSearchClick}
            className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-gray-800"
            aria-label="Search for recipes"
          >
            <i className="ri-search-line text-neutral-600 dark:text-neutral-400"></i>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
