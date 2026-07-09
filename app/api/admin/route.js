import { NextResponse } from "next/server";

export async function GET() {
  try {
    const SPREADSHEET_DATA_URL = "https://n8n.srv1768691.hstgr.cloud/webhook/e743de47-f25e-455b-88bf-5110c26ab942";

    const response = await fetch(SPREADSHEET_DATA_URL, { cache: "no-store" });
    const rawData = await response.json();

    if (!Array.isArray(rawData)) {
      return NextResponse.json({ error: "Format data spreadsheet tidak valid" }, { status: 500 });
    }

    const totalQuestions = rawData.length;

    // 1. Grouping data gabungan (Aman dari data kosong / lama)
    const uniqueUsersMap = {};
    const sessionsMap = {};

    rawData.forEach((row) => {
      const sessionId = row["Session ID"];
      // Fallback: gunakan Device ID jika ada, kalau kosong gunakan Session ID
      const userIdentifier = row["Device ID"] || sessionId;

      if (userIdentifier) {
        uniqueUsersMap[userIdentifier] = true;
      }

      if (sessionId) {
        if (!sessionsMap[sessionId]) {
          sessionsMap[sessionId] = [];
        }
        sessionsMap[sessionId].push(row);
      }
    });

    const totalUsers = Object.keys(uniqueUsersMap).length;

    // 2. HITUNG CONVERSION RATE ANALYTICS
    let convertedUsersCount = 0;
    const conversionKeywords = ["kontak", "whatsapp", "wa", "email", "hubungi", "nomor", "harga", "paket", "biaya", "pricelist", "price", "cost", "tarif", "konsultasi", "meeting", "diskusi"];

    Object.keys(sessionsMap).forEach((sessionId) => {
      const userMessages = sessionsMap[sessionId].map((r) => (r["User Message"] || "").toString().toLowerCase());
      const isConverted = userMessages.some((msg) => conversionKeywords.some((keyword) => msg.includes(keyword)));
      if (isConverted) {
        convertedUsersCount++;
      }
    });

    const conversionRate = totalUsers > 0 ? Math.round((convertedUsersCount / totalUsers) * 100) : 0;

    // 3. HITUNG RATA-RATA KEDALAMAN CHAT
    const avgChatDepth = totalUsers > 0 ? (totalQuestions / totalUsers).toFixed(1) : 0;

    // 4. HITUNG TOPIK POPULER BERDASARKAN KEYWORDS (Ditambahkan pengaman .toString())
    const keywordsCount = {};
    const containsAny = (message, keywordsArray) => {
      return keywordsArray.some((keyword) => message.includes(keyword.trim()));
    };

    rawData.forEach((row) => {
      const msg = (row["User Message"] || "").toString().toLowerCase();
      let matched = false;

      if (containsAny(msg, ["halo", "hai", "hi", "pagi", "siang", "sore", "malam", "assalamualaikum"])) {
        keywordsCount["Sapaan Awal (Greetings)"] = (keywordsCount["Sapaan Awal (Greetings)"] || 0) + 1;
        matched = true;
      }
      if (containsAny(msg, ["harga", "paket", "biaya", "pricelist", "price", "cost", "tarif"])) {
        keywordsCount["Tanya Harga & Paket"] = (keywordsCount["Tanya Harga & Paket"] || 0) + 1;
        matched = true;
      }
      if (containsAny(msg, ["website", "web", "company profile", "landing page", "katalog", "catalog website"])) {
        keywordsCount["Layanan Web & Compro"] = (keywordsCount["Layanan Web & Compro"] || 0) + 1;
        matched = true;
      }
      if (containsAny(msg, ["digital marketing", "marketing", "media campaign", "social media", "ads", "iklan", "meta ads"])) {
        keywordsCount["Layanan Digital Marketing"] = (keywordsCount["Layanan Digital Marketing"] || 0) + 1;
        matched = true;
      }
      if (containsAny(msg, ["chatbot", "bot", "automation", "otomatisasi", "ai chatbot", "business bot"])) {
        keywordsCount["Layanan Chatbot & AI"] = (keywordsCount["Layanan Chatbot & AI"] || 0) + 1;
        matched = true;
      }
      if (containsAny(msg, ["seo", "search engine optimization", "google", "ranking", "keyword", "optimasi google"])) {
        keywordsCount["Layanan SEO Optimization"] = (keywordsCount["Layanan SEO Optimization"] || 0) + 1;
        matched = true;
      }
      if (containsAny(msg, ["nave", "nave solution", "tentang nave", "profil", "company", "perusahaan"])) {
        keywordsCount["Tanya Profil Nave Solution"] = (keywordsCount["Tanya Profil Nave Solution"] || 0) + 1;
        matched = true;
      }
      if (containsAny(msg, ["layanan", "service", "jasa", "produk", "apa saja", "offering"])) {
        keywordsCount["Tanya Informasi Jasa"] = (keywordsCount["Tanya Informasi Jasa"] || 0) + 1;
        matched = true;
      }
      if (containsAny(msg, ["kontak", "whatsapp", "wa", "email", "hubungi", "nomor"])) {
        keywordsCount["Inten Hubungi Kontak (Leads)"] = (keywordsCount["Inten Hubungi Kontak (Leads)"] || 0) + 1;
        matched = true;
      }
      if (containsAny(msg, ["portfolio", "portofolio", "project", "hasil kerja", "contoh", "client", "proyek"])) {
        keywordsCount["Melihat Portofolio Proyek"] = (keywordsCount["Melihat Portofolio Proyek"] || 0) + 1;
        matched = true;
      }
      if (containsAny(msg, ["proses", "workflow", "tahapan", "cara kerja", "bagaimana prosesnya", "alur kerja", "work process", "estimasi", "durasi", "lama pengerjaan", "timeline", "berapa lama", "waktu pengerjaan"])) {
        keywordsCount["Tanya Cara Kerja & Timeline"] = (keywordsCount["Tanya Cara Kerja & Timeline"] || 0) + 1;
        matched = true;
      }
      if (containsAny(msg, ["dashboard", "analytics", "tracking", "laporan", "report", "performa"])) {
        keywordsCount["Tanya Fitur Dashboard"] = (keywordsCount["Tanya Fitur Dashboard"] || 0) + 1;
        matched = true;
      }
      if (containsAny(msg, ["konsultasi", "meeting", "diskusi", "konsultasi gratis"])) {
        keywordsCount["Request Konsultasi Gratis"] = (keywordsCount["Request Konsultasi Gratis"] || 0) + 1;
        matched = true;
      }
      if (containsAny(msg, ["kelebihan", "benefit", "why nave", "mengapa memilih nave", "kenapa nave", "keunggulan", "advantage", "value"])) {
        keywordsCount["Tanya Keunggulan Nave"] = (keywordsCount["Tanya Keunggulan Nave"] || 0) + 1;
        matched = true;
      }
      if (containsAny(msg, ["maintenance", "support", "garansi", "after sales", "revisi", "revisi desain", "perubahan", "edit"])) {
        keywordsCount["Tanya Garansi & Maintenance"] = (keywordsCount["Tanya Garansi & Maintenance"] || 0) + 1;
        matched = true;
      }
      if (containsAny(msg, ["imperia", "imperia culverin"])) {
        keywordsCount["Tanya Proyek Imperia"] = (keywordsCount["Tanya Proyek Imperia"] || 0) + 1;
        matched = true;
      }
      if (containsAny(msg, ["motionpic", "motion pic", "studio foto"])) {
        keywordsCount["Tanya Tentang Motionpic"] = (keywordsCount["Tanya Tentang Motionpic"] || 0) + 1;
        matched = true;
      }
      if (containsAny(msg, ["target", "target market", "customer", "umkm", "bisnis"])) {
        keywordsCount["Tanya Target Market & UMKM"] = (keywordsCount["Tanya Target Market & UMKM"] || 0) + 1;
        matched = true;
      }
      if (containsAny(msg, ["jam kerja", "jam operasional", "buka", "tutup"])) {
        keywordsCount["Tanya Jam Operasional"] = (keywordsCount["Tanya Jam Operasional"] || 0) + 1;
        matched = true;
      }
      if (containsAny(msg, ["terima kasih", "makasih", "thanks", "thank you"])) {
        keywordsCount["Ungkapan Terima Kasih User"] = (keywordsCount["Ungkapan Terima Kasih User"] || 0) + 1;
        matched = true;
      }

      if (!matched) {
        keywordsCount["Pertanyaan Umum Lainnya"] = (keywordsCount["Pertanyaan Umum Lainnya"] || 0) + 1;
      }
    });

    const popularTopics = Object.keys(keywordsCount)
      .map((name) => ({
        name,
        count: keywordsCount[name],
      }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      totalQuestions,
      totalUsers,
      conversionRate,
      avgChatDepth,
      popularTopics,
      recentLogs: rawData.slice(-10).reverse(),
    });
  } catch (error) {
    console.error("Error Detail Backend:", error);
    return NextResponse.json({ error: "Gagal memproses data statistik" }, { status: 500 });
  }
}
