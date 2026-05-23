import { useUpdateUser } from "@workspace/api-client-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { SellerLayout } from "@/components/layout/SellerLayout";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetMeQueryKey } from "@workspace/api-client-react";

export default function Settings() {
  const { user } = useAuth();
  const updateUser = useUpdateUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    shopName: "",
    shopDescription: "",
    city: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        address: "", // Need to add to user model if it exists
        shopName: user.sellerInfo?.shopName || "",
        shopDescription: user.sellerInfo?.shopDescription || "",
        city: user.sellerInfo?.city || "",
      });
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    updateUser.mutate({
      userId: user.id,
      data: formData
    }, {
      onSuccess: () => {
        toast({ title: "Profile updated successfully" });
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      },
      onError: (err: any) => {
        toast({ title: "Update failed", description: err.message, variant: "destructive" });
      }
    });
  };

  const Layout = user?.role === "seller" ? SellerLayout : MainLayout;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Account Settings</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input value={user?.email || ""} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input 
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Default Shipping Address</Label>
                <Textarea 
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  placeholder="Complete address for delivery..."
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

          {user?.role === "seller" && (
            <Card>
              <CardHeader>
                <CardTitle>Shop Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Shop Name</Label>
                    <Input 
                      value={formData.shopName}
                      onChange={e => setFormData({...formData, shopName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>City / Origin</Label>
                    <Input 
                      value={formData.city}
                      onChange={e => setFormData({...formData, city: e.target.value})}
                      placeholder="e.g. Jakarta Selatan"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Shop Description</Label>
                  <Textarea 
                    value={formData.shopDescription}
                    onChange={e => setFormData({...formData, shopDescription: e.target.value})}
                    placeholder="Tell buyers what you sell..."
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={updateUser.isPending}>
              {updateUser.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
