import { useState, useRef, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Bot, Send, Loader2, RefreshCw, Sparkles, User, MessageCircle } from "lucide-react";

interface Message { role: "user" | "assistant"; content: string; }

const QUICK = [
  "Cara belanja di jualdanbeli?",
  "Apa itu Rekening Bersama?",
  "Cara bayar tagihan listrik?",
  "Cara buka toko?",
  "Cara lacak paket?",
  "Cara tarik saldo?",
];

export default function CsAiPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "👋 Halo! Saya **Jubi**, asisten AI jualdanbeli yang siap membantu 24 jam/7 hari!\n\nAda yang bisa saya bantu seputar belanja, pengiriman, pembayaran, atau pertanyaan lainnya? 😊" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function sendMessage(text: string) {
    const msg = text.trim();
    if (!msg || loading) return;

    setMessages(prev => [...prev, { role: "user", content: msg }]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/ai/chat/public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, history }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply ?? "Maaf, terjadi kesalahan. Coba lagi ya!" }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "😅 Maaf, koneksi bermasalah. Coba lagi dalam beberapa saat." }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function formatText(text: string) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 p-4 bg-gradient-to-r from-primary to-primary/80 rounded-2xl text-white">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center shrink-0">
            <Bot className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black">Jubi — AI Customer Service</h1>
              <Sparkles className="w-4 h-4 text-yellow-300" />
            </div>
            <p className="text-sm text-white/80 mt-0.5">Asisten pintar jualdanbeli • Online 24 jam</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-white/70">Aktif sekarang</span>
            </div>
          </div>
          <button
            onClick={() => setMessages([{ role: "assistant", content: "👋 Chat direset. Ada yang bisa saya bantu?" }])}
            className="ml-auto p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            title="Reset chat"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Chat area */}
        <div className="bg-gray-50 rounded-2xl border overflow-hidden mb-4" style={{ height: "420px" }}>
          <div className="h-full overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "assistant" ? "bg-primary" : "bg-gray-300"}`}>
                  {msg.role === "assistant" ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-gray-600" />}
                </div>
                <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-white rounded-tr-none"
                    : "bg-white border shadow-sm rounded-tl-none"
                }`}>
                  <span dangerouslySetInnerHTML={{ __html: formatText(msg.content) }} />
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border shadow-sm rounded-2xl rounded-tl-none px-4 py-3">
                  <div className="flex gap-1.5 items-center h-5">
                    {[0, 1, 2].map(d => (
                      <span key={d} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${d * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
        </div>

        {/* Quick replies */}
        <div className="flex gap-2 flex-wrap mb-3">
          {QUICK.map(q => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              disabled={loading}
              className="text-xs bg-white border rounded-full px-3 py-1.5 hover:bg-primary hover:text-white hover:border-primary transition-colors disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
            placeholder="Ketik pertanyaan Anda..."
            className="flex-1 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            disabled={loading}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white px-4 py-3 rounded-xl transition-colors"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>

        {/* Info */}
        <p className="text-center text-xs text-muted-foreground mt-4">
          💡 Jubi menggunakan AI untuk memberikan jawaban terbaik. Untuk masalah kompleks, hubungi tim CS kami.
        </p>
      </div>
    </MainLayout>
  );
}
