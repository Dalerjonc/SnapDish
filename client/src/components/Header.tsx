import { Link } from "wouter";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/">
            <a className="text-xl font-bold font-heading text-neutral-800">
              <span className="text-primary">Snap</span>
              <span className="text-secondary">Dish</span>
            </a>
          </Link>
        </div>
        <div className="flex items-center space-x-3">
          <button className="p-2 rounded-full hover:bg-neutral-100">
            <i className="ri-search-line text-neutral-600"></i>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
