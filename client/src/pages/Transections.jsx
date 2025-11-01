import React, { useEffect, useState } from "react";
import API from "../api/axios";
import {
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Clock,
  Loader2,
  Wallet,
  AlertCircle,
} from "lucide-react";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTransactions = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get("/wallet/transactions"); // Your route
      setTransactions(res.data);
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

  return (
    <>
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

          {/* Loading State */}
          {loading && (
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-12 text-center border border-white/20">
              <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto" />
              <p className="text-gray-600 mt-4">Loading transactions...</p>
            </div>
          )}

          {/* Error State */}
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

          {/* Transactions List */}
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
                      <th className="py-5 px-6 text-left font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center py-12 text-gray-500">
                          <div className="flex flex-col items-center">
                            <Clock className="w-12 h-12 text-gray-400 mb-3" />
                            <p className="font-medium">No transactions yet</p>
                            <p className="text-sm mt-1">Your activity will appear here</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      transactions.map((tx, index) => (
                        <tr
                          key={tx._id}
                          className={`border-t border-gray-100 hover:bg-purple-50/50 transition-all duration-200 ${
                            index % 2 === 0 ? "bg-white" : "bg-purple-50/30"
                          }`}
                        >
                          {/* TYPE */}
                          <td className="py-5 px-6">
                            <div className="flex items-center space-x-3">
                              {tx.type === "deposit" ? (
                                <div className="p-2 bg-green-100 rounded-full">
                                  <ArrowUpRight className="w-5 h-5 text-green-600" />
                                </div>
                              ) : (
                                <div className="p-2 bg-red-100 rounded-full">
                                  <ArrowDownRight className="w-5 h-5 text-red-600" />
                                </div>
                              )}
                              <span className="font-medium capitalize">
                                {tx.type === "deposit" ? "Deposit" : "Withdrawal"}
                              </span>
                            </div>
                          </td>

                          {/* AMOUNT */}
                          <td className="py-5 px-6">
                            <span
                              className={`font-bold text-lg ${
                                tx.type === "deposit" ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {tx.type === "deposit" ? "+" : "-"}₹{tx.amount.toLocaleString()}
                            </span>
                          </td>

                          {/* DATE */}
                          <td className="py-5 px-6 text-gray-700">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span>{formatDate(tx.createdAt)}</span>
                            </div>
                          </td>

                          {/* STATUS */}
                          <td className="py-5 px-6">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                tx.paymentStatus
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {tx.paymentStatus ? "Success" : "Success"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {transactions.length === 0 ? (
                  <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 text-center border border-white/20">
                    <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">No transactions yet</p>
                    <p className="text-sm text-gray-500 mt-1">Start adding or withdrawing money!</p>
                  </div>
                ) : (
                  transactions.map((tx) => (
                    <div
                      key={tx._id}
                      className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-3">
                          {tx.type === "deposit" ? (
                            <div className="p-2 bg-green-100 rounded-full">
                              <ArrowUpRight className="w-6 h-6 text-green-600" />
                            </div>
                          ) : (
                            <div className="p-2 bg-red-100 rounded-full">
                              <ArrowDownRight className="w-6 h-6 text-red-600" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold capitalize">
                              {tx.type === "deposit" ? "Deposit" : "Withdrawal"}
                            </p>
                            <p className="text-sm text-gray-500 flex items-center mt-1">
                              <Calendar className="w-3 h-3 mr-1" />
                              {formatDate(tx.createdAt)}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`font-bold text-xl ${
                            tx.type === "deposit" ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {tx.type === "deposit" ? "+" : "-"}₹{tx.amount.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            tx.paymentStatus
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {tx.paymentStatus ? "Success" : "Pending"}
                        </span>
                        {tx.description && (
                          <p className="text-xs text-gray-500 italic max-w-xs truncate">
                            {tx.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}