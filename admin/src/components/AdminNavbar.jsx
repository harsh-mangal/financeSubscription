import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BarChart2,
  LogOut,
  Menu,
  X,
  Shield,
} from "lucide-react";

export default function AdminNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const logout = () => {
    localStorage.clear();
    navigate("/admin/login");
  };

  const navItems = [
    { to: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { to: "/admin/clients", label: "Clients", icon: <Users className="w-5 h-5" /> },
    { to: "/admin/stats", label: "Stats", icon: <BarChart2 className="w-5 h-5" /> },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link
            to="/admin/dashboard"
            className="flex items-center space-x-3 group"
          >
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="hidden sm:block text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Admin Panel
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 group ${isActive(item.to)
                    ? "bg-white/20 text-white shadow-md"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
              >
                <span className="group-hover:scale-110 transition-transform">
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}

            <button
              onClick={logout}
              className="flex items-center space-x-2 ml-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-red-500/30 group"
            >
              <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span className="font-medium">Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 animate-fadeIn">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${isActive(item.to)
                      ? "bg-white/20 text-white font-semibold"
                      : "text-gray-300 hover:bg-white/10"
                    }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}

              <button
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 transition-all text-left"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}