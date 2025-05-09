import { Link, useLocation } from "wouter";

const Header = () => {
  const [, setLocation] = useLocation();

  const handleSearchClick = () => {
    setLocation("/search");
  };

  return (
    <header className="glass-navbar backdrop-blur-xl">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/">
            <div className="text-xl font-bold font-heading">
              <span className="gradient-text bg-gradient-to-r from-primary via-purple-500 to-blue-500">SnapDish</span>
            </div>
          </Link>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleSearchClick}
            className="p-2 rounded-full bg-gradient-to-br from-white/60 to-white/20 dark:from-slate-800/60 dark:to-slate-800/20 shadow-md backdrop-blur-md btn-3d-touch highlight-accent"
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
