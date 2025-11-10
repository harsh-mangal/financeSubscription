import React, { useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate, useLocation } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  LogIn,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Wallet,
  CheckCircle,
  Phone,
  Briefcase,
  Users,
  Gift,
} from "lucide-react";

const PHONE_REGEX = /^\+?[1-9]\d{6,14}$/; // E.164

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    gender: "other",
    profession: "",
    ref: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Prefill referral code from URL
  useEffect(() => {
    const code = new URLSearchParams(location.search).get("ref");
    if (code) setForm((f) => ({ ...f, ref: String(code).toUpperCase() }));
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Basic client-side validation
    if (!PHONE_REGEX.test(form.phone)) {
      setLoading(false);
      setError(
        "Please enter a valid phone number in international format (e.g., +919876543210)."
      );
      return;
    }
    if (!["male", "female", "other"].includes(form.gender)) {
      setLoading(false);
      setError("Please select a valid gender.");
      return;
    }

    try {
      await API.post("/auth/register", {
        ...form,
        // keep referral code uppercase
        ref: form.ref?.trim().toUpperCase() || undefined,
      });
      setSuccess("Account created successfully!");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Registration failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full shadow-lg">
              <Wallet className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Wallet App
          </h1>
          <p className="text-gray-600 mt-2">Create your account in seconds</p>
        </div>

        {/* Register Card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
            Create Account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="w-5 h-5 text-purple-500" />
              </div>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200 placeholder-gray-400"
                placeholder="Full Name"
                required
              />
            </div>

            {/* Email */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="w-5 h-5 text-purple-500" />
              </div>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200 placeholder-gray-400"
                placeholder="Enter your email"
                required
              />
            </div>

            {/* Phone */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone className="w-5 h-5 text-purple-500" />
              </div>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200 placeholder-gray-400"
                placeholder="Phone (e.g., +919876543210)"
                required
              />
            </div>

            {/* Gender */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Users className="w-5 h-5 text-purple-500" />
              </div>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="w-full pl-12 pr-4 py-3 border bg-white border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Profession */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Briefcase className="w-5 h-5 text-purple-500" />
              </div>
              <input
                type="text"
                value={form.profession}
                onChange={(e) =>
                  setForm({ ...form, profession: e.target.value })
                }
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200 placeholder-gray-400"
                placeholder="Profession (e.g., Software Engineer)"
              />
            </div>

            {/* Referral Code (optional) */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Gift className="w-5 h-5 text-purple-500" />
              </div>
              <input
                type="text"
                value={form.ref}
                onChange={(e) =>
                  setForm({
                    ...form,
                    ref: e.target.value.toUpperCase().replace(/\s+/g, ""),
                  })
                }
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200 placeholder-gray-400 tracking-wider uppercase"
                placeholder="Referral Code (optional)"
              />
              {form.ref && (
                <p className="mt-1 text-xs text-gray-500 pl-1">
                  Will link your account to the referrer.
                </p>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-purple-500" />
              </div>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200 placeholder-gray-400"
                placeholder="Create a password"
                minLength="6"
                required
              />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl animate-fadeIn">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl animate-fadeIn">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">{success}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all duration-300 ${
                loading
                  ? "bg-purple-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg hover:shadow-purple-500/25 transform hover:scale-105"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Register</span>
                </>
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/login")}
              className="inline-flex items-center gap-2 text-purple-600 font-medium hover:underline hover:gap-3 transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Login</span>
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-8">
          © 2025 Wallet App. All rights reserved.
        </p>
      </div>
    </div>
  );
}
