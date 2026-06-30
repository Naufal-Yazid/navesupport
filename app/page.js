"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Briefcase, Paintbrush, DollarSign, Sliders, ArrowUp, Menu, X, Bot, User, MessageSquare, Clock, Trash2 } from "lucide-react";

export default function NaveAIChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false); // State untuk Popup Search
  const [searchQuery, setSearchQuery] = useState(""); // State untuk input pencarian di popup
  const messagesEndRef = useRef(null);

  // 🛠️ STATE DINAMIS UNTUK MENAMPUNG RIWAYAT CHAT LENGKAP DENGAN DATA PESANNYA
  const [chatHistory, setChatHistory] = useState([]);

  // Memfilter riwayat dinamis berdasarkan input pencarian user di popup modal
  const filteredHistory = chatHistory.filter((item) => item.title.toLowerCase().includes(searchQuery.toLowerCase()));

  useEffect(() => {
    setSessionId(`nave_session_${Math.random().toString(36).substring(2, 11)}`);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (textToSend) => {
    const targetText = textToSend || input;
    if (!targetText.trim() || isLoading) return;

    const userMessage = { role: "user", text: targetText };

    // Cek apakah ini pesan pertama di sesi ini
    const isFirstMessage = messages.length === 0;
    const firstUserText = targetText;

    // 1. Update layar chat saat ini
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsSidebarOpen(false);
    setIsSearchOpen(false);
    setIsLoading(true);

    // 2. Jika ini bukan pesan pertama, update data array chat di history secara real-time
    if (!isFirstMessage) {
      setChatHistory((prev) => prev.map((chat) => (chat.id === sessionId ? { ...chat, messages: updatedMessages } : chat)));
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.text, sessionId }),
      });

      const data = await response.json();
      const finalMessages = [...updatedMessages, { role: "assistant", text: data.reply }];

      // Update layar chat utama dengan balasan bot
      setMessages(finalMessages);

      // 3. LOGIKA AUTOMATIS UNTUK MEMBUAT ROOM BARU ATAU UPDATE ISI PESAN BOT
      if (isFirstMessage) {
        const topicTitle = firstUserText.length > 28 ? firstUserText.substring(0, 28) + "..." : firstUserText;

        const newHistoryItem = {
          id: sessionId,
          title: topicTitle,
          date: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          messages: finalMessages, // Simpan seluruh history chat di objek ini
        };

        setChatHistory((prev) => [newHistoryItem, ...prev]);
      } else {
        // Jika sudah chat panjang, pastikan balasan bot-nya ikut tersimpan di history state
        setChatHistory((prev) => prev.map((chat) => (chat.id === sessionId ? { ...chat, messages: finalMessages } : chat)));
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: "assistant", text: "⚠️ Maaf, sistem kami sedang mengalami gangguan. Coba sesaat lagi." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const capabilities = [
    {
      title: "Capabilities",
      desc: "How can Nave help my business grow?",
      icon: <Briefcase className="text-blue-600" size={18} />,
    },
    {
      title: "Design",
      desc: "Show me your latest web portfolio works",
      icon: <Paintbrush className="text-blue-600" size={18} />,
    },
    {
      title: "Pricing",
      desc: "What is the pricing for UI/UX design packages?",
      icon: <DollarSign className="text-blue-600" size={18} />,
    },
    {
      title: "Automation",
      desc: "How does n8n automation work for my workflow?",
      icon: <Sliders className="text-blue-600" size={18} />,
    },
  ];

  // 🛠️ FUNGSI UNTUK PINDAH ROOM CHAT SEKALIGUS ME-LOAD ISI CHAT SEBELUMNYA
  const startNewSession = (existingSessionId = "") => {
    setIsSidebarOpen(false);
    setInput("");

    if (existingSessionId) {
      // 1. Cari data room chat lama berdasarkan ID-nya
      const clickedChat = chatHistory.find((chat) => chat.id === existingSessionId);
      if (clickedChat) {
        setSessionId(existingSessionId);
        setMessages(clickedChat.messages || []); // Tarik dan tampilkan percakapan lalunya!
      }
    } else {
      // 2. Buat sesi kosong baru kalau tombol New Chat diklik
      setSessionId(`nave_session_${Math.random().toString(36).substring(2, 11)}`);
      setMessages([]);
    }
  };

  const deleteChat = (e, idToDelete) => {
    e.stopPropagation();
    setChatHistory((prev) => prev.filter((chat) => chat.id !== idToDelete));

    if (sessionId === idToDelete) {
      setMessages([]);
    }
  };

  return (
    <div className="flex h-[100dvh] w-full bg-white text-gray-800 font-sans overflow-hidden relative">
      {/* ================= SIDEBAR ================= */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-[#f9f9fb] border-r border-gray-100 p-5 flex flex-col justify-between transition-transform duration-300 md:static md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="space-y-6 overflow-y-auto h-full pb-4 scrollbar-none">
          {/* Logo Brand */}
          <div className="flex items-center justify-between">
            <div className="text-xl font-bold tracking-tight text-gray-900">
              NAVE <span className="text-gray-400 font-light italic">Solution</span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-1 text-gray-500 hover:bg-gray-200 rounded">
              <X size={18} />
            </button>
          </div>

          {/* New Chat Button */}
          <button onClick={() => startNewSession("")} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-200/60 rounded-lg transition active:scale-[0.98]">
            <Plus size={16} /> New Chat
          </button>

          {/* Search History Button */}
          <button onClick={() => setIsSearchOpen(true)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-200/60 rounded-lg transition active:scale-[0.98]">
            <Search size={16} /> Search history
          </button>

          {/* Recent Section (DINAMIS + LOAD ROOM PERCAKAPAN) */}
          <div className="pt-2">
            <div className="text-[10px] font-bold tracking-wider text-gray-400 uppercase px-3 mb-2">Recent</div>
            <div className="flex flex-col gap-1 w-full">
              {chatHistory.length === 0 ? (
                <div className="text-xs text-gray-400 px-3 italic flex items-center gap-2 py-1">
                  <Clock size={12} /> No recent chats
                </div>
              ) : (
                chatHistory.map((chat) => (
                  <div key={chat.id} className="relative group w-full">
                    <button
                      onClick={() => startNewSession(chat.id)}
                      className={`w-full flex items-center gap-2 pl-3 pr-10 py-2.5 rounded-xl text-xs md:text-sm text-left transition-all truncate ${
                        sessionId === chat.id ? "bg-blue-50/80 text-[#0052cc] font-semibold" : "text-gray-600 hover:bg-gray-200/40"
                      }`}
                    >
                      <MessageSquare size={13} className="shrink-0 opacity-70" />
                      <span className="truncate flex-1 pr-1">{chat.title}</span>
                      <span className="text-[9px] text-gray-400 font-normal shrink-0 group-hover:opacity-0 transition-opacity duration-150">{chat.date}</span>
                    </button>

                    {/* Tombol Delete */}
                    <button
                      onClick={(e) => deleteChat(e, chat.id)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-gray-200/60 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-150"
                      title="Delete chat"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay Backdrop untuk Mobile Sidebar */}
      <AnimatePresence>{isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/10 z-20 md:hidden backdrop-blur-sm" />}</AnimatePresence>

      {/* ================= POPUP MODAL SEARCH HISTORY ================= */}
      <AnimatePresence>
        {isSearchOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-md">
            <div className="absolute inset-0" onClick={() => setIsSearchOpen(false)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white w-full max-w-lg rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden relative z-10"
            >
              <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-[#f9f9fb]">
                <div className="flex items-center gap-2 text-gray-800 font-semibold text-sm">
                  <Search size={16} className="text-blue-600" /> Search Chat History
                </div>
                <button onClick={() => setIsSearchOpen(false)} className="p-1 text-gray-400 hover:bg-gray-200 rounded-lg transition">
                  <X size={16} />
                </button>
              </div>

              <div className="p-4 border-b border-gray-50">
                <div className="flex items-center bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 focus-within:border-gray-200 focus-within:bg-white transition-all">
                  <Search size={18} className="text-gray-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Type to filter history..."
                    className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
                    autoFocus
                  />
                </div>
              </div>

              <div className="p-2 max-h-64 overflow-y-auto">
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        startNewSession(item.id);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-3 text-xs md:text-sm text-gray-600 hover:bg-blue-50/60 hover:text-[#0052cc] rounded-xl cursor-pointer transition active:scale-[0.99]"
                    >
                      <MessageSquare size={14} className="shrink-0 text-gray-400" />
                      <span className="truncate flex-1">{item.title}</span>
                      <span className="text-[10px] text-gray-400 shrink-0">{item.date}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-xs md:text-sm text-gray-400 italic">No matching history found</div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MAIN CHAT WINDOW ================= */}
      <main className="flex-1 min-w-0 flex flex-col h-full relative overflow-hidden bg-white px-4 md:px-8">
        <header className="py-4 flex items-center md:hidden shrink-0">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition">
            <Menu size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto w-full max-w-3xl mx-auto py-6 space-y-6 scrollbar-none pb-40">
          <AnimatePresence initial={false}>
            {messages.length === 0 ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="min-h-[75vh] flex flex-col justify-center items-center relative">
                <div className="absolute w-[450px] h-[450px] bg-blue-100/40 rounded-full blur-[80px] -z-10 pointer-events-none" />

                <div className="text-center space-y-2 mb-8">
                  <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#1e3a8a]">Nave Support</h2>
                  <p className="text-gray-500 text-sm md:text-base font-medium">Your Digital Growth Partner.</p>
                  <p className="text-gray-400 text-sm md:text-base">How can I help you scale today?</p>
                </div>

                <div className="w-full max-w-2xl mb-2 bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 flex items-center px-5 py-3.5 focus-within:border-gray-300 focus-within:shadow-[0_8px_30px_rgb(59,130,246,0.08)] transition-all">
                  <Plus className="text-gray-400 mr-3 shrink-0 cursor-pointer hover:text-gray-600" size={20} />
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Message..."
                    className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400 text-sm md:text-base"
                  />
                  <button onClick={() => handleSend()} disabled={!input.trim() || isLoading} className={`p-2 rounded-full transition ${input.trim() && !isLoading ? "bg-[#0052cc] text-white" : "bg-gray-100 text-gray-300"}`}>
                    <ArrowUp size={16} />
                  </button>
                </div>

                <span className="text-[9px] uppercase tracking-wider text-gray-400 block mb-12">Nave Support can make mistakes. Check important info.</span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                  {capabilities.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSend(item.desc)}
                      className="p-4 bg-white border border-gray-100 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col items-start text-left cursor-pointer hover:border-gray-200 hover:shadow-[0_4px_25px_rgb(0,0,0,0.05)] active:scale-[0.99] transition-all"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {item.icon}
                        <h4 className="font-semibold text-sm text-gray-900">{item.title}</h4>
                      </div>
                      <p className="text-xs text-gray-400">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              messages.map((msg, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role !== "user" && (
                    <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0052cc] shrink-0">
                      <Bot size={16} />
                    </div>
                  )}
                  <div
                    className={`p-4 rounded-2xl max-w-[85%] md:max-w-xl text-sm leading-relaxed whitespace-pre-line ${
                      msg.role === "user" ? "bg-[#0052cc] text-white rounded-tr-none shadow-sm" : "bg-[#f9f9fb] border border-gray-100 text-gray-800 rounded-tl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                      <User size={16} />
                    </div>
                  )}
                </motion.div>
              ))
            )}

            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 justify-start">
                <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0052cc] shrink-0">
                  <Bot size={16} />
                </div>
                <div className="bg-[#f9f9fb] border border-gray-100 p-4 rounded-2xl rounded-tl-none flex items-center space-x-1 px-5">
                  <motion.span animate={{ scale: [0.7, 1.2, 0.7] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                  <motion.span animate={{ scale: [0.7, 1.2, 0.7] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.15 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                  <motion.span animate={{ scale: [0.7, 1.2, 0.7] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.3 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* ====== STICKY INPUT BAR DI BAWAH ====== */}
        {messages.length > 0 && (
          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-white via-white/95 to-transparent pt-6 pb-6 px-4">
            <div className="max-w-2xl mx-auto w-full bg-white rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-gray-200 flex items-center px-5 py-3 focus-within:border-blue-500 focus-within:shadow-[0_10px_30px_rgba(59,130,246,0.12)] transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Message Nave AI..."
                className="w-full bg-transparent outline-none text-xs md:text-sm text-gray-700 pr-10 placeholder-gray-400"
              />
              <button onClick={() => handleSend()} disabled={!input.trim() || isLoading} className={`p-2 rounded-full transition ${input.trim() && !isLoading ? "bg-[#0052cc] text-white" : "bg-gray-50 text-gray-300"}`}>
                <ArrowUp size={14} />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
