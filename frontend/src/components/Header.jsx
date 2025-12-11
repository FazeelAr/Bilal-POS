import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, BarChart3, UserPlus, LogOut } from "lucide-react";
import { logout } from "../api/api"; // Assuming you have a logout function in api.js

function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show navigation on receipt page and login page
  if (
    location.pathname === "/receipt" ||
    location.pathname === "/" ||
    location.pathname === "/login"
  ) {
    return null;
  }

  const navigationItems = [
    { path: "/pos", label: "POS", icon: Home },
    { path: "/report", label: "Reports", icon: BarChart3 },
  ];

  const isActivePath = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const handleAddCustomer = () => {
    navigate("/add-customer");
  };

  const handleLogout = () => {
    // Call your logout function from api.js
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-linear-to-r from-purple-600 via-pink-500 to-rose-500 shadow-xl relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mb-32"></div>

      <div className="container mx-auto px-4 py-3 relative z-10">
        {/* Main header row - all items in one row */}
        <div className="flex items-center justify-between">
          {/* Logo and Title Section - Left side */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">🐔</span>
            </div>
            <div>
              <h1 className="text-white text-2xl font-bold tracking-tight">
                Bilal Poultry Traders
              </h1>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-white/90 text-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                  Fresh poultry rates
                </span>
                <span className="text-white/80 text-xs">•</span>
                <span className="text-white/90 text-xs">Quick sales</span>
                <span className="text-white/80 text-xs">•</span>
                <span className="text-white/90 text-xs">Trusted service</span>
              </div>
            </div>
          </div>

          {/* Centered Navigation - Now in the center of the header */}
          <nav className="flex items-center justify-center gap-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`group flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-white/25 text-white shadow-lg backdrop-blur-sm border border-white/30 transform scale-105"
                      : "text-white/90 hover:text-white hover:bg-white/15 border border-transparent hover:border-white/20"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right side buttons - Add Customer and Logout */}
          <div className="flex items-center gap-2">
            {/* Add Customer Button */}
            <button
              onClick={handleAddCustomer}
              className="bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Add Customer
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="bg-linear-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white px-4 py-2 rounded-lg transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center gap-2"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;