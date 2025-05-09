import { Link, useLocation } from "wouter";

const Header = () => {
  const [, setLocation] = useLocation();

  const handleSearchClick = () => {
    setLocation("/search");
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/">
            <div className="flex items-center">
              <img 
                src="/snapdish-logo-final.png" 
                alt="SnapDish Logo" 
                className="h-16 mr-2" 
                style={{ margin: '2px 0' }}
              />
            </div>
          </Link>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleSearchClick}
            className="p-2 rounded-full hover:bg-neutral-100"
            aria-label="Search for recipes"
          >
            <i className="ri-search-line text-neutral-600"></i>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
