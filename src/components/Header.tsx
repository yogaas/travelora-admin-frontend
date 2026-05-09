import { useState, useRef, useEffect } from "react";
import { Bell, Search, ChevronDown, LogOut, User as UserIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { authService } from "../services/auth.service";

export function Header() {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      clearAuth();
      navigate("/login", { replace: true });
    }
  };

  const displayName = user?.name || "Administrator";
  const displayRole = user?.role || "Global Admin";
  // Generate initials for avatar fallback
  const initials = displayName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();

  return (
    <header className="h-20 bg-white shadow-sm flex items-center justify-between px-8 sticky top-0 z-10">
      {/* Search Bar */}
      <div className="relative w-96 hidden md:block">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2.5 border border-gray-100 rounded-full bg-gray-50/50 backdrop-blur-sm text-sm placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-primary-blue/30 focus:border-primary-blue/30 transition-all duration-300"
          placeholder="Search bookings, tours, users..."
        />
      </div>

      <div className="flex-1 md:hidden"></div>

      {/* Right side */}
      <div className="flex items-center space-x-6">
        <button className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2.5 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white"></span>
        </button>

        <div className="relative" ref={dropdownRef}>
          <div 
            className="flex items-center space-x-3 cursor-pointer group select-none"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-transparent group-hover:border-primary-blue transition-all duration-300 shadow-sm bg-gradient-to-tr from-primary-blue to-blue-400 flex items-center justify-center text-white font-bold text-sm">
              {user?.avatar ? (
                <img src={user.avatar} alt={displayName} className="h-full w-full object-cover" />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div className="hidden sm:block text-sm">
              <p className="font-semibold text-text-primary group-hover:text-primary-blue transition-colors line-clamp-1">{displayName}</p>
              <p className="text-xs text-text-secondary line-clamp-1">{displayRole}</p>
            </div>
            <ChevronDown className={`h-4 w-4 text-gray-400 hidden sm:block transition-all duration-300 ${isDropdownOpen ? "rotate-180 text-primary-blue" : "group-hover:text-primary-blue"}`} />
          </div>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-premium border border-gray-50 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-2 border-b border-gray-50 mb-1 block sm:hidden">
                <p className="font-semibold text-text-primary text-sm truncate">{displayName}</p>
                <p className="text-xs text-text-secondary truncate">{user?.email}</p>
              </div>
              <button 
                onClick={() => { setIsDropdownOpen(false); navigate("/profile"); }}
                className="w-full text-left px-4 py-2 text-sm font-medium text-text-primary hover:bg-gray-50 hover:text-primary-blue transition-colors flex items-center"
              >
                <UserIcon className="w-4 h-4 mr-2" />
                My Profile
              </button>
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors flex items-center mt-1"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
