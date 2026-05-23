import { useAdminGetUsers, useAdminUpdateUserStatus, getAdminGetUsersQueryKey } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Search, ShieldAlert, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const { data: usersData, isLoading } = useAdminGetUsers({ q: search });
  const updateStatus = useAdminUpdateUserStatus();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleStatusChange = (userId: number, status: 'active' | 'suspended' | 'banned') => {
    updateStatus.mutate({ userId, data: { status } }, {
      onSuccess: () => {
        toast({ title: "User status updated" });
        queryClient.invalidateQueries({ queryKey: getAdminGetUsersQueryKey() });
      }
    });
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">User Management</h1>
          <p className="text-muted-foreground">Manage buyers, sellers, and administrators.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search users..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersData?.data.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{user.role}</Badge>
                        {user.role === 'seller' && user.sellerInfo?.shopName && (
                          <div className="text-xs text-muted-foreground mt-1">Shop: {user.sellerInfo.shopName}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={user.status === 'active' ? 'secondary' : 'destructive'} 
                          className="capitalize"
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {user.status !== 'active' && (
                              <DropdownMenuItem onClick={() => handleStatusChange(user.id, 'active')} className="text-green-600">
                                <ShieldCheck className="w-4 h-4 mr-2" /> Activate
                              </DropdownMenuItem>
                            )}
                            {user.status !== 'suspended' && (
                              <DropdownMenuItem onClick={() => handleStatusChange(user.id, 'suspended')} className="text-amber-600">
                                <ShieldAlert className="w-4 h-4 mr-2" /> Suspend
                              </DropdownMenuItem>
                            )}
                            {user.status !== 'banned' && (
                              <DropdownMenuItem onClick={() => handleStatusChange(user.id, 'banned')} className="text-red-600">
                                <ShieldAlert className="w-4 h-4 mr-2" /> Ban
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!usersData?.data || usersData.data.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
