import { Router, type IRouter } from "express";
import { requireAuth } from "../lib/auth";
import OpenAI from "openai";

const router: IRouter = Router();

const SYSTEM_PROMPT = `Kamu adalah Jubi, asisten AI customer service platform jualdanbeli.com — marketplace terpercaya milik Hari Muhammad Hamzah. Kamu ramah, sopan, dan selalu menggunakan Bahasa Indonesia yang baik.

Tugasmu:
- Bantu pembeli dan penjual dengan pertanyaan seputar belanja, pengiriman, pembayaran, dan akun
- Jelaskan sistem Rekening Bersama (escrow) yang melindungi uang pembeli
- Bantu navigasi fitur: cart, checkout, tracking, wallet, bayar tagihan
- Tangani keluhan dengan empati dan arahkan ke solusi

Tentang platform:
- Nama: jualdanbeli.com  
- Pemilik: Hari Muhammad Hamzah
- Merek: J&B™ jualdanbeli™
- Fitur utama: Escrow/Rekening Bersama, multi-kurir, bayar tagihan (PLN, BPJS, dll), Flash Sale, Live Shopping
- Pembayaran: Transfer bank, e-wallet, kartu kredit via Midtrans
- Kurir: JNE, J&T, SiCepat, Anteraja, Pos Indonesia

Batasan:
- Jangan berikan informasi pribadi pengguna lain
- Jangan janji hal yang tidak bisa dipenuhi platform
- Untuk masalah teknis berat, arahkan ke admin
- Jawab singkat dan padat, maksimal 3-4 kalimat per respons

Selalu awali dengan sapaan hangat dan akhiri dengan tawaran bantuan lebih lanjut.`;

function getFallbackResponse(message: string): string {
  const msg = message.toLowerCase();

  if (msg.includes("escrow") || msg.includes("rekening bersama") || msg.includes("aman")) {
    return "🛡️ Sistem Rekening Bersama (Escrow) kami menjamin uang Anda aman! Dana pembeli ditahan dulu oleh platform, dan baru dikirim ke penjual setelah barang diterima dan dikonfirmasi. Jadi Anda tidak perlu khawatir tertipu. Ada pertanyaan lain?";
  }
  if (msg.includes("ongkir") || msg.includes("pengiriman") || msg.includes("kurir")) {
    return "🚚 Kami mendukung berbagai kurir: JNE, J&T Express, SiCepat, Anteraja, dan Pos Indonesia. Ongkos kirim dihitung otomatis saat checkout berdasarkan berat dan jarak. Gratis ongkir untuk pembelian di atas Rp 50.000! Ada yang ingin ditanyakan?";
  }
  if (msg.includes("bayar") || msg.includes("tagihan") || msg.includes("listrik") || msg.includes("bpjs")) {
    return "💡 Fitur Bayar Tagihan kami bisa dipakai untuk bayar: PLN (listrik), BPJS Kesehatan & Ketenagakerjaan, PDAM (air), Internet, TV Kabel, Pulsa, Pajak, dan banyak lagi. Admin fee hanya Rp 2.500 per transaksi. Klik menu 'Bayar Tagihan' di navbar!";
  }
  if (msg.includes("daftar") || msg.includes("register") || msg.includes("akun baru")) {
    return "👋 Cara daftar sangat mudah! Klik tombol 'Daftar' di pojok kanan atas, isi nama, email, dan password. Verifikasi email, dan akun Anda langsung aktif. Gratis selamanya! Mau daftar sebagai pembeli atau penjual?";
  }
  if (msg.includes("jual") || msg.includes("buka toko") || msg.includes("seller") || msg.includes("penjual")) {
    return "🏪 Untuk buka toko di jualdanbeli, klik menu 'Buka Toko Gratis' atau pergi ke /seller/register. Lengkapi profil toko dan KYC (verifikasi identitas), lalu Anda bisa langsung upload produk! Gratis tanpa biaya pendaftaran. Butuh panduan lebih lanjut?";
  }
  if (msg.includes("refund") || msg.includes("retur") || msg.includes("kembalikan")) {
    return "🔄 Kebijakan retur kami: 7 hari bebas retur sejak barang diterima, selama barang dalam kondisi sama seperti diterima. Ajukan retur lewat menu 'Pesanan Saya' → pilih pesanan → 'Ajukan Sengketa'. Tim kami siap membantu!";
  }
  if (msg.includes("saldo") || msg.includes("wallet") || msg.includes("dompet") || msg.includes("tarik")) {
    return "💰 Saldo dompet Anda bisa dilihat di menu Wallet. Dana hasil penjualan masuk setelah pembeli konfirmasi terima barang. Penarikan ke rekening bank bisa dilakukan kapan saja (minimum Rp 50.000, maksimum Rp 50.000.000 per hari). Ada yang ingin ditanyakan?";
  }
  if (msg.includes("halo") || msg.includes("hai") || msg.includes("hello") || msg.includes("hi") || msg.includes("selamat")) {
    return "👋 Halo! Saya Jubi, asisten AI jualdanbeli. Saya siap membantu Anda 24 jam sehari, 7 hari seminggu! Ada yang bisa saya bantu seputar belanja, pengiriman, pembayaran, atau pertanyaan lainnya?";
  }
  if (msg.includes("flash sale") || msg.includes("diskon") || msg.includes("promo")) {
    return "⚡ Flash Sale jualdanbeli hadir setiap hari dengan diskon hingga 70%! Cek halaman utama untuk melihat produk Flash Sale yang sedang aktif. Aktifkan notifikasi agar tidak ketinggalan Flash Sale terbaru. Mau tahu lebih lanjut?";
  }
  if (msg.includes("lacak") || msg.includes("tracking") || msg.includes("nomor resi")) {
    return "📦 Untuk lacak paket: buka menu 'Pesanan Saya', pilih pesanan yang ingin dilacak, lalu klik 'Lacak Paket'. Nomor resi akan tampil dan Anda bisa melihat status pengiriman real-time. Paket dari mana yang ingin dilacak?";
  }

  return "🤖 Halo! Saya Jubi, asisten AI jualdanbeli. Saya bisa bantu pertanyaan seputar:\n\n• 🛒 Cara belanja & checkout\n• 🚚 Pengiriman & kurir\n• 💡 Bayar tagihan (PLN, BPJS, dll)\n• 💰 Dompet & penarikan dana\n• 🏪 Buka toko & jual produk\n• 🛡️ Keamanan & Escrow\n\nSilakan tanyakan apa saja! 😊";
}

