import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Wallet,
  ArrowRightLeft,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: <Wallet className="w-5 h-5" /> },
    { to: "/transactions", label: "Transactions", icon: <ArrowRightLeft className="w-5 h-5" /> },
    { to: "/profile", label: "Profile", icon: <User className="w-5 h-5" /> },
  ];

  return (
    <nav className="bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link
            to="/dashboard"
            className="flex items-center space-x-2 font-bold text-xl hover:scale-105 transition-transform duration-200"
          >
            <Wallet className="w-8 h-8 text-purple-400" />
            <span className="hidden sm:block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Wallet App
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200 group"
              >
                <span className="group-hover:scale-110 transition-transform">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            ))}

            <button
              onClick={logout}
              className="flex items-center space-x-2 ml-4 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-red-500/25"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 animate-fadeIn">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-all duration-200"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}

              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 transition-all duration-200"
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