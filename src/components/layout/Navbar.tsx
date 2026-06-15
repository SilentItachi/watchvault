import React from "react";
import { Film, User, Search, Home, Clapperboard, LogOut, Sun, Moon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

interface NavbarProps {
  currentTab: string;
  setTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setTab }) => {
  const { profile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "watchlist", label: "Watchlist", icon: Clapperboard },
    { id: "search", label: "Search Content", icon: Search },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/70 dark:bg-neutral-900/70 border-b border-gray-100 dark:border-neutral-800 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div 
            onClick={() => setTab("dashboard")} 
            className="flex items-center gap-2.5 cursor-pointer group active:scale-95 transition-transform duration-100"
          >
            <div className="h-9 w-9 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:rotate-6 transition-transform duration-200">
              <Film className="h-5 w-5" />
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-neutral-300 bg-clip-text text-transparent">
              Watch<span className="text-indigo-600 dark:text-indigo-400">Vault</span>
            </span>
          </div>

          {/* Desktop Navigation links */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
                      : "text-gray-600 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-gray-55/50 dark:hover:bg-neutral-800/80"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Utility Buttons */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2.5 rounded-xl border border-gray-100 dark:border-neutral-850 hover:bg-gray-50 dark:hover:bg-neutral-800 text-gray-500 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-neutral-100 cursor-pointer transition-colors duration-150"
            >
              {theme === "dark" ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>

            {/* User metadata & Sign Out */}
            {profile && (
              <div className="flex items-center gap-3.5 pl-3 border-l border-gray-100 dark:border-neutral-800">
                <button
                  onClick={() => setTab("profile")}
                  className="flex items-center gap-2.5 cursor-pointer max-w-[160px]"
                >
                  {profile.photoURL ? (
                    <img
                      src={profile.photoURL}
                      alt={profile.displayName}
                      referrerPolicy="no-referrer"
                      className="h-8.5 w-8.5 rounded-full object-cover border-2 border-indigo-500/20"
                    />
                  ) : (
                    <div className="h-8.5 w-8.5 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-white font-bold flex items-center justify-center text-xs shadow-md shadow-indigo-500/10">
                      {profile.displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden lg:inline text-xs font-semibold text-gray-800 dark:text-neutral-200 truncate max-w-[80px]">
                    {profile.displayName}
                  </span>
                </button>

                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-1 px-2.5 text-xs font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4 lg:hidden" />
                  <span className="hidden lg:inline">Exit</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar at bottom or side */}
        <div className="md:hidden flex justify-around py-2 border-t border-gray-100 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 fixed bottom-0 left-0 right-0 z-40">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`flex flex-col items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-[10px] font-bold ${
                  isActive
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-gray-400 dark:text-neutral-500"
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
