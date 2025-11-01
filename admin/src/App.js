import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/Dashboard";
import AdminClients from "./pages/Clients";
import AdminStats from "./pages/AdminStates";
import AdminNavbar from "./components/AdminNavbar";

// ✅ Private Route: Only allow access if logged in
function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/admin/login" />;
}

export default function App() {
  const token = localStorage.getItem("token");

  return (
    <BrowserRouter>
      {/* ✅ Navbar only visible when logged in */}
      {token && <AdminNavbar />}

      <Routes>
        {/* ✅ Default route redirect */}
        <Route path="/" element={<Navigate to="/admin/login" />} />

        {/* ✅ Public route */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* ✅ Protected routes */}
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/clients"
          element={
            <PrivateRoute>
              <AdminClients />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/stats"
          element={
            <PrivateRoute>
              <AdminStats />
            </PrivateRoute>
          }
        />

        {/* ✅ Fallback */}
        <Route path="*" element={<Navigate to="/admin/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
