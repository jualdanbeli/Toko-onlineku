import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Plus, Trash2, RefreshCw, ShieldCheck, ShieldOff, KeyRound, Eye, EyeOff, X, Loader2, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function authHeader() {
  return { Authorization: `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json" };
}

interface StafUser {
  id: number;
  name: string;
  email: string;
  status: "active" | "suspended";
  createdAt: string;
}

export default function KelolStafPage() {
  const qc = useQueryClient();
  const { toast } = useToast();

  // Form tambah staf
  const [showForm, setShowForm] = useState(false);
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  // Reset password modal
  const [resetTarget, setResetTarget] = useState<StafUser | null>(null);
  const [newPass, setNewPass] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);

  // Fetch staf
  const { data, isLoading } = useQuery({
    queryKey: ["/api/admin/staf"],
    queryFn: async () => {
      const res = await fetch("/api/admin/staf", { headers: authHeader() });
      if (!res.ok) throw new Error("Gagal memuat data staf");
      return res.json() as Promise<{ staf: StafUser[] }>;
    },
  });

  // Tambah staf
  const tambahMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/staf", {
        method: "POST",
        headers: authHeader(),
        body: JSON.stringify({ name: nama, email, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menambah staf");
      return json;
    },
    onSuccess: () => {
      toast({ title: "✅ Staf berhasil ditambahkan!" });
      qc.invalidateQueries({ queryKey: ["/api/admin/staf"] });
      setNama(""); setEmail(""); setPassword(""); setShowForm(false);
    },
    onError: (e: Error) => toast({ variant: "destructive", title: e.message }),
  });

  // Toggle status
  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await fetch(`/api/admin/staf/${id}/status`, {
        method: "PATCH",
        headers: authHeader(),
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json;
    },
    onSuccess: () => {
      toast({ title: "Status staf diperbarui" });
      qc.invalidateQueries({ queryKey: ["/api/admin/staf"] });
    },
    onError: (e: Error) => toast({ variant: "destructive", title: e.message }),
  });

  // Hapus staf
  const hapusMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/staf/${id}`, { method: "DELETE", headers: authHeader() });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json;
    },
    onSuccess: () => {
      toast({ title: "Staf dihapus" });
      qc.invalidateQueries({ queryKey: ["/api/admin/staf"] });
    },
    onError: (e: Error) => toast({ variant: "destructive", title: e.message }),
  });

  // Reset password
  const resetMutation = useMutation({
    mutationFn: async ({ id, password }: { id: number; password: string }) => {
      const res = await fetch(`/api/admin/staf/${id}/reset-password`, {
        method: "PATCH",
        headers: authHeader(),
        body: JSON.stringify({ password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json;
    },
    onSuccess: () => {
      toast({ title: "✅ Password berhasil direset!" });
      setResetTarget(null); setNewPass("");
    },
    onError: (e: Error) => toast({ variant: "destructive", title: e.message }),
  });

  const staf = data?.staf ?? [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Crown className="w-6 h-6 text-yellow-500" />
              <h1 className="text-2xl font-black">Kelola Staf Admin</h1>
            </div>
            <p className="text-muted-foreground mt-1">
              Tambah atau hapus staf yang bisa mengelola platform. Staf admin <strong>tidak bisa</strong> mengakses menu Operator (pemilik).
            </p>
          </div>
          <button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-yellow-900 font-bold px-4 py-2.5 rounded-xl transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Tambah Staf Baru
          </button>
        </div>

        {/* Form tambah */}
        {showForm && (
          <div className="bg-white border-2 border-yellow-400 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-yellow-500" />
                Tambah Staf Admin Baru
              </h2>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">👤 Nama Lengkap</label>
                <input
                  type="text"
                  value={nama}
                  onChange={e => setNama(e.target.value)}
                  placeholder="Nama staf"
                  className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">📧 Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="email@contoh.com"
                  className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">🔑 Password</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 8 karakter"
                    className="w-full border rounded-xl px-4 py-2.5 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700">
              ℹ️ Staf ini akan bisa masuk ke dashboard admin dan mengelola pengguna, produk, pesanan, dan sengketa — <strong>tapi tidak bisa melihat menu Operator (pemilik).</strong>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => tambahMutation.mutate()}
                disabled={tambahMutation.isPending || !nama || !email || !password}
                className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-yellow-900 font-bold px-5 py-2.5 rounded-xl transition-colors text-sm"
              >
                {tambahMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Tambahkan Sekarang
              </button>
              <button onClick={() => setShowForm(false)} className="px-5 py-2.5 border rounded-xl text-sm hover:bg-muted transition-colors">
                Batal
              </button>
            </div>
          </div>
        )}

        {/* Daftar staf */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-muted/30 flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="font-semibold text-sm">Daftar Staf Admin ({staf.length} orang)</span>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
              Memuat data...
            </div>
          ) : staf.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-semibold text-muted-foreground">Belum ada staf admin</p>
              <p className="text-sm text-muted-foreground mt-1">Klik "Tambah Staf Baru" untuk menambahkan</p>
            </div>
          ) : (
            <div className="divide-y">
              {staf.map(s => (
                <div key={s.id} className="p-4 flex items-center gap-4 hover:bg-muted/20 transition-colors">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">
                    {s.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.email}</p>
                  </div>

                  {/* Status badge */}
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${s.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                    {s.status === "active" ? "✅ Aktif" : "🚫 Nonaktif"}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {/* Toggle aktif/nonaktif */}
                    <button
                      onClick={() => statusMutation.mutate({ id: s.id, status: s.status === "active" ? "suspended" : "active" })}
                      title={s.status === "active" ? "Nonaktifkan" : "Aktifkan"}
                      className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    >
                      {s.status === "active" ? <ShieldOff className="w-4 h-4 text-amber-500" /> : <ShieldCheck className="w-4 h-4 text-green-500" />}
                    </button>

                    {/* Reset password */}
                    <button
                      onClick={() => { setResetTarget(s); setNewPass(""); }}
                      title="Reset Password"
                      className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-blue-600"
                    >
                      <KeyRound className="w-4 h-4" />
                    </button>

                    {/* Hapus */}
                    <button
                      onClick={() => {
                        if (confirm(`Hapus staf "${s.name}"? Tindakan ini tidak bisa dibatalkan.`)) {
                          hapusMutation.mutate(s.id);
                        }
                      }}
                      title="Hapus Staf"
                      className="p-2 rounded-lg hover:bg-red-50 transition-colors text-muted-foreground hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info box */}
        <div className="bg-slate-900 text-white rounded-2xl p-5">
          <h3 className="font-bold text-sm flex items-center gap-2 mb-3">
            <ShieldCheck className="w-4 h-4 text-green-400" />
            Hak Akses Staf Admin vs Operator (Anda)
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-400 font-semibold mb-2">👥 Staf Admin — Bisa Akses:</p>
              <ul className="space-y-1 text-slate-300">
                {["Overview Dashboard","Monitoring Realtime","Moderasi Pengguna & Produk","Pengelolaan Pesanan","Sengketa Pembeli-Penjual","Persetujuan Penarikan Dana","CS / Pengaduan","Voucher / Kupon","Keamanan Sistem"].map(i => (
                  <li key={i} className="flex items-center gap-2"><span className="text-green-400">✓</span> {i}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-yellow-400 font-semibold mb-2">👑 Hanya Anda (Pemilik) — Bisa Akses:</p>
              <ul className="space-y-1 text-slate-300">
                {["Analytics Platform (pendapatan, grafik)","Pengaturan Platform (komisi, pajak, escrow)","Laporan Keuangan Detail","Kelola Staf Admin (halaman ini)"].map(i => (
                  <li key={i} className="flex items-center gap-2"><span className="text-yellow-400">👑</span> {i}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modal reset password */}
      {resetTarget && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-blue-500" />
                Reset Password
              </h3>
              <button onClick={() => setResetTarget(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Reset password untuk staf: <strong>{resetTarget.name}</strong>
            </p>
            <div className="space-y-3">
              <div className="relative">
                <input
                  type={showNewPass ? "text" : "password"}
                  value={newPass}
                  onChange={e => setNewPass(e.target.value)}
                  placeholder="Password baru (min. 8 karakter)"
                  className="w-full border rounded-xl px-4 py-3 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button type="button" onClick={() => setShowNewPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => resetMutation.mutate({ id: resetTarget.id, password: newPass })}
                  disabled={resetMutation.isPending || newPass.length < 8}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2"
                >
                  {resetMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                  Reset Sekarang
                </button>
                <button onClick={() => setResetTarget(null)} className="px-4 py-2.5 border rounded-xl text-sm hover:bg-muted">
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
