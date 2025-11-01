import React, { useEffect, useState } from "react";
import { API } from "../utils/api";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Users,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  RefreshCw,
  Loader2,
  DollarSign,
  Clock,
} from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [recentTx, setRecentTx] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, txRes] = await Promise.all([
        API.get("/admin/stats"),
        API.get("/admin/transactions"),
      ]);
      setStats(statsRes.data);
      setRecentTx(txRes.data);
      setChartData(statsRes.data.chartData);

      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const pieData = [
    { name: "Active", value: stats.activeClients || 0, color: "#10b981" },
    { name: "Inactive", value: (stats.totalclient || 0) - (stats.activeClients || 0), color: "#ef4444" },
  ];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Real-time platform overview</p>
            </div>
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all hover:shadow-lg disabled:opacity-70"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { label: "Total Balance", value: stats?.totalBalance, icon: Wallet, color: "from-purple-500 to-pink-600", change: "+12%" },
              { label: "Active Users", value: stats.activeClients, icon: Users, color: "from-green-500 to-emerald-600", change: "+5%" },
              { label: "Total Deposits", value: stats.totalDeposits, icon: ArrowUpRight, color: "from-blue-500 to-cyan-600", change: "+18%" },
              { label: "Total Withdrawals", value: stats.totalWithdraws, icon: ArrowDownRight, color: "from-red-500 to-rose-600", change: "-3%" },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${item.color} text-white shadow-lg`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    {item.change}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">{item.label}</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {item.label.includes("Balance") || item.label.includes("Deposits") || item.label.includes("Withdrawals")
                    ? `₹${(item.value || 0).toLocaleString()}`
                    : (item.value || 0).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* 📈 Line Chart - Deposits vs Withdrawals */}
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Weekly Activity</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  {/* ✅ Use date instead of day */}
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => {
                      // show in "Oct 31 (Fri)" format
                      const date = new Date(value);
                      const day = date.toLocaleDateString("en-US", { weekday: "short" });
                      const month = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                      return `${month} (${day})`;
                    }}
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                  />
                  <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                  <Tooltip
                    labelFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
                    }}
                    contentStyle={{
                      backgroundColor: "rgba(255,255,255,0.9)",
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="deposits"
                    name="Deposits"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: "#10b981" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="withdrawals"
                    name="Withdrawals"
                    stroke="#ef4444"
                    strokeWidth={3}
                    dot={{ fill: "#ef4444" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* 🧩 Pie Chart - User Status */}
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-gray-800 mb-4">User Status</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>

              {/* Legend Below Chart */}
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Inactive</span>
                </div>
              </div>
            </div>
          </div>


          {/* Recent Transactions */}
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-6 border border-white/20">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Recent Transactions</h3>
              <span className="text-sm text-gray-500 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Last updated: {lastUpdated}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-600 border-b">
                    <th className="pb-3">User</th>
                    <th className="pb-3">Type</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTx.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-8 text-gray-500">
                        No recent transactions
                      </td>
                    </tr>
                  ) : (
                    recentTx.slice(0, 5).map((tx, i) => (
                      <tr key={i} className="border-b hover:bg-purple-50/30 transition">
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {tx.userId?.name?.charAt(0) || "U"}
                            </div>
                            <span className="font-medium">{tx.userId?.name || "Unknown"}</span>
                          </div>
                        </td>
                        <td className="py-3">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${tx.type === "deposit"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                              }`}
                          >
                            {tx.type === "deposit" ? "Deposit" : "Withdrawal"}
                          </span>
                        </td>
                        <td className="py-3 font-bold">
                          {tx.type === "deposit" ? "+" : "-"}₹{tx.amount.toLocaleString()}
                        </td>
                        <td className="py-3 text-sm text-gray-600">
                          {new Date(tx.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}