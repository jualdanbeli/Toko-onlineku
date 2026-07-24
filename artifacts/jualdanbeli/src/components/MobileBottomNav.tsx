import { Link, useLocation } from "wouter";
import { Home, Grid3X3, Zap, Bell, User } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useGetCart, useGetNotifications } from "@workspace/api-client-react";

export function MobileBottomNav() {
  const [location] = useLocation();
  const { user } = useAuth();

  const { data: cartData } = useGetCart();
  const { data: notifData } = useGetNotifications();

  const cartCount = (cartData as any)?.items?.length ?? 0;
  const unreadNotif = (Array.isArray(notifData) ? notifData : []).filter((n: any) => !n.isRead).length;

  const tabs = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/categories", icon: Grid3X3, label: "Kategori" },
    { href: "/products?sort=flash_sale", icon: Zap, label: "Flash Sale", accent: true },
    { href: "/notifications", icon: Bell, label: "Notifikasi", badge: unreadNotif },
    { href: user ? "/settings" : "/login", icon: User, label: user ? "Akun" : "Masuk" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href.split("?")[0]);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t md:hidden">
      <div className="flex items-stretch h-14">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 relative transition-colors ${
                tab.accent
                  ? "text-orange-500"
                  : active
                  ? "text-primary"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab.accent && (
                <div className="absolute -top-3 w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                  <tab.icon className="w-5 h-5 text-white" />
                </div>
              )}
              {!tab.accent && (
                <div className="relative">
                  <tab.icon className="w-5 h-5" />
                  {(tab.badge ?? 0) > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                      {(tab.badge ?? 0) > 99 ? "99+" : tab.badge}
                    </span>
                  )}
                </div>
              )}
              <span className={`text-[10px] font-medium ${tab.accent ? "mt-4" : "mt-0.5"}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
