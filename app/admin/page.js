"use client";

import { useState, useEffect } from "react";
import { BarChart3, Users, MessageSquare, ArrowLeft, RefreshCw, Zap, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Gagal memuat data statistik admin:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="animate-spin text-[#0052cc]" size={32} />
          <p className="text-sm text-gray-500 font-medium">Loading Dashboard Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-gray-800 font-sans p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Dashboard */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-5">
          <div>
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0052cc] hover:underline mb-2">
              <ArrowLeft size={14} /> Kembali ke Chat
            </Link>
            <h1 className="text-2xl md:text-3xl font-black text-[#0a255c] tracking-tight">
              NAVE <span className="text-gray-400 font-light italic">Analytics Panel</span>
            </h1>
          </div>
          <button onClick={fetchStats} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 active:scale-95 transition shadow-sm">
            <RefreshCw size={14} /> Refresh Data
          </button>
        </div>

        {/* Grid Kartu Utama */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Pesan */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-[#0052cc] rounded-xl">
              <MessageSquare size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Pesan</p>
              <h3 className="text-xl font-black text-[#0a255c]">{stats?.totalQuestions || 0}</h3>
            </div>
          </div>

          {/* Total Users */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <Users size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Users</p>
              <h3 className="text-xl font-black text-[#0a255c]">{stats?.totalUsers || 0}</h3>
            </div>
          </div>

          {/* Conversion Rate */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 bg-gradient-to-br from-white to-amber-50/20">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Zap size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Conversion Rate</p>
              <h3 className="text-xl font-black text-amber-600">
                {stats?.conversionRate || 0}%<span className="text-[10px] text-gray-400 font-normal block normal-case">Tertarik Kontak/Harga</span>
              </h3>
            </div>
          </div>

          {/* Average Chat Depth */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Avg Chat Depth</p>
              <h3 className="text-xl font-black text-[#0a255c]">
                {stats?.avgChatDepth || 0}
                <span className="text-gray-400 text-xs font-normal ml-1">pesan/user</span>
              </h3>
            </div>
          </div>
        </div>

        {/* Konten Utama: Sejajar dan Sama Tinggi */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Bagian 1: Topik yang Paling Sering Ditanya (Fixed Height + Scroll) */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-[540px]">
            <h3 className="text-sm font-bold text-[#0a255c] uppercase tracking-wider mb-4">Topik Terpopuler (UMKM Interest)</h3>
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-none">
              {stats?.popularTopics?.map((topic, i) => {
                const percentage = stats.totalQuestions > 0 ? (topic.count / stats.totalQuestions) * 100 : 0;
                return (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between text-xs md:text-sm">
                      <span className="font-semibold text-gray-700">{topic.name}</span>
                      <span className="font-bold text-[#0052cc]">
                        {topic.count} kali ({Math.round(percentage)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-[#0052cc] h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bagian 2: Live Log Riwayat Chat Terbaru (Fixed Height + Scroll) */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-[540px]">
            <h3 className="text-sm font-bold text-[#0a255c] uppercase tracking-wider mb-4">10 Pertanyaan Terakhir Terbaca</h3>
            <div className="flex-1 overflow-y-auto pr-2 space-y-3.5 scrollbar-none">
              {stats?.recentLogs?.map((log, index) => (
                <div key={index} className="pt-3 first:pt-0 border-t first:border-t-0 border-gray-100 text-xs md:text-sm">
                  <div className="flex justify-between text-[10px] text-gray-400 font-semibold mb-1">
                    <span className="truncate max-w-[150px]">ID: {log["Session ID"]}</span>
                    <span>{log["Timestamp"]?.split("T")[0] || "Hari ini"}</span>
                  </div>
                  <p className="text-gray-700 font-medium bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    💡 <span className="italic">"{log["User Message"]}"</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
