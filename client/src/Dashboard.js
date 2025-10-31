import { useEffect, useState } from "react";
import axios from "axios";
const API_BASE = "http://localhost:3040/api";

export default function Dashboard({ user }) {
  const [balance, setBalance] = useState(0);
  const [plan, setPlan] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const bal = await axios.get(`${API_BASE}/wallet/balance`, { headers });
        setBalance(bal.data.amount);

        const subs = await axios.get(`${API_BASE}/subscriptions/my`, { headers });
        setPlan(subs.data.items?.[0]);
      } catch (e) {
        console.error("Failed to load dashboard data", e);
      }
    }
    load();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Welcome, {user?.name}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">
          Wallet: ₹{(balance || 0) / 100}
        </div>
        <div className="bg-white p-4 rounded shadow">
          Plan: {plan?.planId?.name || "No active plan"}
        </div>
        <div className="bg-white p-4 rounded shadow">
          Status: {plan?.status || "—"}
        </div>
      </div>
    </div>
  );
}
