import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";

import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Products from "@/pages/products";
import ProductDetail from "@/pages/product-detail";
import Categories from "@/pages/categories";
import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout";
import Orders from "@/pages/orders";
import OrderDetail from "@/pages/order-detail";
import SellerDashboard from "@/pages/seller/dashboard";
import SellerProducts from "@/pages/seller/products";
import ProductForm from "@/pages/seller/product-form";
import SellerOrders from "@/pages/seller/orders";
import Wallet from "@/pages/wallet";
import Settings from "@/pages/settings";
import Profile from "@/pages/profile";
import Messages from "@/pages/messages";
import MessageDetail from "@/pages/message-detail";
import Notifications from "@/pages/notifications";

import AdminDashboard from "@/pages/admin/dashboard";
import AdminUsers from "@/pages/admin/users";
import AdminProducts from "@/pages/admin/products";
import AdminOrders from "@/pages/admin/orders";
import AdminDisputes from "@/pages/admin/disputes";
import AdminReports from "@/pages/admin/reports";
import AdminWithdrawals from "@/pages/admin/withdrawals";
import Terms from "@/pages/terms";
import Privacy from "@/pages/privacy";
import About from "@/pages/about";
import SellerKYC from "@/pages/seller-kyc";
import Support from "@/pages/support";
import AdminSupport from "@/pages/admin/support";
import Wishlist from "@/pages/wishlist";
import AdminVouchers from "@/pages/admin/vouchers";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      <Route path="/products" component={Products} />
      <Route path="/products/:id" component={ProductDetail} />
      <Route path="/categories" component={Categories} />
      <Route path="/profile/:userId" component={Profile} />
      
      {/* Buyer Routes */}
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/orders" component={Orders} />
      <Route path="/orders/:id" component={OrderDetail} />
      
      {/* Seller Routes */}
      <Route path="/seller/dashboard" component={SellerDashboard} />
      <Route path="/seller/products" component={SellerProducts} />
      <Route path="/seller/products/new" component={ProductForm} />
      <Route path="/seller/orders" component={SellerOrders} />
      
      {/* Shared Authenticated Routes */}
      <Route path="/wallet" component={Wallet} />
      <Route path="/settings" component={Settings} />
      <Route path="/messages" component={Messages} />
      <Route path="/messages/:id" component={MessageDetail} />
      <Route path="/notifications" component={Notifications} />
      
      {/* Admin Routes */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/products" component={AdminProducts} />
      <Route path="/admin/orders" component={AdminOrders} />
      <Route path="/admin/disputes" component={AdminDisputes} />
      <Route path="/admin/reports" component={AdminReports} />
      <Route path="/admin/withdrawals" component={AdminWithdrawals} />

      {/* Legal & Info Pages */}
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/about" component={About} />
      <Route path="/seller/register" component={SellerKYC} />
      <Route path="/support" component={Support} />
      <Route path="/admin/support" component={AdminSupport} />
      <Route path="/wishlist" component={Wishlist} />
      <Route path="/admin/vouchers" component={AdminVouchers} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
