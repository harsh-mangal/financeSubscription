import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Dashboard from "./Dashboard";
import Wallet from "./Wallet";
import Withdraw from "./Withdraw";
import Plans from "./Plans";
import AuthScreen from "./AuthScreen";

const API_BASE = "http://localhost:3040/api";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      axios
        .get(API_BASE + "/auth/me", { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => setUser(res.data.user))
        .catch(() => setToken(null));
    }
  }, [token]);

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }

  if (!token)
    return <AuthScreen onLogin={(t, u) => { setToken(t); setUser(u); localStorage.setItem("token", t); }} />;

  return (
    <BrowserRouter>
      <nav className="flex justify-between p-4 bg-gray-100 border-b">
        <div className="font-bold">Finance Subscription</div>
        <div className="flex gap-4">
          <Link to="/">Dashboard</Link>
          <Link to="/plans">Plans</Link>
          <Link to="/wallet">Wallet</Link>
          <Link to="/withdraw">Withdraw</Link>
          <button onClick={logout} className="text-red-600">Logout</button>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Dashboard user={user} />} />
        <Route path="/plans" element={<Plans token={token} />} />
        <Route path="/wallet" element={<Wallet token={token} />} />
        <Route path="/withdraw" element={<Withdraw token={token} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
