import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Users, Package, ShoppingBag, AlertTriangle, ArrowLeft, LogOut, FileWarning, WalletCards, HeadphonesIcon } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useLogout } from "@workspace/api-client-react";

export function AdminLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { clearToken } = useAuth();
  const logoutMutation = useLogout();

  const navItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/admin" },
    { icon: Users, label: "Users", href: "/admin/users" },
    { icon: Package, label: "Products", href: "/admin/products" },
    { icon: ShoppingBag, label: "Orders", href: "/admin/orders" },
    { icon: AlertTriangle, label: "Disputes", href: "/admin/disputes" },
    { icon: FileWarning, label: "Reports", href: "/admin/reports" },
    { icon: WalletCards, label: "Withdrawals", href: "/admin/withdrawals" },
    { icon: HeadphonesIcon, label: "CS / Pengaduan", href: "/admin/support" },
  ];

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#111] text-zinc-300 flex-shrink-0 hidden md:flex flex-col">
        <div className="h-16 border-b border-zinc-800 flex items-center px-6">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <span className="font-bold text-white tracking-wide">Admin Portal</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href || (location.startsWith(item.href + "/") && item.href !== "/admin");
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive 
                    ? "bg-primary/20 text-primary font-medium" 
                    : "hover:bg-zinc-800 hover:text-white"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : ""}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <Link href="/" className="flex items-center gap-3 px-3 py-2 text-sm hover:text-white transition-colors mb-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </Link>
          <button 
            className="flex w-full items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            onClick={() => {
              logoutMutation.mutate(undefined, {
                onSuccess: clearToken
              });
            }}
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b bg-white flex items-center justify-between px-6 md:hidden">
          <span className="font-bold">Admin Portal</span>
        </header>
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
