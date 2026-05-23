import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { useLogout, useGetCart } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ShoppingCart, 
  Search, 
  Menu, 
  User, 
  Store,
  LogOut,
  ShieldCheck
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export function Navbar() {
  const { user, isAuthenticated, clearToken } = useAuth();
  const logoutMutation = useLogout();
  
  const { data: cart } = useGetCart({
    query: { enabled: isAuthenticated && user?.role === "buyer" } as any
  });

  const cartItemsCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        clearToken();
      }
    });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
              <Store className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-primary tracking-tight hidden sm:inline-block">
              jualdanbeli
            </span>
          </Link>
        </div>

        <div className="flex-1 max-w-2xl px-4 hidden md:flex">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search products, categories..." 
              className="w-full pl-9 bg-muted border-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {isAuthenticated && user?.role === "buyer" && (
            <Link href="/cart" className="relative p-2 text-foreground hover:bg-muted rounded-full transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {cartItemsCount > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 px-1.5 min-w-[20px] h-5 flex items-center justify-center rounded-full text-xs">
                  {cartItemsCount}
                </Badge>
              )}
            </Link>
          )}

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {user?.role === "buyer" && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/orders" className="cursor-pointer">My Orders</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/wallet" className="cursor-pointer">Wallet</Link>
                    </DropdownMenuItem>
                  </>
                )}

                {user?.role === "seller" && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/seller/dashboard" className="cursor-pointer">Seller Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/seller/products" className="cursor-pointer">My Products</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/seller/orders" className="cursor-pointer">Shop Orders</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/wallet" className="cursor-pointer">Wallet</Link>
                    </DropdownMenuItem>
                  </>
                )}

                {user?.role === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="cursor-pointer">Admin Dashboard</Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild className="hidden sm:inline-flex">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Sign up</Link>
              </Button>
            </div>
          )}
          
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
