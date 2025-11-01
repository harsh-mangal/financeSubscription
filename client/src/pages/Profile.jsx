import React, { useEffect, useState } from "react";
import API from "../api/axios";
import { User, Mail, Wallet, Calendar, Shield, Loader2, CheckCircle } from "lucide-react";

export default function Profile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchProfile = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await API.get("/wallet/profile"); 
            setProfile(res.data);
        } catch (err) {
            setError("Failed to load profile. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    };

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 md:p-8">
                <div className="max-w-4xl mx-auto">

                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="flex justify-center mb-4">
                            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full shadow-inner">
                                <User className="w-10 h-10 text-white" />
                            </div>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            User Profile
                        </h1>
                        <p className="text-gray-600 mt-2">Your account details and wallet status</p>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-12 text-center border border-white/20">
                            <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto" />
                            <p className="text-gray-600 mt-4">Loading your profile...</p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl text-center">
                            <p className="font-medium">{error}</p>
                            <button
                                onClick={fetchProfile}
                                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {/* Profile Card */}
                    {profile && !loading && !error && (
                        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 md:p-12 border border-white/20">
                            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">

                                {/* Avatar */}
                                <div className="flex-shrink-0">
                                    <div className="w-28 h-28 md:w-36 md:h-36 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg">
                                        <span className="text-white text-4xl md:text-5xl font-bold">
                                            {profile.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex-1 space-y-6 text-center md:text-left">

                                    {/* Name & Status */}
                                    <div>
                                        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                                            {profile.name}
                                        </h2>
                                        <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                                            <Shield className={`w-5 h-5 ${profile.status ? "text-green-600" : "text-yellow-600"}`} />
                                            <span className={`font-medium ${profile.status ? "text-green-600" : "text-yellow-600"}`}>
                                                {profile.status ? "Active" : "Inactive"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Details Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                                        {/* Email */}
                                        <div className="flex items-center gap-3 bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
                                            <div className="p-2 bg-purple-100 rounded-lg">
                                                <Mail className="w-5 h-5 text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Email</p>
                                                <p className="font-medium text-gray-800">{profile.email}</p>
                                            </div>
                                        </div>

                                        {/* Balance */}
                                        <div className="flex items-center gap-3 bg-green-50/50 p-4 rounded-2xl border border-green-100">
                                            <div className="p-2 bg-green-100 rounded-lg">
                                                <Wallet className="w-5 h-5 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Wallet Balance</p>
                                                <p className="font-bold text-xl text-green-600">
                                                    ₹{profile.balance.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Joined Date */}
                                        <div className="flex items-center gap-3 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                <Calendar className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Member Since</p>
                                                <p className="font-medium text-gray-800">{formatDate(profile.createdAt)}</p>
                                            </div>
                                        </div>

                                        {/* Role (if admin) */}
                                        {profile.role === "admin" && (
                                            <div className="flex items-center gap-3 bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
                                                <div className="p-2 bg-amber-100 rounded-lg">
                                                    <CheckCircle className="w-5 h-5 text-amber-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600">Role</p>
                                                    <p className="font-medium text-amber-700">Administrator</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}