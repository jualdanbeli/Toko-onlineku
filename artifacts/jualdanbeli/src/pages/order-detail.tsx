import { useGetOrder, useConfirmOrderReceived, getGetOrderQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatIDR, formatDateTime } from "@/lib/format";
import { ShieldCheck, Truck, CheckCircle2, AlertTriangle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const orderId = parseInt(id || "0");
  const { data: order, isLoading } = useGetOrder(orderId, { query: { enabled: !!orderId } as any });
  
  const confirmReceived = useConfirmOrderReceived();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleConfirm = () => {
    confirmReceived.mutate({ orderId }, {
      onSuccess: () => {
        toast({ title: "Order confirmed!", description: "Escrow funds have been released to the seller." });
        queryClient.invalidateQueries({ queryKey: getGetOrderQueryKey(orderId) });
      }
    });
  };

  if (isLoading || !order) return <MainLayout><div className="p-8 text-center">Loading...</div></MainLayout>;

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Order #{order.id}</h1>
        <Badge variant="outline" className="text-sm px-3 py-1 bg-white">{order.status}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="text-lg">Items Purchased</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {order.items.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-20 h-20 bg-muted rounded-lg flex-shrink-0 overflow-hidden border">
                      {item.productImage && <img src={item.productImage} className="w-full h-full object-cover" alt="" />}
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <Link href={`/products/${item.productId}`} className="font-medium hover:text-primary hover:underline">
                        {item.productName}
                      </Link>
                      <div className="text-sm text-muted-foreground mt-1">
                        {item.quantity} x {formatIDR(item.unitPrice)}
                      </div>
                    </div>
                    <div className="font-semibold flex items-center">
                      {formatIDR(item.quantity * item.unitPrice)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Shipping Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <Truck className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-medium mb-1">{order.buyer?.name}</div>
                  <div className="text-muted-foreground text-sm leading-relaxed max-w-md">
                    {order.shippingAddress}
                  </div>
                  {order.trackingNumber && (
                    <div className="mt-4 p-3 bg-muted rounded-lg inline-block">
                      <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider block mb-1">Tracking Number</span>
                      <span className="font-mono font-medium">{order.trackingNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Items Total</span>
                  <span>{formatIDR(order.totalAmount - order.shippingCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{formatIDR(order.shippingCost)}</span>
                </div>
                <div className="border-t pt-3 mt-3 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">{formatIDR(order.totalAmount)}</span>
                </div>
              </div>
              
              <div className="p-3 bg-blue-50 text-blue-800 rounded-lg flex items-start gap-3 mb-6 text-sm">
                <ShieldCheck className="w-5 h-5 flex-shrink-0 text-blue-600" />
                <div>
                  <div className="font-semibold mb-0.5">Escrow Status: {order.escrowStatus}</div>
                  <p className="text-blue-700/80 leading-snug">
                    {order.escrowStatus === 'holding' 
                      ? "Funds are securely held in escrow. They will be released to the seller once you confirm receipt." 
                      : "Funds have been released."}
                  </p>
                </div>
              </div>

              {order.status === 'delivered' && (
                <div className="space-y-3">
                  <Button 
                    className="w-full font-bold" 
                    size="lg"
                    onClick={handleConfirm}
                    disabled={confirmReceived.isPending}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Confirm Received
                  </Button>
                  <Button variant="outline" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Open Dispute
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
