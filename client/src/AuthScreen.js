import { useState } from "react";
import axios from "axios";
const API_BASE = "http://localhost:3040/api";

export default function AuthScreen({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const url = isLogin ? "/auth/login" : "/auth/register";
      const res = await axios.post(API_BASE + url, form);
      onLogin(res.data.token, res.data.user);
    } catch (err) {
      setError(err?.response?.data?.error || "Failed");
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="bg-white p-6 rounded-xl shadow w-96 space-y-4">
        <h1 className="text-2xl font-bold text-center">
          {isLogin ? "Login" : "Register"}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-3">
          {!isLogin && (
            <input
              className="w-full border rounded p-2"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          )}
          <input
            className="w-full border rounded p-2"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            className="w-full border rounded p-2"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button className="bg-blue-600 text-white px-4 py-2 rounded w-full">
            {isLogin ? "Login" : "Register"}
          </button>
        </form>
        <button
          className="text-blue-600 text-sm w-full"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? "Create an account" : "Have an account? Login"}
        </button>
      </div>
    </div>
  );
}
