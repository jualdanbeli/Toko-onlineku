import { useGetCart, useCreateOrder, getGetCartQueryKey } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { formatIDR } from "@/lib/format";
import { ShieldCheck, Truck, Loader2, Tag, CheckCircle2, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const API_BASE = "/api";
const SHIPPING_COST = 25000;

async function applyVoucher(token: string, code: string, orderTotal: number) {
  const res = await fetch(`${API_BASE}/vouchers/apply`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ code, orderTotal }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Voucher tidak valid");
  return data as { discount: number; finalTotal: number; voucher: { code: string; type: string; value: number; description: string } };
}

export default function Checkout() {
  const { data: cart } = useGetCart();
  const createOrder = useCreateOrder();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const token = localStorage.getItem("token") || "";

  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherResult, setVoucherResult] = useState<{ discount: number; voucher: { code: string; type: string; value: number; description?: string } } | null>(null);
  const [applyingVoucher, setApplyingVoucher] = useState(false);

  const subtotal = cart?.subtotal ?? 0;
  const discount = voucherResult?.discount ?? 0;
  const total = subtotal + SHIPPING_COST - discount;

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return;
    setApplyingVoucher(true);
    try {
      const result = await applyVoucher(token, voucherCode, subtotal + SHIPPING_COST);
      setVoucherResult(result);
      toast({ title: `Voucher "${result.voucher.code}" berhasil!`, description: `Hemat ${formatIDR(result.discount)}` });
    } catch (err: any) {
      toast({ title: "Voucher tidak valid", description: err.message, variant: "destructive" });
    } finally {
      setApplyingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    setVoucherResult(null);
    setVoucherCode("");
  };

  const handleCheckout = () => {
    if (!address) {
      toast({ title: "Alamat diperlukan", description: "Masukkan alamat pengiriman Anda", variant: "destructive" });
      return;
    }
    createOrder.mutate({
      data: {
        fromCart: true,
        shippingAddress: address,
        courierId: 1,
        notes,
        items: [],
      }
    }, {
      onSuccess: (res) => {
        toast({ title: "Pesanan berhasil dibuat!" });
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        setLocation(`/orders/${res.id}`);
      },
      onError: (err: any) => {
        toast({ title: "Checkout gagal", description: err.message || "Terjadi kesalahan", variant: "destructive" });
      }
    });
  };

  if (!cart || cart.items.length === 0) {
    return (
      <MainLayout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-4">Keranjang kosong</h2>
          <Button asChild><Link href="/products">Lanjut Belanja</Link></Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping */}
          <Card>
            <CardHeader><CardTitle>Informasi Pengiriman</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Alamat Lengkap</Label>
                <Textarea
                  placeholder="Nama jalan, nomor rumah, kelurahan, kecamatan, kota, provinsi, kode pos..."
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label>Catatan untuk Penjual (opsional)</Label>
                <Input placeholder="Misal: warna merah, ukuran M..." value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          {/* Voucher */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Tag className="w-5 h-5 text-primary" />Kode Voucher / Kupon</CardTitle></CardHeader>
            <CardContent>
              {voucherResult ? (
                <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-green-800 text-sm">{voucherResult.voucher.code} — Hemat {formatIDR(discount)}</p>
                    <p className="text-xs text-green-700">
                      {voucherResult.voucher.type === "percentage"
                        ? `Diskon ${voucherResult.voucher.value}%`
                        : `Potongan ${formatIDR(voucherResult.voucher.value)}`}
                    </p>
                  </div>
                  <button onClick={handleRemoveVoucher} className="text-muted-foreground hover:text-destructive transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Masukkan kode voucher..."
                    value={voucherCode}
                    onChange={e => setVoucherCode(e.target.value.toUpperCase())}
                    className="flex-1 font-mono"
                    onKeyDown={e => e.key === "Enter" && handleApplyVoucher()}
                  />
                  <Button variant="outline" onClick={handleApplyVoucher} disabled={!voucherCode.trim() || applyingVoucher}>
                    {applyingVoucher ? <Loader2 className="w-4 h-4 animate-spin" /> : "Pakai"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment method */}
          <Card>
            <CardHeader><CardTitle>Metode Pembayaran</CardTitle></CardHeader>
            <CardContent>
              <div className="border border-primary/30 bg-primary/5 rounded-xl p-6 flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white mb-2">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg">Rekening Bersama (Escrow)</h3>
                <p className="text-sm text-muted-foreground">
                  Pembayaran ditahan aman oleh platform. Dana hanya dikirim ke penjual setelah Anda mengkonfirmasi penerimaan barang.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20 shadow-md">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4">Ringkasan Pesanan</h3>
              <div className="space-y-3 mb-4">
                {cart.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div className="flex items-center gap-2 min-w-0 flex-1 pr-3">
                      {item.product?.images?.[0] && (
                        <img src={item.product.images[0]} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" />
                      )}
                      <span className="truncate text-muted-foreground">{item.quantity}x {item.product?.name}</span>
                    </div>
                    <span className="font-medium whitespace-nowrap">{formatIDR(item.unitPrice * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatIDR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5" />Ongkir</span>
                  <span>{formatIDR(SHIPPING_COST)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" />Voucher</span>
                    <span>-{formatIDR(discount)}</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between font-bold text-lg">
                  <span>Total Bayar</span>
                  <span className="text-primary">{formatIDR(total)}</span>
                </div>
              </div>

              {discount > 0 && (
                <Badge className="mt-2 w-full justify-center bg-green-100 text-green-700 hover:bg-green-100">
                  Anda hemat {formatIDR(discount)}!
                </Badge>
              )}

              <Button
                className="w-full font-bold text-base py-6 mt-4"
                onClick={handleCheckout}
                disabled={createOrder.isPending}
              >
                {createOrder.isPending ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <ShieldCheck className="w-5 h-5 mr-2" />}
                Bayar Sekarang
              </Button>

              <p className="text-center text-xs text-muted-foreground mt-3">
                Dengan membayar, Anda menyetujui <Link href="/terms" className="text-primary hover:underline">Syarat & Ketentuan</Link> kami
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
