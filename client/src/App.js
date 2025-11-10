// src/App.jsx
import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transections"; // ✅ fixed the typo
import Navbar from "./components/Navbar";
import Profile from "./pages/Profile";

/** Sync auth token with localStorage changes (login/logout in other tabs too) */
function useAuthToken() {
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "token") setToken(localStorage.getItem("token"));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Also update when same-tab sets/removes token
  useEffect(() => {
    const originalSetItem = localStorage.setItem;
    const originalRemoveItem = localStorage.removeItem;

    localStorage.setItem = function (key, value) {
      originalSetItem.apply(this, arguments);
      if (key === "token") setToken(value);
    };
    localStorage.removeItem = function (key) {
      originalRemoveItem.apply(this, arguments);
      if (key === "token") setToken(localStorage.getItem("token"));
    };
    return () => {
      localStorage.setItem = originalSetItem;
      localStorage.removeItem = originalRemoveItem;
    };
  }, []);

  return token;
}

/** Scroll to top on route change (nice UX for mobile) */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  const token = useAuthToken();

  return (
    <BrowserRouter>
      <ScrollToTop />

      {/* ✅ Navbar only when authenticated */}
      {token && <Navbar />}

      <Routes>
        {/* Redirect root intelligently */}
        <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} replace />} />

        {/* Public */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        {/* Alias for referral links like /signup?ref=ABCD1234 */}
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Private */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <PrivateRoute>
              <Transactions />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />

        {/* 404 */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center p-8 text-center">
              <div>
                <h1 className="text-3xl font-bold mb-2">404 — Page Not Found</h1>
                <p className="text-gray-600 mb-6">The page you’re looking for doesn’t exist.</p>
                <a
                  href={token ? "/dashboard" : "/login"}
                  className="inline-block px-4 py-2 rounded-xl text-white bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  Go {token ? "to Dashboard" : "to Login"}
                </a>
              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
