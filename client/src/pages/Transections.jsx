import React, { useEffect, useMemo, useState } from "react";
import API from "../api/axios";
import {
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Clock,
  Loader2,
  Wallet,
  AlertCircle,
  Gift,
  Info,
} from "lucide-react";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTransactions = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get("/wallet/transactions");
      setTransactions(res.data || []);
    } catch (err) {
      setError("Failed to load transactions. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return `Today, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
    }
  };

  const sumByType = (type) =>
    transactions
      .filter((t) => t.type === type)
      .reduce((acc, t) => acc + Number(t.amount || 0), 0);

  const totals = useMemo(
    () => ({
      deposits: sumByType("deposit"),
      withdrawals: sumByType("withdraw"),
      commissions: sumByType("commission"), // earned by this user as referrer
    }),
    [transactions]
  );

  const typeMeta = (tx) => {
    if (tx.type === "deposit") {
      return {
        label: "Deposit",
        iconBg: "bg-green-100",
        iconColor: "text-green-600",
        Icon: ArrowUpRight,
        amountPrefix: "+",
        amountColor: "text-green-600",
        badgeBg: "bg-green-100",
        badgeText: "text-green-700",
        statusText: "Success",
      };
    }
    if (tx.type === "withdraw") {
      return {
        label: "Withdrawal",
        iconBg: "bg-red-100",
        iconColor: "text-red-600",
        Icon: ArrowDownRight,
        amountPrefix: "-",
        amountColor: "text-red-600",
        badgeBg: "bg-yellow-100",
        badgeText: "text-yellow-700",
        statusText: "Success",
      };
    }
    // commission
    return {
      label: tx.commissionKind === "signup" ? "Commission (Signup)" : "Commission",
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
      Icon: Gift,
      amountPrefix: "+",
      amountColor: "text-indigo-700",
      badgeBg: "bg-indigo-100",
      badgeText: "text-indigo-700",
      statusText: "Credited",
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full shadow-inner">
              <Wallet className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Transaction History
          </h1>
          <p className="text-gray-600 mt-2">All your wallet activities in one place</p>
        </div>

        {/* Top Summary */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white/80 border border-white/20 rounded-2xl p-5 shadow">
              <div className="text-sm text-gray-500">Total Deposits</div>
              <div className="text-2xl font-bold text-green-600 mt-1">₹{totals.deposits.toLocaleString()}</div>
            </div>
            <div className="bg-white/80 border border-white/20 rounded-2xl p-5 shadow">
              <div className="text-sm text-gray-500">Total Withdrawals</div>
              <div className="text-2xl font-bold text-red-600 mt-1">₹{totals.withdrawals.toLocaleString()}</div>
            </div>
            <div className="bg-white/80 border border-white/20 rounded-2xl p-5 shadow">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Total Commissions Earned</span>
                <Info className="w-4 h-4 text-indigo-500" title="Earnings credited for referrals" />
              </div>
              <div className="text-2xl font-bold text-indigo-700 mt-1">₹{totals.commissions.toLocaleString()}</div>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-12 text-center border border-white/20">
            <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto" />
            <p className="text-gray-600 mt-4">Loading transactions...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl text-center flex flex-col items-center">
            <AlertCircle className="w-8 h-8 mb-2" />
            <p className="font-medium">{error}</p>
            <button
              onClick={fetchTransactions}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* Transactions */}
        {!loading && !error && (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl overflow-hidden border border-white/20">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-purple-100 to-pink-100 text-gray-700">
                    <th className="py-5 px-6 text-left font-semibold">Type</th>
                    <th className="py-5 px-6 text-left font-semibold">Amount</th>
                    <th className="py-5 px-6 text-left font-semibold">Date & Time</th>
                    <th className="py-5 px-6 text-left font-semibold">Details</th>
                    <th className="py-5 px-6 text-left font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-12 text-gray-500">
                        <div className="flex flex-col items-center">
                          <Clock className="w-12 h-12 text-gray-400 mb-3" />
                          <p className="font-medium">No transactions yet</p>
                          <p className="text-sm mt-1">Your activity will appear here</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx, index) => {
                      const meta = typeMeta(tx);
                      return (
                        <tr
                          key={tx._id}
                          className={`border-t border-gray-100 hover:bg-purple-50/50 transition-all duration-200 ${
                            index % 2 === 0 ? "bg-white" : "bg-purple-50/30"
                          }`}
                        >
                          {/* TYPE */}
                          <td className="py-5 px-6">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 ${meta.iconBg} rounded-full`}>
                                <meta.Icon className={`w-5 h-5 ${meta.iconColor}`} />
                              </div>
                              <span className="font-medium">{meta.label}</span>
                            </div>
                          </td>

                          {/* AMOUNT */}
                          <td className="py-5 px-6">
                            <span className={`font-bold text-lg ${meta.amountColor}`}>
                              {meta.amountPrefix}₹{Number(tx.amount || 0).toLocaleString()}
                            </span>
                          </td>

                          {/* DATE */}
                          <td className="py-5 px-6 text-gray-700">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span>{formatDate(tx.createdAt || tx.date)}</span>
                            </div>
                          </td>

                          {/* DETAILS (commissionKind, note) */}
                          <td className="py-5 px-6 text-sm text-gray-600">
                            {tx.type === "commission" ? (
                              <div className="space-y-0.5">
                                <div className="font-medium text-indigo-700">
                                  {tx.commissionKind === "signup" ? "Signup bonus" : "Per-transaction commission"}
                                </div>
                                {tx.note && <div className="text-xs text-gray-500">• {tx.note}</div>}
                              </div>
                            ) : (
                              <span className="text-gray-500">—</span>
                            )}
                          </td>

                          {/* STATUS */}
                          <td className="py-5 px-6">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                tx.type === "commission"
                                  ? `${meta.badgeBg} ${meta.badgeText}`
                                  : meta.badgeBg + " " + meta.badgeText
                              }`}
                            >
                              {meta.statusText}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4 mt-4">
              {transactions.length === 0 ? (
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 text-center border border-white/20">
                  <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">No transactions yet</p>
                  <p className="text-sm text-gray-500 mt-1">Start adding or withdrawing money!</p>
                </div>
              ) : (
                transactions.map((tx) => {
                  const meta = typeMeta(tx);
                  return (
                    <div
                      key={tx._id}
                      className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 ${meta.iconBg} rounded-full`}>
                            <meta.Icon className={`w-6 h-6 ${meta.iconColor}`} />
                          </div>
                          <div>
                            <p className="font-semibold">{meta.label}</p>
                            <p className="text-sm text-gray-500 flex items-center mt-1">
                              <Calendar className="w-3 h-3 mr-1" />
                              {formatDate(tx.createdAt || tx.date)}
                            </p>
                          </div>
                        </div>
                        <span className={`font-bold text-xl ${meta.amountColor}`}>
                          {meta.amountPrefix}₹{Number(tx.amount || 0).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${meta.badgeBg} ${meta.badgeText}`}
                        >
                          {meta.statusText}
                        </span>
                        {/* Details */}
                        {tx.type === "commission" && (
                          <div className="text-xs text-indigo-700 font-medium">
                            {tx.commissionKind === "signup" ? "Signup bonus" : "Per-transaction commission"}
                            {tx.note ? <span className="text-gray-500"> • {tx.note}</span> : null}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
