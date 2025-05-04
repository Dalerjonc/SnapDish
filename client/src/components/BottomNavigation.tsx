import { Link, useLocation } from "wouter";

const BottomNavigation = () => {
  const [location] = useLocation();

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 px-2 py-2 flex justify-around max-w-lg mx-auto">
      <Link href="/">
        <a className={`flex flex-col items-center p-2 ${isActive("/") ? "text-primary" : "text-neutral-500"}`}>
          <i className="ri-home-5-line text-xl"></i>
          <span className="text-xs mt-1">Home</span>
        </a>
      </Link>
      <Link href="/chat">
        <a className={`flex flex-col items-center p-2 ${isActive("/chat") ? "text-primary" : "text-neutral-500"}`}>
          <i className="ri-message-3-line text-xl"></i>
          <span className="text-xs mt-1">AI Chat</span>
        </a>
      </Link>
      <Link href="/profile">
        <a className={`flex flex-col items-center p-2 ${isActive("/profile") ? "text-primary" : "text-neutral-500"}`}>
          <i className="ri-user-line text-xl"></i>
          <span className="text-xs mt-1">Profile</span>
        </a>
      </Link>
    </nav>
  );
};

export default BottomNavigation;
