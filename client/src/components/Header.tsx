import { Link, useLocation } from "wouter";

const Header = () => {
  const [, setLocation] = useLocation();

  const handleSearchClick = () => {
    setLocation("/search");
  };

  return (
    <header className="glass-navbar">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/">
            <div className="text-xl font-bold font-heading">
              <span className="gradient-text">SnapDish</span>
            </div>
          </Link>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleSearchClick}
            className="p-2 rounded-full bg-white/50 dark:bg-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-700/80 shadow-sm backdrop-blur-sm"
            aria-label="Search for recipes"
          >
            <i className="ri-search-line text-primary dark:text-primary-foreground"></i>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
