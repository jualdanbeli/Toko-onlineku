import { useGetOrder, useConfirmOrderReceived, getGetOrderQueryKey, useOpenDispute } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { formatIDR, formatDateTime } from "@/lib/format";
import { ShieldCheck, Truck, CheckCircle2, AlertTriangle, Package, ClipboardCheck, Star, Clock } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const STATUS_STEPS = [
  { key: "paid",        label: "Pembayaran Dikonfirmasi", icon: ShieldCheck,    desc: "Dana aman di Rekening Bersama" },
  { key: "confirmed",   label: "Pesanan Dikonfirmasi",    icon: ClipboardCheck, desc: "Penjual memproses pesanan Anda" },
  { key: "shipped",     label: "Dalam Pengiriman",        icon: Truck,          desc: "Paket dalam perjalanan" },
  { key: "delivered",   label: "Tiba di Tujuan",          icon: Package,        desc: "Paket telah diterima kurir" },
  { key: "completed",   label: "Pesanan Selesai",         icon: Star,           desc: "Dana dikirim ke penjual" },
];

function getStepIndex(status: string) {
  const map: Record<string, number> = { paid: 0, confirmed: 1, shipped: 2, delivered: 3, completed: 4 };
  return map[status] ?? -1;
}

function OrderTimeline({ status }: { status: string }) {
  const current = getStepIndex(status);
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800">
        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
        <div>
          <p className="font-semibold">Pesanan Dibatalkan</p>
          <p className="text-sm text-red-700">Pesanan ini telah dibatalkan.</p>
        </div>
      </div>
    );
  }
  if (status === "disputed") {
    return (
      <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
        <div>
          <p className="font-semibold">Dalam Proses Sengketa</p>
          <p className="text-sm text-amber-700">Tim admin sedang menangani sengketa Anda.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-0">
      {STATUS_STEPS.map((step, i) => {
        const done = i <= current;
        const active = i === current;
        const Icon = step.icon;
        return (
          <div key={step.key} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
                done ? "bg-primary border-primary text-white" : "bg-white border-muted text-muted-foreground"
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              {i < STATUS_STEPS.length - 1 && (
                <div className={`w-0.5 h-8 mt-1 ${i < current ? "bg-primary" : "bg-muted"}`} />
              )}
            </div>
            <div className="pt-1.5 pb-6">
              <p className={`font-semibold text-sm ${active ? "text-primary" : done ? "text-foreground" : "text-muted-foreground"}`}>
                {step.label}
                {active && <span className="ml-2 inline-flex items-center gap-1 text-xs text-primary"><Clock className="w-3 h-3" />Saat ini</span>}
              </p>
              <p className="text-xs text-muted-foreground">{step.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const orderId = parseInt(id || "0");
  const { data: order, isLoading } = useGetOrder(orderId, { query: { enabled: !!orderId } as any });
  const { user } = useAuth();

  const confirmReceived = useConfirmOrderReceived();
  const openDispute = useOpenDispute();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [disputeReason, setDisputeReason] = useState("");
  const [disputeDesc, setDisputeDesc] = useState("");
  const [disputeOpen, setDisputeOpen] = useState(false);

  const handleConfirm = () => {
    confirmReceived.mutate({ orderId }, {
      onSuccess: () => {
        toast({ title: "Pesanan dikonfirmasi!", description: "Dana escrow telah dikirim ke penjual." });
        queryClient.invalidateQueries({ queryKey: getGetOrderQueryKey(orderId) });
      }
    });
  };

  const handleDispute = (e: React.FormEvent) => {
    e.preventDefault();
    openDispute.mutate({ orderId, data: { reason: disputeReason as any, description: disputeDesc } }, {
      onSuccess: () => {
        toast({ title: "Sengketa dibuka", description: "Tim admin akan segera menangani." });
        setDisputeOpen(false);
        queryClient.invalidateQueries({ queryKey: getGetOrderQueryKey(orderId) });
      },
      onError: (err: any) => toast({ title: "Gagal", description: err.message, variant: "destructive" }),
    });
  };

  const statusColor: Record<string, string> = {
    paid: "bg-blue-100 text-blue-700",
    confirmed: "bg-indigo-100 text-indigo-700",
    shipped: "bg-orange-100 text-orange-700",
    delivered: "bg-teal-100 text-teal-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    disputed: "bg-amber-100 text-amber-700",
  };

  const statusLabel: Record<string, string> = {
    paid: "Dibayar",
    confirmed: "Dikonfirmasi",
    shipped: "Dikirim",
    delivered: "Tiba",
    completed: "Selesai",
    cancelled: "Dibatalkan",
    disputed: "Sengketa",
  };

  if (isLoading || !order) return <MainLayout><div className="p-8 text-center">Memuat...</div></MainLayout>;

  const isBuyer = user?.id === order.buyer?.id;

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Pesanan #{order.id}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{formatDateTime(order.createdAt)}</p>
        </div>
        <Badge className={`text-sm px-3 py-1 ${statusColor[order.status] || "bg-muted"}`}>
          {statusLabel[order.status] || order.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Timeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Status Pesanan</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderTimeline status={order.status} />
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="text-base">Produk yang Dibeli</CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="space-y-5">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-20 h-20 bg-muted rounded-xl flex-shrink-0 overflow-hidden border">
                      {item.productImage
                        ? <img src={item.productImage} className="w-full h-full object-cover" alt="" />
                        : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>}
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <Link href={`/products/${item.productId}`} className="font-medium hover:text-primary hover:underline text-sm">
                        {item.productName}
                      </Link>
                      <div className="text-sm text-muted-foreground mt-1">{item.quantity} x {formatIDR(item.unitPrice)}</div>
                    </div>
                    <div className="font-semibold flex items-center text-sm">{formatIDR(item.quantity * item.unitPrice)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Shipping */}
          <Card>
            <CardHeader><CardTitle className="text-base">Informasi Pengiriman</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <Truck className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-medium mb-1">{order.buyer?.name}</div>
                  <div className="text-muted-foreground text-sm leading-relaxed max-w-md">{order.shippingAddress}</div>
                  {order.trackingNumber && (
                    <div className="mt-4 p-3 bg-muted rounded-lg inline-block">
                      <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider block mb-1">No. Resi</span>
                      <span className="font-mono font-medium">{order.trackingNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-4">
          {/* Payment summary */}
          <Card>
            <CardHeader><CardTitle className="text-base">Ringkasan Pembayaran</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Produk</span>
                  <span>{formatIDR(order.totalAmount - order.shippingCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ongkir</span>
                  <span>{formatIDR(order.shippingCost)}</span>
                </div>
                <div className="border-t pt-3 mt-2 flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span className="text-primary">{formatIDR(order.totalAmount)}</span>
                </div>
              </div>

              <div className={`p-3 rounded-xl flex items-start gap-3 text-sm mb-4 ${order.escrowStatus === "released" ? "bg-green-50 border border-green-200 text-green-800" : "bg-blue-50 border border-blue-200 text-blue-800"}`}>
                <ShieldCheck className={`w-5 h-5 flex-shrink-0 ${order.escrowStatus === "released" ? "text-green-600" : "text-blue-600"}`} />
                <div>
                  <div className="font-semibold mb-0.5">
                    {order.escrowStatus === "released" ? "Dana Sudah Dicairkan" : "Dana di Rekening Bersama"}
                  </div>
                  <p className="leading-snug opacity-80">
                    {order.escrowStatus === "holding"
                      ? "Dana Anda aman. Akan dikirim ke penjual setelah konfirmasi terima."
                      : "Dana telah dikirim ke penjual setelah Anda konfirmasi."}
                  </p>
                </div>
              </div>

              {isBuyer && order.status === "delivered" && (
                <div className="space-y-2">
                  <Button className="w-full font-bold" size="lg" onClick={handleConfirm} disabled={confirmReceived.isPending}>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {confirmReceived.isPending ? "Memproses..." : "Konfirmasi Terima Barang"}
                  </Button>
                  <Dialog open={disputeOpen} onOpenChange={setDisputeOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10">
                        <AlertTriangle className="w-4 h-4 mr-2" />Buka Sengketa
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Buka Sengketa untuk Pesanan #{order.id}</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleDispute} className="space-y-4">
                        <div className="space-y-2">
                          <Label>Alasan Sengketa</Label>
                          <Input placeholder="Contoh: Barang tidak sesuai deskripsi" value={disputeReason} onChange={e => setDisputeReason(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                          <Label>Deskripsi Detail</Label>
                          <Textarea placeholder="Jelaskan masalah yang Anda alami..." value={disputeDesc} onChange={e => setDisputeDesc(e.target.value)} className="min-h-[100px]" required />
                        </div>
                        <Button type="submit" variant="destructive" className="w-full" disabled={openDispute.isPending}>
                          {openDispute.isPending ? "Mengirim..." : "Kirim Laporan Sengketa"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Seller info */}
          {order.seller && (
            <Card>
              <CardHeader><CardTitle className="text-base">Penjual</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-primary">
                    {(order.seller.sellerInfo?.shopName || order.seller.name || "S")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{order.seller.sellerInfo?.shopName || order.seller.name}</p>
                    <p className="text-xs text-muted-foreground">{order.seller.sellerInfo?.city || ""}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
