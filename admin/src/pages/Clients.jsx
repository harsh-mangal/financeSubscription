import React, { useEffect, useState } from "react";
import { API } from "../utils/api";
import {
  Plus,
  Minus,
  Search,
  Loader2,
  AlertCircle,
  UserCheck,
  UserX,
  Wallet,
  RefreshCw,
  X,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Gift,
} from "lucide-react";

export default function AdminClients() {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // Money Modal
  const [moneyModal, setMoneyModal] = useState({
    open: false,
    type: "",
    client: null,
    amount: "",
    note: "",
  });

  // Transactions Modal
  const [txModal, setTxModal] = useState({
    open: false,
    client: null,
    transactions: [],
    loading: false,
    txSearch: "",
    typeFilter: "all",
  });

  const [processing, setProcessing] = useState(false);

  // Load clients
  const loadClients = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get("/admin/clients");
      setClients(res.data || []);
      setFilteredClients(res.data || []);
    } catch (err) {
      setError("Failed to load clients.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  // Search clients (name, email, referralCode)
  useEffect(() => {
    const q = (search || "").toLowerCase().trim();
    const filtered = clients.filter((c) => {
      const rc = (c.referralCode || "").toLowerCase();
      return (
        (c.name || "").toLowerCase().includes(q) ||
        (c.email || "").toLowerCase().includes(q) ||
        rc.includes(q)
      );
    });
    setFilteredClients(filtered);
  }, [search, clients]);

  // Toggle status
  const toggleStatus = async (id, current) => {
    setProcessing(true);
    try {
      await API.put(`/admin/client/${id}/status`, { status: !current });
      await loadClients();
    } catch (err) {
      setError("Failed to update status.");
    } finally {
      setProcessing(false);
    }
  };

  // Open Money Modal
  const openMoneyModal = (type, client) => {
    setMoneyModal({ open: true, type, client, amount: "", note: "" });
    setError("");
  };

  // Handle money add/withdraw
  const handleMoney = async () => {
    const amount = parseFloat(moneyModal.amount);
    if (!amount || amount <= 0) {
      setError("Enter a valid amount");
      return;
    }

    setProcessing(true);
    try {
      const endpoint =
        moneyModal.type === "add"
          ? `/admin/client/${moneyModal.client._id}/add`
          : `/admin/client/${moneyModal.client._id}/withdraw`;

      await API.post(endpoint, { amount, note: moneyModal.note || "" });
      setMoneyModal({ ...moneyModal, open: false, amount: "", note: "" });
      await loadClients();
    } catch (err) {
      setError(err.response?.data?.message || "Transaction failed");
    } finally {
      setProcessing(false);
    }
  };

  // Open Transactions Modal
  const openTxModal = async (client) => {
    setTxModal({ ...txModal, open: true, client, loading: true });
    try {
      const res = await API.get(`/admin/transactionsById`, {
        params: { userId: client._id },
      });
      setTxModal((prev) => ({
        ...prev,
        transactions: res.data || [],
        loading: false,
      }));
    } catch (err) {
      setError("Failed to load transactions");
      setTxModal((prev) => ({ ...prev, loading: false }));
    }
  };

  // Filter transactions
  const filteredTx = txModal.transactions.filter((tx) => {
    const searchQ = (txModal.txSearch || "").toLowerCase();
    const detailsStr = [
      tx.description,
      tx.note,
      tx.commissionKind,
      tx?.sourceUserId?.email,
      tx?.sourceUserId?.name,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch =
      detailsStr.includes(searchQ) ||
      (tx.type || "").toLowerCase().includes(searchQ);

    const typeAllowed =
      txModal.typeFilter === "all" ||
      tx.type === txModal.typeFilter; // 'deposit'|'withdraw'|'commission'

    return matchesSearch && typeAllowed;
  });

  const formatDate = (date) => {
    return new Date(date).toLocaleString([], {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

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
        label: "Withdraw",
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
      label:
        tx.commissionKind === "signup"
          ? "Commission (Signup)"
          : "Commission",
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
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Client Management
              </h1>
              <p className="text-gray-600 mt-1">Manage all users, wallets & referrals</p>
            </div>
            <button
              onClick={loadClients}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all hover:shadow-lg"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, or referral code..."
                className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              />
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-12 text-center border border-white/20">
              <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto" />
              <p className="text-gray-600 mt-4">Loading clients...</p>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl flex items-center gap-3 mb-6">
              <AlertCircle className="w-6 h-6" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Desktop Table */}
          <div className="hidden md:block bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl overflow-hidden border border-white/20">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-purple-100 to-pink-100 text-gray-700">
                  <th className="py-5 px-6 text-left font-semibold">Client</th>
                  <th className="py-5 px-6 text-left font-semibold">Email</th>
                  <th className="py-5 px-6 text-left font-semibold">Balance</th>
                  <th className="py-5 px-6 text-left font-semibold">Referral Code</th>
                  <th className="py-5 px-6 text-left font-semibold">Referred By</th>
                  <th className="py-5 px-6 text-left font-semibold">Referrals</th>
                  <th className="py-5 px-6 text-left font-semibold">Status</th>
                  <th className="py-5 px-6 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-12 text-gray-500">
                      No clients found
                    </td>
                  </tr>
                ) : (
                  filteredClients.map((c) => (
                    <tr
                      key={c._id}
                      className="border-t border-gray-100 hover:bg-purple-50/50 transition-all"
                    >
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                            {(c.name || "?").charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium">{c.name || "—"}</span>
                        </div>
                      </td>
                      <td className="py-5 px-6 text-gray-600">{c.email}</td>
                      <td className="py-5 px-6">
                        <span className="font-bold text-lg text-green-600">
                          ₹{Number(c.balance || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="py-5 px-6 font-mono text-sm tracking-wider">
                        {c.referralCode || "—"}
                      </td>
                      <td className="py-5 px-6 text-sm text-gray-700">
                        {c.referredBy ? (
                          <>
                            <div className="font-medium">{c.referredBy.name || "—"}</div>
                            <div className="text-gray-500">{c.referredBy.email || "—"}</div>
                          </>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-5 px-6 text-sm">
                        <div className="font-medium">
                          Count: {c?.referral?.referredCount ?? 0}
                        </div>
                        <div className="text-gray-600">
                          Earnings: ₹{Number(c?.referral?.earnings || 0).toLocaleString()}
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <button
                          onClick={() => toggleStatus(c._id, c.status)}
                          disabled={processing}
                          className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-all ${
                            c.status
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-red-100 text-red-700 hover:bg-red-200"
                          }`}
                        >
                          {c.status ? (
                            <>
                              <UserCheck className="w-4 h-4" /> Active
                            </>
                          ) : (
                            <>
                              <UserX className="w-4 h-4" /> Inactive
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openMoneyModal("add", c)}
                            className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition text-sm"
                          >
                            <Plus className="w-4 h-4" /> Add
                          </button>
                          <button
                            onClick={() => openMoneyModal("withdraw", c)}
                            className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition text-sm"
                          >
                            <Minus className="w-4 h-4" /> Withdraw
                          </button>
                          <button
                            onClick={() => openTxModal(c)}
                            className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition text-sm"
                          >
                            <Wallet className="w-4 h-4" /> Transactions
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {filteredClients.map((c) => (
              <div
                key={c._id}
                className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-lg p-6 border border-white/20"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {(c.name || "?").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{c.name || "—"}</p>
                      <p className="text-sm text-gray-600">{c.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Code: <span className="font-mono">{c.referralCode || "—"}</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        By: {c.referredBy ? c.referredBy.name : "—"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleStatus(c._id, c.status)}
                    className={`p-2 rounded-full ${c.status ? "bg-green-100" : "bg-red-100"}`}
                  >
                    {c.status ? (
                      <UserCheck className="w-5 h-5 text-green-600" />
                    ) : (
                      <UserX className="w-5 h-5 text-red-600" />
                    )}
                  </button>
                </div>

                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-gray-600">Balance</span>
                  <span className="font-bold text-xl text-green-600">
                    ₹{Number(c.balance || 0).toLocaleString()}
                  </span>
                </div>

                <div className="text-xs text-gray-600 mb-3">
                  Referrals: <span className="font-medium">{c?.referral?.referredCount ?? 0}</span> • Earnings:{" "}
                  <span className="font-medium">₹{Number(c?.referral?.earnings || 0).toLocaleString()}</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => openMoneyModal("add", c)}
                    className="flex items-center justify-center gap-1 py-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition text-sm"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                  <button
                    onClick={() => openMoneyModal("withdraw", c)}
                    className="flex items-center justify-center gap-1 py-2 bg-yellow-100 text-yellow-700 rounded-xl hover:bg-yellow-200 transition text-sm"
                  >
                    <Minus className="w-4 h-4" /> Withdraw
                  </button>
                  <button
                    onClick={() => openTxModal(c)}
                    className="flex items-center justify-center gap-1 py-2 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition text-sm"
                  >
                    <Wallet className="w-4 h-4" /> Tx
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Money Modal */}
      {moneyModal.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative">
            <button
              onClick={() => setMoneyModal({ ...moneyModal, open: false })}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center mb-6">
              <div className="inline-flex p-3 bg-purple-100 rounded-full mb-4">
                {moneyModal.type === "add" ? (
                  <Plus className="w-8 h-8 text-purple-600" />
                ) : (
                  <Minus className="w-8 h-8 text-red-600" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                {moneyModal.type === "add" ? "Add Money" : "Withdraw Money"}
              </h2>
              <p className="text-gray-600 mt-1">
                Client: <span className="font-bold">{moneyModal.client.name}</span>
              </p>
            </div>

            <div className="space-y-4">
              <input
                type="number"
                value={moneyModal.amount}
                onChange={(e) => setMoneyModal({ ...moneyModal, amount: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                placeholder="0.00"
                min="1"
                step="0.01"
              />

              <input
                type="text"
                value={moneyModal.note}
                onChange={(e) => setMoneyModal({ ...moneyModal, note: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                placeholder="Note (optional)"
              />

              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <button
                onClick={handleMoney}
                disabled={processing || !moneyModal.amount}
                className={`w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all ${
                  processing || !moneyModal.amount
                    ? "bg-gray-400 cursor-not-allowed"
                    : moneyModal.type === "add"
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-lg"
                    : "bg-gradient-to-r from-red-500 to-rose-600 hover:shadow-lg"
                }`}
              >
                {processing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Wallet className="w-5 h-5" />
                    <span>
                      {moneyModal.type === "add" ? "Add" : "Withdraw"} ₹{moneyModal.amount || "0"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transactions Modal */}
      {txModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Transaction History</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Client: <span className="font-semibold">{txModal.client.name}</span> ({txModal.client.email})
                </p>
              </div>
              <button
                onClick={() => setTxModal({ ...txModal, open: false })}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Search & Filter */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={txModal.txSearch}
                    onChange={(e) => setTxModal({ ...txModal, txSearch: e.target.value })}
                    placeholder="Search transactions (type, note, referred user)..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <select
                  value={txModal.typeFilter}
                  onChange={(e) => setTxModal({ ...txModal, typeFilter: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  <option value="all">All Types</option>
                  <option value="deposit">Deposit</option>
                  <option value="withdraw">Withdraw</option>
                  <option value="commission">Commission</option>
                </select>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4">
              {txModal.loading ? (
                <div className="text-center py-12">
                  <Loader2 className="w-10 h-10 animate-spin text-purple-600 mx-auto" />
                  <p className="text-gray-600 mt-3">Loading transactions...</p>
                </div>
              ) : filteredTx.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Wallet className="w-16 h-16 mx-auto mb-3 text-gray-300" />
                  <p>No transactions found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTx.map((tx) => {
                    const meta = typeMeta(tx);
                    return (
                      <div
                        key={tx._id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${meta.iconBg}`}>
                            <meta.Icon className={`w-5 h-5 ${meta.iconColor}`} />
                          </div>
                          <div>
                            <p className="font-medium">{meta.label}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(tx.createdAt || tx.date)}
                            </p>
                            {tx.type === "commission" && (
                              <p className="text-xs text-indigo-700 mt-0.5">
                                {tx.commissionKind === "signup"
                                  ? "Signup bonus"
                                  : "Per-transaction commission"}
                                {tx?.sourceUserId
                                  ? ` • From: ${tx.sourceUserId.name || ""} (${tx.sourceUserId.email || ""})`
                                  : ""}
                                {tx.note ? ` • ${tx.note}` : ""}
                              </p>
                            )}
                            {tx.type !== "commission" && tx.note && (
                              <p className="text-xs text-gray-600 mt-0.5">Note: {tx.note}</p>
                            )}
                          </div>
                        </div>
                        <span className={`font-bold text-lg ${meta.amountColor}`}>
                          {meta.amountPrefix}₹{Number(tx.amount || 0).toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
