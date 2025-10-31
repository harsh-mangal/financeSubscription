import { useEffect, useState } from "react";
import axios from "axios";
const API_BASE = "http://localhost:3040/api";

export default function Wallet({ token }) {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  // Wallet.js
  async function fetchBalance() {
    const t = token || localStorage.getItem("token"); // 👈 fallback
    const res = await axios.get(`${API_BASE}/wallet/balance`, {
      headers: { Authorization: `Bearer ${t}` },
    });
    setBalance(res.data.amount);
  }

  async function addMoney(amount) {
    setLoading(true);
    try {
      const t = token || localStorage.getItem("token"); // 👈 fallback
      await axios.post(
        `${API_BASE}/wallet/add-money/order`,
        { amount },
        { headers: { Authorization: `Bearer ${t}` } }
      );
      alert("Order created! Payment must complete via Razorpay webhook.");
    } catch (e) {
      console.error(e?.response?.data || e.message);
      alert(e?.response?.data?.error || "Failed to create order");
    } finally {
      setLoading(false);
      fetchBalance();
    }
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">
        Wallet Balance: ₹{(balance || 0) / 100}
      </h1>
      <div className="flex gap-2">
        <button
          onClick={() => addMoney(19900)}
          className="bg-green-600 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          Add ₹199
        </button>
        <button
          onClick={() => addMoney(49900)}
          className="bg-green-600 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          Add ₹499
        </button>
      </div>
      <p className="text-sm text-gray-600">
        *After successful payment capture, wallet auto-updates via webhook.
      </p>
    </div>
  );
}
