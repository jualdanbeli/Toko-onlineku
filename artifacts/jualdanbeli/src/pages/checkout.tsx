import { useGetCart, useCreateOrder, getGetCartQueryKey } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatIDR } from "@/lib/format";
import { ShieldCheck, Truck, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Checkout() {
  const { data: cart } = useGetCart();
  const createOrder = useCreateOrder();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const handleCheckout = () => {
    if (!address) {
      toast({ title: "Address required", description: "Please enter your shipping address", variant: "destructive" });
      return;
    }

    createOrder.mutate({
      data: {
        fromCart: true,
        shippingAddress: address,
        courierId: 1, // hardcoded for now
        notes,
        items: [] // handled by fromCart=true usually
      }
    }, {
      onSuccess: (res) => {
        toast({ title: "Order created successfully!" });
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        setLocation(`/orders/${res.id}`); // navigate to order detail/payment
      },
      onError: (err: any) => {
        toast({ title: "Checkout failed", description: err.message || "An error occurred", variant: "destructive" });
      }
    });
  };

  if (!cart || cart.items.length === 0) {
    return (
      <MainLayout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <Button asChild><Link href="/products">Continue Shopping</Link></Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Full Address</Label>
                <Textarea 
                  placeholder="Street name, building, house number..." 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label>Order Notes (Optional)</Label>
                <Input 
                  placeholder="Notes for seller or courier..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border border-primary/30 bg-primary/5 rounded-xl p-6 flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white mb-2">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg">Rekening Bersama (Escrow)</h3>
                <p className="text-sm text-muted-foreground">
                  Your payment will be securely held in our escrow account. It will only be released to the seller after you receive and confirm the item.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-20 shadow-md">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4">Order Summary</h3>
              <div className="space-y-4 mb-6">
                {cart.items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="truncate pr-4 text-muted-foreground">
                      {item.quantity}x {item.product?.name}
                    </span>
                    <span className="font-medium whitespace-nowrap">{formatIDR(item.unitPrice * item.quantity)}</span>
                  </div>
                ))}
                
                <div className="border-t pt-3 mt-3 space-y-2">
                  <div className="flex justify-between text-muted-foreground text-sm">
                    <span>Subtotal</span>
                    <span>{formatIDR(cart.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground text-sm">
                    <span>Shipping</span>
                    <span>{formatIDR(25000)} {/* dummy shipping */}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2">
                    <span>Total Payment</span>
                    <span className="text-primary">{formatIDR(cart.subtotal + 25000)}</span>
                  </div>
                </div>
              </div>

              <Button 
                className="w-full font-bold text-lg py-6" 
                onClick={handleCheckout}
                disabled={createOrder.isPending}
              >
                {createOrder.isPending ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
                Pay Securely
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
