import { useGetProduct, useAddToCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatIDR } from "@/lib/format";
import { Star, MapPin, ShieldCheck, Truck, Store, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const productId = parseInt(id || "0");
  
  const { data: product, isLoading } = useGetProduct(productId, {
    query: { enabled: !!productId } as any
  });

  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const addToCart = useAddToCart();

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast({
        title: "Please login",
        description: "You need to login to add items to cart.",
        variant: "destructive"
      });
      return;
    }
    
    addToCart.mutate({ data: { productId, quantity: 1 } }, {
      onSuccess: () => {
        toast({
          title: "Added to cart",
          description: `${product?.name} has been added to your cart.`
        });
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
      }
    });
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold">Product not found</h2>
          <Button asChild className="mt-4"><Link href="/products">Back to products</Link></Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-white rounded-2xl border p-4 md:p-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-xl overflow-hidden">
              {product.images?.[0] ? (
                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(1).map((img, i) => (
                  <div key={i} className="aspect-square rounded-lg bg-muted overflow-hidden border">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{product.name}</h1>
              <div className="flex items-center gap-4 text-sm mb-4">
                <div className="flex items-center gap-1 text-amber-500 font-medium">
                  <Star className="w-4 h-4 fill-current" />
                  {product.averageRating?.toFixed(1) || '0.0'} 
                  <span className="text-muted-foreground font-normal">({product.totalReviews || 0} reviews)</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-border" />
                <div className="text-muted-foreground">{product.totalSold || 0} sold</div>
                <div className="w-1 h-1 rounded-full bg-border" />
                <Badge variant="outline">{product.condition}</Badge>
              </div>
              <div className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
                {formatIDR(product.price)}
              </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-xl mb-6 space-y-3">
              <div className="flex items-center gap-3 text-sm font-medium">
                <ShieldCheck className="w-5 h-5 text-primary" />
                Protected by Rekening Bersama Escrow
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Truck className="w-5 h-5 text-secondary" />
                Ships nationwide from {product.city || 'Indonesia'}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="font-semibold text-lg mb-2">Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed text-sm">
                {product.description}
              </p>
            </div>

            <div className="mt-auto pt-6 border-t flex items-center gap-4">
              <Button 
                size="lg" 
                variant="outline" 
                className="flex-1 border-primary text-primary hover:bg-primary/5 font-semibold"
                onClick={handleAddToCart}
                disabled={addToCart.isPending || product.stock <= 0}
              >
                Add to Cart
              </Button>
              <Button size="lg" className="flex-1 font-semibold">
                Buy Now
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Seller Info */}
      <div className="bg-white rounded-2xl border p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
            {product.seller?.avatarUrl ? (
              <img src={product.seller.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <Store className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-lg">{product.seller?.sellerInfo?.shopName || product.seller?.name}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-3 h-3" />
              {product.seller?.sellerInfo?.city || 'Online'}
            </div>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" className="flex-1 md:flex-none">
            <MessageCircle className="w-4 h-4 mr-2" />
            Chat
          </Button>
          <Button variant="outline" className="flex-1 md:flex-none" asChild>
            <Link href={`/profile/${product.sellerId}`}>Visit Shop</Link>
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
