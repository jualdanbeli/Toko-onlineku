import { useState } from "react";
import { useLocation } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { JDBLogo } from "@/components/JDBLogo";
import { Shield, Eye, EyeOff, Loader2, Lock, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function MasukOperator() {
  const [, setLocation] = useLocation();
  const { setToken } = useAuth();
  const { toast } = useToast();
  const loginMutation = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      toast({ variant: "destructive", title: "Lengkapi email dan password" });
      return;
    }

    loginMutation.mutate({ data: { email, password } }, {
      onSuccess: (res) => {
        if (res.user.role !== "admin") {
          toast({
            variant: "destructive",
            title: "Akses Ditolak",
            description: "Halaman ini hanya untuk operator & admin platform.",
          });
          return;
        }
        setToken(res.token);
        toast({ title: "✅ Berhasil masuk!", description: `Selamat datang, ${res.user.name}` });
        setLocation("/admin");
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Email atau password salah",
          description: "Periksa kembali data login Anda.",
        });
      },
    });
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex flex-col items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 40px,rgba(255,255,255,.1) 40px,rgba(255,255,255,.1) 41px),repeating-linear-gradient(90deg,transparent,transparent 40px,rgba(255,255,255,.1) 40px,rgba(255,255,255,.1) 41px)" }}
      />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <JDBLogo size="lg" variant="full" />
        </div>

        {/* Card */}
        <div className="bg-[#111827] border border-[#1f2d45] rounded-2xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 p-5 text-center">
            <div className="flex justify-center mb-2">
              <Crown className="w-8 h-8 text-yellow-900" />
            </div>
            <h1 className="text-xl font-black text-yellow-900 tracking-wide">LOGIN OPERATOR</h1>
            <p className="text-yellow-800 text-sm mt-1">Dashboard Pengelola Platform J&B™ jualdanbeli™</p>
          </div>

          {/* Form */}
          <div className="p-6 space-y-5">
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-start gap-3">
              <Shield className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-300">
                Halaman ini <strong>khusus untuk operator &amp; staf admin</strong>. Pengguna umum tidak bisa mengakses area ini.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300">
                  📧 Email Operator
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Masukkan email Anda"
                  autoComplete="email"
                  className="w-full bg-[#1a2235] border border-[#2a3a55] text-white placeholder-slate-500 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300">
                  🔑 Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Masukkan password Anda"
                    autoComplete="current-password"
                    className="w-full bg-[#1a2235] border border-[#2a3a55] text-white placeholder-slate-500 rounded-xl px-4 py-3.5 text-sm pr-12 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-60 text-yellow-900 font-black py-4 rounded-xl transition-colors text-base tracking-wide flex items-center justify-center gap-2"
              >
                {loginMutation.isPending ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Memproses...</>
                ) : (
                  <><Lock className="w-5 h-5" /> MASUK KE DASHBOARD</>
                )}
              </button>
            </form>

            <div className="text-center pt-2">
              <a href="/" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
                ← Kembali ke Marketplace
              </a>
            </div>
          </div>
        </div>

        {/* Security note */}
        <p className="text-center text-slate-600 text-xs mt-6">
          🔒 Koneksi aman &nbsp;·&nbsp; J&B™ jualdanbeli™ &nbsp;·&nbsp; © {new Date().getFullYear()} Hari Muhammad Hamzah
        </p>
      </div>
    </div>
  );
}
