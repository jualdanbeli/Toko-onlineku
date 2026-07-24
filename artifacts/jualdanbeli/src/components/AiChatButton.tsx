import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Loader2, Sparkles, MessageCircle } from "lucide-react";
import { Link } from "wouter";

interface Msg { role: "user" | "assistant"; content: string; }

const QUICK = ["Cara belanja?", "Cek pesanan saya", "Bayar tagihan", "Hubungi CS"];

export function AiChatButton() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "👋 Halo! Saya Jubi, AI CS jualdanbeli. Ada yang bisa dibantu?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (open) endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, open]);

  async function send(text: string) {
    const msg = text.trim();
    if (!msg || loading) return;
    setMessages(prev => [...prev, { role: "user", content: msg }]);
    setInput("");
    setLoading(true);
    try {
      const history = messages.slice(-4).map(m => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/ai/chat/public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, history }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply ?? "Maaf, coba lagi ya!" }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Koneksi bermasalah, coba lagi." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 md:bottom-6">
      {/* Popup chat mini */}
      {open && (
        <div className="mb-3 w-72 bg-white rounded-2xl shadow-2xl border overflow-hidden flex flex-col" style={{ height: "380px" }}>
          {/* Header */}
          <div className="bg-primary p-3 flex items-center gap-2 text-white">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm">Jubi AI</p>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                <span className="text-[10px] text-white/80">Online</span>
              </div>
            </div>
            <Link href="/cs-ai" className="text-[10px] bg-white/20 hover:bg-white/30 px-2 py-1 rounded-full transition-colors">
              Buka Penuh
            </Link>
            <button onClick={() => setOpen(false)} className="p-1 hover:bg-white/20 rounded-full">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[90%] text-xs px-3 py-2 rounded-xl ${
                  m.role === "user" ? "bg-primary text-white" : "bg-white border shadow-sm"
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border shadow-sm px-3 py-2 rounded-xl">
                  <div className="flex gap-1">
                    {[0,1,2].map(d => <span key={d} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${d*0.15}s` }} />)}
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Quick */}
          <div className="px-2 py-1.5 bg-white border-t flex gap-1 flex-wrap">
            {QUICK.map(q => (
              <button key={q} onClick={() => send(q)} disabled={loading}
                className="text-[10px] bg-gray-100 hover:bg-primary hover:text-white border rounded-full px-2 py-0.5 transition-colors disabled:opacity-50">
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-2 bg-white border-t flex gap-1.5">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send(input)}
              placeholder="Ketik pertanyaan..."
              className="flex-1 text-xs border rounded-lg px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
              disabled={loading}
            />
            <button
              onClick={() => send(input)}
              disabled={loading || !input.trim()}
              className="bg-primary text-white p-2 rounded-lg disabled:opacity-50 transition-colors"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      )}

      {/* FAB button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-14 h-14 bg-primary hover:bg-primary/90 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 relative"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        {!open && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-white" />
          </span>
        )}
      </button>
    </div>
  );
}
