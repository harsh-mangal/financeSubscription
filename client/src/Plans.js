import { useEffect, useState } from "react";
import axios from "axios";
const API_BASE = "http://localhost:3040/api";

export default function Plans({ token }) {
  const [plans, setPlans] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const res = await axios.get(`${API_BASE}/plans?active=true`);
      setPlans(res.data.items);
    }
    load();
  }, []);

  async function subscribe(planId) {
    setMessage("Processing...");
    try {
      const res = await axios.post(
        `${API_BASE}/subscriptions/start`,
        { planId, useWallet: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Subscribed successfully!");
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to subscribe");
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Plans</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {plans.map((p) => (
          <div key={p._id} className="bg-white p-4 rounded shadow">
            <div className="text-lg font-semibold">{p.name}</div>
            <div className="text-xl font-bold mt-1">₹{p.price / 100}</div>
            <div className="text-sm text-gray-500">
              {p.durationDays} days
            </div>
            <button
              className="mt-3 w-full bg-blue-600 text-white py-2 rounded"
              onClick={() => subscribe(p._id)}
            >
              Subscribe via Wallet
            </button>
          </div>
        ))}
      </div>
      {message && <div className="text-green-600 text-sm">{message}</div>}
    </div>
  );
}
