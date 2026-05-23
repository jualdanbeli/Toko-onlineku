import { ReactNode } from "react";
import { Navbar } from "./Navbar";
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
            <p className="text-sm text-muted-foreground">
              Indonesia's trusted marketplace. Fast, secure, and vibrant trading for everyone.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Buy & Sell</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>How to Buy</li>
              <li>How to Sell</li>
              <li>Payment Methods</li>
              <li>Shipping Options</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground">Trust & Safety</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Escrow (Rekening Bersama)</li>
              <li>Buyer Protection</li>
              <li>Seller Protection</li>
              <li>Report a Problem</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground">Features</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center p-2 bg-muted rounded-lg text-center">
                <ShieldCheck className="w-5 h-5 text-primary mb-1" />
                <span className="text-[10px] font-medium">Safe Payment</span>
              </div>
              <div className="flex flex-col items-center p-2 bg-muted rounded-lg text-center">
                <Truck className="w-5 h-5 text-secondary mb-1" />
                <span className="text-[10px] font-medium">Fast Delivery</span>
              </div>
              <div className="flex flex-col items-center p-2 bg-muted rounded-lg text-center">
                <HeadphonesIcon className="w-5 h-5 text-chart-3 mb-1" />
                <span className="text-[10px] font-medium">24/7 Support</span>
              </div>
              <div className="flex flex-col items-center p-2 bg-muted rounded-lg text-center">
                <CreditCard className="w-5 h-5 text-chart-4 mb-1" />
                <span className="text-[10px] font-medium">Many Options</span>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} jualdanbeli. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
