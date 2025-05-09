import { Link, useLocation } from "wouter";

const Header = () => {
  const [, setLocation] = useLocation();

  const handleSearchClick = () => {
    setLocation("/search");
  };

  return (
    <header className="navbar">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/">
            <div className="text-xl font-bold font-heading">
              <span className="text-primary">SnapDish</span>
            </div>
          </Link>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleSearchClick}
            className="p-2 rounded-full bg-neutral-100 dark:bg-slate-800 shadow-sm"
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
