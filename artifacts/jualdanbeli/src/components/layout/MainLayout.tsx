import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Link } from "wouter";
import { ShieldCheck, Truck, HeadphonesIcon, CreditCard } from "lucide-react";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="bg-white border-t py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-primary text-primary-foreground p-1 rounded-lg">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-primary">jualdanbeli</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Marketplace terpercaya Indonesia. Transaksi aman, cepat, dan terlindungi sistem Rekening Bersama.
            </p>
            <p className="text-xs text-muted-foreground">
              jualdanbeli — Usaha Perseorangan<br />
              NIB: <span className="font-mono font-medium text-foreground">2403240017145</span><br />
              KBLI 47911 — Perdagangan Melalui Internet
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground">Jual & Beli</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/products" className="hover:text-primary transition-colors">Semua Produk</Link></li>
              <li><Link href="/categories" className="hover:text-primary transition-colors">Kategori</Link></li>
              <li><Link href="/seller/register" className="hover:text-primary transition-colors">Daftar Jadi Penjual</Link></li>
              <li><Link href="/cart" className="hover:text-primary transition-colors">Keranjang Belanja</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground">Bantuan & Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary transition-colors">Tentang Kami</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Syarat & Ketentuan</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Kebijakan Privasi</Link></li>
              <li><a href="mailto:cs@jualdanbeli.com" className="hover:text-primary transition-colors">Hubungi Kami</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground">Keunggulan Kami</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col items-center p-3 bg-muted rounded-lg text-center">
                <ShieldCheck className="w-5 h-5 text-primary mb-1" />
                <span className="text-[10px] font-medium">Rekening Bersama</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-muted rounded-lg text-center">
                <Truck className="w-5 h-5 text-orange-500 mb-1" />
                <span className="text-[10px] font-medium">Multi Kurir</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-muted rounded-lg text-center">
                <HeadphonesIcon className="w-5 h-5 text-blue-500 mb-1" />
                <span className="text-[10px] font-medium">CS 24/7</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-muted rounded-lg text-center">
                <CreditCard className="w-5 h-5 text-green-500 mb-1" />
                <span className="text-[10px] font-medium">Dompet Digital</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 mt-10 pt-6 border-t flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} jualdanbeli · NIB <span className="font-mono">2403240017145</span> · Terdaftar di OSS Indonesia</span>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-primary transition-colors">Syarat & Ketentuan</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">Kebijakan Privasi</Link>
            <Link href="/about" className="hover:text-primary transition-colors">Tentang Kami</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
