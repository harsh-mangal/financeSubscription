import React, { useEffect, useState } from "react";
import { API } from "../utils/api";
import {
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Users,
  TrendingUp,
  RefreshCw,
  Loader2,
  DollarSign,
  UserCheck,
  AlertCircle
} from "lucide-react";

export default function AdminStats() {
  const [stats, setStats] = useState({
    totalDeposits: 0,
    totalWithdraws: 0,
    totalBalance: 0,
    totalClients: 0,
    activeClients: 0,
    growthRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  const loadStats = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get("/admin/stats");
      setStats(res.data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      setError("Failed to load stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    // Optional: Auto-refresh every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Animated Counter Component
  const AnimatedCounter = ({ value, prefix = "", suffix = "" }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
      const start = 0;
      const end = parseFloat(value) || 0;
      const duration = 1500;
      const steps = 60;
      const increment = end / steps;
      let current = start;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        current += increment;
        if (step >= steps) {
          setDisplayValue(end);
          clearInterval(timer);
        } else {
          setDisplayValue(current);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }, [value]);

    return (
      <span className="font-bold text-3xl md:text-4xl">
        {prefix}
        {Math.round(displayValue).toLocaleString()}
        {suffix}
      </span>
    );
  };

  const statCards = [
    {
      title: "Total Deposits",
      value: stats.totalDeposits,
      icon: <ArrowUpRight className="w-8 h-8" />,
      color: "from-green-500 to-emerald-600",
      bg: "bg-green-100",
      text: "text-green-700",
    },
    {
      title: "Total Withdrawals",
      value: stats.totalWithdraws,
      icon: <ArrowDownRight className="w-8 h-8" />,
      color: "from-red-500 to-rose-600",
      bg: "bg-red-100",
      text: "text-red-700",
    },
    {
      title: "Total Balance",
      value: stats.totalBalance,
      icon: <Wallet className="w-8 h-8" />,
      color: "from-purple-500 to-pink-600",
      bg: "bg-purple-100",
      text: "text-purple-700",
    },
    {
      title: "Total Clients",
      value: stats.totalclient,
      icon: <Users className="w-8 h-8" />,
      color: "from-blue-500 to-cyan-600",
      bg: "bg-blue-100",
      text: "text-blue-700",
    },
    {
      title: "Active Clients",
      value: stats.activeClients,
      icon: <UserCheck className="w-8 h-8" />,
      color: "from-teal-500 to-green-600",
      bg: "bg-teal-100",
      text: "text-teal-700",
    },
    {
      title: "Growth Rate",
      value: stats.growthRate,
      icon: <TrendingUp className="w-8 h-8" />,
      color: "from-orange-500 to-red-600",
      bg: "bg-orange-100",
      text: "text-orange-700",
      suffix: "%",
    },
  ];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                System Statistics
              </h1>
              <p className="text-gray-600 mt-1">Real-time overview of platform performance</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={loadStats}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all hover:shadow-lg disabled:opacity-70"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
              {lastUpdated && (
                <p className="text-sm text-gray-500">
                  Updated: <span className="font-medium">{lastUpdated}</span>
                </p>
              )}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 border border-white/20 animate-pulse"
                >
                  <div className="h-8 bg-gray-200 rounded-lg w-3/4 mb-4"></div>
                  <div className="h-12 bg-gray-200 rounded-xl w-full"></div>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl flex items-center gap-3 mb-6">
              <AlertCircle className="w-6 h-6" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Stats Grid */}
          {!loading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {statCards.map((card, index) => (
                <div
                  key={index}
                  className={`bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-105`}
                >
                  {/* Icon */}
                  <div className="flex justify-between items-start mb-4">
                    <div
                      className={`p-3 rounded-2xl bg-gradient-to-br ${card.color} text-white shadow-lg`}
                    >
                      {card.icon}
                    </div>
                    {card.suffix && (
                      <span className={`text-2xl font-bold ${card.text}`}>
                        +{card.value}{card.suffix}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <p className="text-gray-600 text-sm font-medium mb-2">{card.title}</p>

                  {/* Animated Value */}
                  <div className="flex items-end gap-1">
                    {/* <DollarSign className="w-6 h-6 text-gray-400 mb-1" /> */}
                    <AnimatedCounter
                      value={card.value}
                      prefix={card.suffix ? "" : "₹"}
                      suffix={card.suffix || ""}
                    />
                  </div>

                  {/* Progress bar (optional) */}
                  {card.title === "Growth Rate" && (
                    <div className="mt-4">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${card.color} transition-all duration-1000`}
                          style={{ width: `${Math.min(card.value, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Summary Card */}
          {!loading && !error && (
            <div className="mt-8 bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 border border-white/20">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Platform Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-3xl font-bold text-green-600">
                    ₹{(stats.totalDeposits - stats.totalWithdraws).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Net Flow</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-purple-600">
                    {stats.totalClients > 0
                      ? Math.round((stats.activeClients / stats.totalClients) * 100)
                      : 0}%
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Active Rate</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-blue-600">
                    ₹
                    {stats.totalClients > 0
                      ? Math.round(stats.totalBalance / stats.totalClients)
                      : 0}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Avg. Balance</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}