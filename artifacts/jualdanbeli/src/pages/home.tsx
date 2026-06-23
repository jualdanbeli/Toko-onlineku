import { useGetFeaturedProducts, useGetTrendingProducts, useGetCategories } from "@workspace/api-client-react";
import { Link } from "wouter";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatIDR } from "@/lib/format";
import { ShieldCheck, Truck, Star, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const { data: featured, isLoading: loadingFeatured } = useGetFeaturedProducts();
  const { data: trending, isLoading: loadingTrending } = useGetTrendingProducts();
  const { data: categories, isLoading: loadingCategories } = useGetCategories();

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative rounded-2xl overflow-hidden mb-12 bg-gradient-to-r from-primary to-blue-400 p-8 md:p-12 text-primary-foreground shadow-lg">
        <div className="relative z-10 max-w-2xl">
          <Badge variant="secondary" className="mb-6 bg-white/20 text-white hover:bg-white/30 border-none px-3 py-1 text-xs">
            Dipercaya 2 Juta+ Pengguna
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            Jual & Beli Lebih Mudah, Aman, dan Terpercaya
          </h1>
          <p className="text-primary-foreground/90 text-lg mb-8 max-w-xl leading-relaxed">
            Marketplace Indonesia dengan sistem Rekening Bersama (Escrow) — uang Anda aman hingga barang diterima.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button size="lg" variant="secondary" className="font-semibold px-8" asChild>
              <Link href="/products">Mulai Belanja</Link>
            </Button>
            <Button size="lg" variant="outline" className="font-semibold px-8 bg-transparent text-white border-white hover:bg-white/10" asChild>
              <Link href="/register">Buka Toko</Link>
            </Button>
          </div>
        </div>
        
        {/* Trust Badges in Hero */}
        <div className="absolute right-8 bottom-8 hidden lg:flex gap-6 opacity-90">
          <div className="flex items-center gap-3 bg-black/10 backdrop-blur-md p-4 rounded-xl">
            <ShieldCheck className="w-8 h-8 text-white" />
            <div>
              <div className="font-bold text-sm">Rekening Bersama</div>
              <div className="text-xs text-white/80">Pembayaran 100% Aman</div>
            </div>
          </div>
        </div>
      </section>

      {/* Keunggulan Platform */}
      <section className="mb-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
          <ShieldCheck className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">Rekening Bersama</p>
            <p className="text-xs text-muted-foreground">Dana ditahan hingga barang diterima pembeli</p>
          </div>
        </div>
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
          <Truck className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">Pengiriman ke Seluruh Indonesia</p>
            <p className="text-xs text-muted-foreground">JNE, J&T, SiCepat, Gojek, dan lebih banyak lagi</p>
          </div>
        </div>
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
          <Star className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">Penjual Terverifikasi</p>
            <p className="text-xs text-muted-foreground">Semua penjual telah melalui proses verifikasi kami</p>
          </div>
        </div>
      </section>

      {/* Kategori */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Jelajahi Kategori</h2>
          <Button variant="ghost" asChild>
            <Link href="/categories">Lihat Semua</Link>
          </Button>
        </div>
        
        {loadingCategories ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories?.slice(0, 6).map((cat) => (
              <Link key={cat.id} href={`/products?categoryId=${cat.id}`}>
                <Card className="hover:border-primary transition-colors cursor-pointer group hover-elevate">
                  <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <span className="font-bold text-xl">{cat.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm leading-tight group-hover:text-primary transition-colors">{cat.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{cat.productCount || 0} produk</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Produk Trending */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
              <Star className="w-4 h-4 text-red-500 fill-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Sedang Trending</h2>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/products?sort=popular">Lihat Semua</Link>
          </Button>
        </div>

        {loadingTrending ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full rounded-xl" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {trending?.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`}>
                <Card className="h-full overflow-hidden hover:border-primary transition-colors group cursor-pointer hover-elevate">
                  <div className="aspect-square bg-muted relative overflow-hidden">
                    {product.images?.[0] ? (
                      <img 
                        src={product.images[0]} 
                        alt={product.name} 
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                        Tidak ada gambar
                      </div>
                    )}
                    {product.condition === 'used' && (
                      <Badge variant="secondary" className="absolute top-2 left-2 text-[10px]">Bekas</Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <div className="font-bold text-lg text-foreground mb-3">
                      {formatIDR(product.price)}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground gap-1">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{product.city || 'Indonesia'}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs">
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="font-medium">{product.averageRating?.toFixed(1) || '0'}</span>
                      </div>
                      <span className="text-muted-foreground">|</span>
                      <span className="text-muted-foreground">{product.totalSold || 0} terjual</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
      
      {/* Produk Pilihan */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-6">Rekomendasi untuk Anda</h2>
        {loadingFeatured ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full rounded-xl" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {featured?.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`}>
                <Card className="h-full overflow-hidden hover:border-primary transition-colors group cursor-pointer hover-elevate">
                  <div className="aspect-square bg-muted relative overflow-hidden">
                    {product.images?.[0] ? (
                      <img 
                        src={product.images[0]} 
                        alt={product.name} 
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                        Tidak ada gambar
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <div className="font-bold text-lg text-foreground mb-3">
                      {formatIDR(product.price)}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground gap-1">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{product.city || 'Indonesia'}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

    </MainLayout>
  );
}