router.post("/ai/chat", requireAuth, async (req, res): Promise<void> => {
  const { message, history = [] } = req.body;

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    res.status(400).json({ error: "Pesan tidak boleh kosong" });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY || process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
  const baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;

  if (!apiKey) {
    // Fallback ke rule-based response
    const reply = getFallbackResponse(message.trim());
    res.json({ reply, mode: "fallback" });
    return;
  }

  try {
    const client = new OpenAI({ apiKey, ...(baseURL ? { baseURL } : {}) });

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.slice(-6).map((h: { role: string; content: string }) => ({
        role: h.role as "user" | "assistant",
        content: h.content,
      })),
      { role: "user", content: message.trim() },
    ];

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 300,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content ?? getFallbackResponse(message);
    res.json({ reply, mode: "ai" });
  } catch {
    const reply = getFallbackResponse(message.trim());
    res.json({ reply, mode: "fallback" });
  }
});

// Public version (tidak perlu login) untuk halaman cs-ai
router.post("/ai/chat/public", async (req, res): Promise<void> => {
  const { message, history = [] } = req.body;

  if (!message || typeof message !== "string") {
    res.status(400).json({ error: "Pesan kosong" });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY || process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
  const baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;

  if (!apiKey) {
    res.json({ reply: getFallbackResponse(message.trim()), mode: "fallback" });
    return;
  }

  try {
    const client = new OpenAI({ apiKey, ...(baseURL ? { baseURL } : {}) });
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.slice(-4).map((h: { role: string; content: string }) => ({
        role: h.role as "user" | "assistant",
        content: h.content,
      })),
      { role: "user", content: message.trim() },
    ];

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 300,
      temperature: 0.7,
    });

    res.json({ reply: completion.choices[0]?.message?.content ?? getFallbackResponse(message), mode: "ai" });
  } catch {
    res.json({ reply: getFallbackResponse(message.trim()), mode: "fallback" });
  }
});

export default router;
