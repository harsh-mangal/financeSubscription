import React, { useEffect, useState } from "react";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import {
    Wallet,
    Plus,
    Minus,
    AlertCircle,
    CheckCircle,
    Loader2,
    X
} from "lucide-react";

export default function Dashboard() {
    const [balance, setBalance] = useState(0);
    const [amount, setAmount] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState(""); // 'add' or 'withdraw'
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [status, setStatus] = useState()

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await API.get("/wallet/profile");
                setStatus(res.data?.status);
                console.log(res.data?.status);

            } catch (err) {
                setError("Failed to load profile. Please try again.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [])

    const fetchBalance = async () => {
        setFetching(true);
        try {
            const res = await API.get("/wallet/balance");
            setBalance(res.data.balance);
        } catch (err) {
            console.error(err);
        } finally {
            setFetching(false);
        }
    };

    const handleSubmit = async () => {
        const numAmount = parseFloat(amount);
        if (!numAmount || numAmount <= 0) {
            setError("Please enter a valid amount");
            return;
        }

        if (modalType === "withdraw" && numAmount > balance) {
            setError("Insufficient balance");
            return;
        }

        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const endpoint = modalType === "add" ? "/wallet/add" : "/wallet/withdraw";
            await API.post(endpoint, { amount: numAmount });
            setSuccess(`₹${numAmount} ${modalType === "add" ? "added" : "withdrawn"} successfully!`);
            setAmount("");
            fetchBalance();
            setTimeout(() => {
                setIsModalOpen(false);
                setSuccess("");
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const openModal = (type) => {
        setModalType(type);
        setIsModalOpen(true);
        setError("");
        setSuccess("");
        setAmount("");
    };

    useEffect(() => {
        fetchBalance();
    }, []);

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 md:p-8">
                <div className="max-w-4xl mx-auto">

                    {/* Balance Card */}
                    <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 md:p-12 text-center border border-white/20">
                        {fetching ? (
                            <div className="flex justify-center">
                                <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-center mb-4">
                                    <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full shadow-inner">
                                        <Wallet className="w-12 h-12 text-white" />
                                    </div>
                                </div>
                                <p className="text-gray-600 text-sm md:text-base font-medium">Wallet Balance</p>
                                <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mt-2">
                                    ₹{balance.toLocaleString()}
                                </h1>
                            </>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-10">
                        <button
                            disabled={!status}
                            onClick={() => openModal("add")}
                            className={`group flex items-center justify-center space-x-3 px-8 py-5 rounded-2xl shadow-lg transform transition-all duration-300
                                     ${!status
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-xl hover:scale-105"
                                }`}
                        >

                            <>
                                <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform" />
                                <span className="text-lg font-semibold">{!status ? "Add Money (User Not Active)" : 'Add Money'}</span>
                            </>
                        </button>


                        <button
                            onClick={() => openModal("withdraw")}
                            disabled={!status || balance === 0}
                            className={`group flex items-center justify-center space-x-3 px-8 py-5 rounded-2xl shadow-lg transform transition-all duration-300
                            ${!status || balance === 0
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-gradient-to-r from-red-500 to-rose-600 text-white hover:shadow-xl hover:scale-105"
                                }`}
                        >
                            <>
                                <Minus className="w-7 h-7 group-hover:-rotate-90 transition-transform" />
                                <span className="text-lg font-semibold">{!status ? 'Withdraw (User Not Active)' : 'Withdraw'}</span>
                            </>

                        </button>

                    </div>

                    {/* Recent Activity Placeholder */}
                    {/* <div className="mt-12 bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Recent Activity</h3>
                        <p className="text-gray-500 italic">Your transactions will appear here</p>
                    </div> */}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative transform transition-all animate-scaleIn">
                        {/* Close Button */}
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="text-center mb-6">
                            <div className="inline-flex p-3 bg-purple-100 rounded-full mb-4">
                                {modalType === "add" ? (
                                    <Plus className="w-8 h-8 text-purple-600" />
                                ) : (
                                    <Minus className="w-8 h-8 text-red-600" />
                                )}
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">
                                {modalType === "add" ? "Add Money" : "Withdraw Money"}
                            </h2>
                            <p className="text-gray-600 mt-1">
                                Current Balance: <span className="font-bold">₹{balance}</span>
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Amount (₹)
                                </label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                                    placeholder="0.00"
                                    min="1"
                                    step="0.01"
                                />
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg">
                                    <AlertCircle className="w-5 h-5" />
                                    <span className="text-sm font-medium">{error}</span>
                                </div>
                            )}

                            {/* Success */}
                            {success && (
                                <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-4 py-3 rounded-lg">
                                    <CheckCircle className="w-5 h-5" />
                                    <span className="text-sm font-medium">{success}</span>
                                </div>
                            )}

                            <button
                                onClick={handleSubmit}
                                disabled={loading || !amount}
                                className={`w-full py-3 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center space-x-2 ${loading || !amount
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : modalType === "add"
                                        ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-lg"
                                        : "bg-gradient-to-r from-red-500 to-rose-600 hover:shadow-lg"
                                    }`}
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <span>{modalType === "add" ? "Add" : "Withdraw"}</span>
                                        <span>₹{amount || "0"}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

