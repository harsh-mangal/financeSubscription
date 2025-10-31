import { useState } from "react";
import axios from "axios";
const API_BASE = "http://localhost:3040/api";

export default function Withdraw({ token }) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("UPI");
  const [message, setMessage] = useState("");

  async function handleWithdraw() {
    try {
      await axios.post(
        `${API_BASE}/wallet/withdraw`,
        { amount: Number(amount) * 100, method },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Withdraw request submitted!");
    } catch (e) {
      setMessage(e?.response?.data?.error || "Request failed");
    }
  }

  return (
    <div className="p-6 max-w-md bg-white rounded shadow space-y-3">
      <h1 className="text-xl font-semibold">Withdraw Funds</h1>
      <input
        className="w-full border rounded p-2"
        placeholder="Amount (₹)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <select
        className="w-full border rounded p-2"
        value={method}
        onChange={(e) => setMethod(e.target.value)}
      >
        <option value="UPI">UPI</option>
        <option value="BANK">Bank Transfer</option>
      </select>
      <button
        onClick={handleWithdraw}
        className="bg-blue-600 text-white px-4 py-2 rounded w-full"
      >
        Submit Request
      </button>
      {message && <div className="text-sm text-green-600">{message}</div>}
    </div>
  );
}
