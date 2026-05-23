import { useGetAdminDashboardSummary, useAdminGetUsers, useAdminGetProducts } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatIDR } from "@/lib/format";
import { Users, Store, Package, DollarSign, AlertCircle, ShieldAlert } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

export default function AdminDashboard() {
  const { data: summary, isLoading: loadingSummary } = useGetAdminDashboardSummary();
  const { data: users, isLoading: loadingUsers } = useAdminGetUsers({});
  
  return (
    <AdminLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Platform Overview</h1>
          <p className="text-muted-foreground">Monitor platform health and key metrics.</p>
        </div>
      </div>

      {loadingSummary ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-primary/10 p-3 rounded-lg text-primary">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Platform Revenue</p>
              <h3 className="text-2xl font-bold">{formatIDR(summary?.totalRevenue || 0)}</h3>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                  <ShieldAlert className="w-5 h-5" />
                </div>
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Escrow Balance Held</p>
              <h3 className="text-2xl font-bold">{formatIDR(summary?.escrowBalance || 0)}</h3>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-indigo-100 p-3 rounded-lg text-indigo-600">
                  <Users className="w-5 h-5" />
                </div>
                <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">+{summary?.newUsersToday || 0} today</Badge>
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Users</p>
              <h3 className="text-2xl font-bold">{summary?.totalUsers || 0}</h3>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-emerald-100 p-3 rounded-lg text-emerald-600">
                  <Store className="w-5 h-5" />
                </div>
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Active Sellers</p>
              <h3 className="text-2xl font-bold">{summary?.activeSellers || 0}</h3>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-orange-100 p-3 rounded-lg text-orange-600">
                  <Package className="w-5 h-5" />
                </div>
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Products</p>
              <h3 className="text-2xl font-bold">{summary?.totalProducts || 0}</h3>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-red-100 p-3 rounded-lg text-red-600">
                  <AlertCircle className="w-5 h-5" />
                </div>
                {summary?.pendingDisputes ? (
                  <Badge variant="destructive" className="animate-pulse">Needs Action</Badge>
                ) : null}
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Pending Disputes</p>
              <h3 className="text-2xl font-bold text-red-600">{summary?.pendingDisputes || 0}</h3>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-red-100 p-3 rounded-lg text-red-600">
                  <AlertCircle className="w-5 h-5" />
                </div>
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Pending Reports</p>
              <h3 className="text-2xl font-bold text-red-600">{summary?.pendingReports || 0}</h3>
            </CardContent>
          </Card>
          
          <Card className="border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-amber-100 p-3 rounded-lg text-amber-600">
                  <AlertCircle className="w-5 h-5" />
                </div>
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Pending Withdrawals</p>
              <h3 className="text-2xl font-bold text-amber-600">{summary?.pendingWithdrawals || 0}</h3>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Users</CardTitle>
            <Link href="/admin/users" className="text-sm text-primary hover:underline">View All</Link>
          </CardHeader>
          <CardContent>
            {loadingUsers ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : (
              <div className="space-y-4">
                {users?.data?.slice(0, 5).map(user => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-medium">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{user.name}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">{user.role}</Badge>
                      <Badge variant={user.status === 'active' ? 'secondary' : 'destructive'} className="capitalize">{user.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
