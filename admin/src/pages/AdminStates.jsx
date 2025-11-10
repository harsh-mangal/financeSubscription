import React, { useEffect, useMemo, useState } from "react";
import { API } from "../utils/api";
import {
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Users,
  TrendingUp,
  RefreshCw,
  Loader2,
  UserCheck,
  AlertCircle,
  Gift,
  PieChart,
} from "lucide-react";

export default function AdminStats() {
  const [stats, setStats] = useState({
    totalDeposits: 0,
    totalWithdraws: 0,
    totalBalance: 0,
    totalclient: 0,           // <-- matches backend key
    activeClients: 0,
    totalCommissionsPaid: 0,  // <-- new
    commissionCount: 0,       // <-- new
    commissionSplit: { signup: 0, tx: 0 }, // <-- new
    chartData: [],            // <-- new (7-day deposits/withdrawals/commissions)
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  const loadStats = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get("/admin/stats");
      setStats(res.data || {});
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      setError("Failed to load stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Compute growth rate from last 2 days of deposit totals in chartData
  const growthRate = useMemo(() => {
    const data = stats.chartData || [];
    if (data.length < 2) return 0;
    const last = Number(data[data.length - 1]?.deposits || 0);
    const prev = Number(data[data.length - 2]?.deposits || 0);
    if (prev === 0) return last > 0 ? 100 : 0;
    return Math.round(((last - prev) / prev) * 100);
  }, [stats.chartData]);

  // Animated Counter
  const AnimatedCounter = ({ value, prefix = "", suffix = "" }) => {
    const [displayValue, setDisplayValue] = useState(0);
    useEffect(() => {
      const end = parseFloat(value) || 0;
      const duration = 700;
      const steps = 40;
      const increment = end / steps;
      let current = 0;
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
      value: stats.totalDeposits || 0,
      icon: <ArrowUpRight className="w-8 h-8" />,
      color: "from-green-500 to-emerald-600",
      text: "text-green-700",
      money: true,
    },
    {
      title: "Total Withdrawals",
      value: stats.totalWithdraws || 0,
      icon: <ArrowDownRight className="w-8 h-8" />,
      color: "from-red-500 to-rose-600",
      text: "text-red-700",
      money: true,
    },
    {
      title: "Total Balance",
      value: stats.totalBalance || 0,
      icon: <Wallet className="w-8 h-8" />,
      color: "from-purple-500 to-pink-600",
      text: "text-purple-700",
      money: true,
    },
    {
      title: "Total Clients",
      value: stats.totalclient || 0, // <-- using backend key
      icon: <Users className="w-8 h-8" />,
      color: "from-blue-500 to-cyan-600",
      text: "text-blue-700",
    },
    {
      title: "Active Clients",
      value: stats.activeClients || 0,
      icon: <UserCheck className="w-8 h-8" />,
      color: "from-teal-500 to-green-600",
      text: "text-teal-700",
    },
    {
      title: "Growth Rate (Deposits d/d)",
      value: growthRate,
      icon: <TrendingUp className="w-8 h-8" />,
      color: "from-orange-500 to-red-600",
      text: "text-orange-700",
      suffix: "%",
    },
    // NEW: Total Commissions Paid
    {
      title: "Total Commissions",
      value: stats.totalCommissionsPaid || 0,
      icon: <Gift className="w-8 h-8" />,
      color: "from-indigo-500 to-violet-600",
      text: "text-indigo-700",
      money: true,
    },
  ];

  const safePct = (n, d) => (d > 0 ? Math.round((n / d) * 100) : 0);

  return (
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
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {loading ? "Refreshing..." : "Refresh"}
            </button>
            {lastUpdated && (
              <p className="text-sm text-gray-500">
                Updated: <span className="font-medium">{lastUpdated}</span>
              </p>
            )}
          </div>
        </div>

        {/* Loading Skeleton */}
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
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {statCards.map((card, index) => (
                <div
                  key={index}
                  className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-2xl bg-gradient-to-br ${card.color} text-white shadow-lg`}>
                      {card.icon}
                    </div>
                    {card.suffix && (
                      <span className={`text-2xl font-bold ${card.text}`}>
                        {card.value >= 0 ? "+" : ""}
                        {card.value}
                        {card.suffix}
                      </span>
                    )}
                  </div>

                  <p className="text-gray-600 text-sm font-medium mb-2">{card.title}</p>

                  <div className="flex items-end gap-1">
                    <AnimatedCounter
                      value={card.value}
                      prefix={card.money && !card.suffix ? "₹" : ""}
                      suffix={card.suffix || ""}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Commission Split + Quick Ratios */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Commission Split */}
              <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-indigo-600" />
                    Commission Split
                  </h3>
                  <span className="text-sm text-gray-500">
                    Total: ₹{(stats.totalCommissionsPaid || 0).toLocaleString()} •{" "}
                    {stats.commissionCount || 0} payouts
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-indigo-100 p-5">
                    <p className="text-sm text-gray-500">Signup Bonuses</p>
                    <p className="text-2xl font-bold text-indigo-700">
                      ₹{(stats.commissionSplit?.signup || 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {safePct(stats.commissionSplit?.signup || 0, (stats.totalCommissionsPaid || 0))}% of total
                    </p>
                  </div>
                  <div className="rounded-2xl border border-indigo-100 p-5">
                    <p className="text-sm text-gray-500">Per-Transaction</p>
                    <p className="text-2xl font-bold text-indigo-700">
                      ₹{(stats.commissionSplit?.tx || 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {safePct(stats.commissionSplit?.tx || 0, (stats.totalCommissionsPaid || 0))}% of total
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Ratios */}
              <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 border border-white/20">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Platform Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div>
                    <p className="text-3xl font-bold text-green-600">
                      ₹{((stats.totalDeposits || 0) - (stats.totalWithdraws || 0)).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Net Flow</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-purple-600">
                      {stats.totalclient > 0
                        ? Math.round(((stats.activeClients || 0) / stats.totalclient) * 100)
                        : 0}
                      %
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Active Rate</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-blue-600">
                      ₹
                      {stats.totalclient > 0
                        ? Math.round((stats.totalBalance || 0) / stats.totalclient)
                        : 0}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Avg. Balance / Client</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
