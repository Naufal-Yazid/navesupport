import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // Menerima data payload dari frontend UI website (Termasuk deviceId)
    const { message, sessionId, deviceId } = await request.json();

    // URL Webhook asli dari n8n milikmu
    const N8N_WEBHOOK_URL = "https://n8n.srv1768691.hstgr.cloud/webhook/nave-bot-webhook";

    // Meneruskan data lengkap ke workflow n8n
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sessionId: sessionId || "default_session",
        message: message,
        deviceId: deviceId || "", // ✨ Mengirimkan Device ID permanen ke n8n
      }),
    });

    if (!response.ok) {
      throw new Error(`n8n mendeteksi eror: ${response.statusText}`);
    }

    let data = await response.json();

    // 🛠️ HANDLING RESPONS RESPONSIVE N8N (ANTI-EROR)
    // 1. Jika n8n mengirim data dalam bentuk Array (All Incoming Item), ambil index pertama
    if (Array.isArray(data) && data.length > 0) {
      data = data[0];
    }

    // 2. Cari variabel output dari Code Node n8n secara presisi
    let botReply = "";
    if (data.output) {
      botReply = data.output;
    } else if (data.reply) {
      botReply = data.reply;
    } else if (data.text) {
      botReply = data.text;
    } else {
      // Jika bentuknya objek mentah tak terduga, convert ke string
      botReply = typeof data === "string" ? data : JSON.stringify(data);
    }

    // Mengembalikan jawaban bersih ke frontend website
    return NextResponse.json({ reply: botReply });
  } catch (error) {
    console.error("Error pada Next.js Backend Route:", error);
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}
