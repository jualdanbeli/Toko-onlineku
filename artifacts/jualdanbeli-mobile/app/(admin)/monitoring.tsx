import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import {
  ActivityIndicator, RefreshControl, ScrollView, Text, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

function useMonitoring() {
  const { token } = useAuth();
  return useQuery<any>({
    queryKey: ["admin-monitoring-detail"],
    queryFn: async () => {
      const base = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;
      const res = await fetch(`${base}/api/admin/monitoring`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal");
      return res.json();
    },
    refetchInterval: 15_000,
    enabled: !!token,
  });
}

interface MetricRowProps {
  label: string;
  value: string | number;
  icon: string;
  color?: string;
}

function MetricRow({ label, value, icon, color }: MetricRowProps) {
  const colors = useColors();
  return (
    <View style={{
      flexDirection: "row", alignItems: "center", gap: 12,
      paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border,
    }}>
      <View style={{
        width: 34, height: 34, borderRadius: 9,
        backgroundColor: (color ?? colors.primary) + "18",
        alignItems: "center", justifyContent: "center",
      }}>
        <Feather name={icon as any} size={16} color={color ?? colors.primary} />
      </View>
      <Text style={{ flex: 1, fontFamily: "Inter_400Regular", fontSize: 14, color: colors.foreground }}>
        {label}
      </Text>
      <Text style={{ fontFamily: "Inter_700Bold", fontSize: 16, color: color ?? colors.foreground }}>
        {value}
      </Text>
    </View>
  );
}

export default function AdminMonitoringScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data, isLoading, refetch, isRefetching } = useMonitoring();

  const stats = data?.platformStats ?? {};
  const fraudAlerts: any[] = data?.fraudAlerts ?? [];
  const recentBanLogs: any[] = data?.recentBanLogs ?? [];
  const pendingReports: any[] = data?.pendingReports ?? [];

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  if (isLoading) {
    return <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1, marginTop: 60 }} />;
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
    >
      {/* Live indicator */}
      <View style={{
        flexDirection: "row", alignItems: "center", gap: 8,
        backgroundColor: "#0f172a", paddingHorizontal: 16, paddingVertical: 10,
      }}>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#22c55e" }} />
        <Text style={{ color: "#fff", fontFamily: "Inter_500Medium", fontSize: 13 }}>
          Live · Update setiap 15 detik
        </Text>
      </View>

      {/* Platform Stats */}
      <View style={{ margin: 16 }}>
        <Text style={{ fontSize: 12, fontFamily: "Inter_700Bold", color: colors.mutedForeground, letterSpacing: 1, marginBottom: 8 }}>
          STATISTIK PLATFORM
        </Text>
        <View style={{
          backgroundColor: colors.card, borderRadius: 14,
          borderWidth: 1, borderColor: colors.border, paddingHorizontal: 16,
        }}>
          <MetricRow label="Total Pengguna" value={stats.totalUsers ?? 0} icon="users" color="#2563eb" />
          <MetricRow label="Pengguna Aktif" value={stats.activeUsers ?? 0} icon="user-check" color="#16a34a" />
          <MetricRow label="User Tersuspend" value={stats.suspendedUsers ?? 0} icon="pause-circle" color="#d97706" />
          <MetricRow label="User Dibanned" value={stats.bannedUsers ?? 0} icon="x-circle" color="#dc2626" />
          <MetricRow label="Total Produk" value={stats.totalProducts ?? 0} icon="package" color="#7c3aed" />
          <MetricRow label="Total Pesanan" value={stats.totalOrders ?? 0} icon="shopping-bag" color="#0891b2" />
          <MetricRow label="Laporan Pending" value={stats.pendingReports ?? 0} icon="flag" color="#ea580c" />
          <MetricRow label="Sengketa Pending" value={stats.pendingDisputes ?? 0} icon="alert-triangle" color="#dc2626" />
          <View style={{ paddingVertical: 12 }}>
            <MetricRow label="Penarikan Pending" value={stats.pendingWithdrawals ?? 0} icon="credit-card" color="#d97706" />
          </View>
        </View>
      </View>

      {/* Fraud Alerts */}
      <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
        <Text style={{ fontSize: 12, fontFamily: "Inter_700Bold", color: colors.mutedForeground, letterSpacing: 1, marginBottom: 8 }}>
          FRAUD ALERTS ({fraudAlerts.length})
        </Text>
        {fraudAlerts.length === 0 ? (
          <View style={{
            backgroundColor: "#f0fdf4", borderRadius: 12, padding: 16,
            borderWidth: 1, borderColor: "#bbf7d0", flexDirection: "row", alignItems: "center", gap: 10,
          }}>
            <Feather name="shield" size={20} color="#16a34a" />
            <Text style={{ fontFamily: "Inter_500Medium", color: "#15803d", fontSize: 14 }}>
              Tidak ada fraud terdeteksi saat ini
            </Text>
          </View>
        ) : (
          <View style={{
            backgroundColor: "#fef2f2", borderRadius: 12, padding: 14,
            borderWidth: 1, borderColor: "#fecaca",
          }}>
            {fraudAlerts.map((alert: any, i: number) => (
              <View key={i} style={{ flexDirection: "row", gap: 8, marginBottom: i < fraudAlerts.length - 1 ? 10 : 0 }}>
                <Feather name="alert-circle" size={14} color="#dc2626" style={{ marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 13, color: "#991b1b" }}>
                    {alert.name}
                  </Text>
                  <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: "#dc2626" }}>
                    {alert.reason}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Recent Ban Logs */}
      {recentBanLogs.length > 0 && (
        <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 12, fontFamily: "Inter_700Bold", color: colors.mutedForeground, letterSpacing: 1, marginBottom: 8 }}>
            AKTIVITAS MODERASI TERBARU
          </Text>
          <View style={{
            backgroundColor: colors.card, borderRadius: 14,
            borderWidth: 1, borderColor: colors.border,
          }}>
            {recentBanLogs.slice(0, 10).map((log: any, i: number) => (
              <View
                key={i}
                style={{
                  padding: 12,
                  borderBottomWidth: i < recentBanLogs.length - 1 ? 1 : 0,
                  borderBottomColor: colors.border,
                }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
                  <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 13, color: colors.foreground }}>
                    User #{log.targetUserId} → {log.action}
                  </Text>
                  <Text style={{ fontFamily: "Inter_400Regular", fontSize: 11, color: colors.mutedForeground }}>
                    {formatDate(log.createdAt)}
                  </Text>
                </View>
                {log.reason ? (
                  <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: colors.mutedForeground }}>
                    Alasan: {log.reason}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Pending Reports Preview */}
      {pendingReports.length > 0 && (
        <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 12, fontFamily: "Inter_700Bold", color: colors.mutedForeground, letterSpacing: 1, marginBottom: 8 }}>
            LAPORAN MENUNGGU TINJAUAN ({pendingReports.length})
          </Text>
          <View style={{
            backgroundColor: colors.card, borderRadius: 14,
            borderWidth: 1, borderColor: colors.border,
          }}>
            {pendingReports.slice(0, 5).map((r: any, i: number) => (
              <View
                key={i}
                style={{
                  padding: 12,
                  borderBottomWidth: i < Math.min(pendingReports.length, 5) - 1 ? 1 : 0,
                  borderBottomColor: colors.border,
                }}
              >
                <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 13, color: colors.foreground }}>
                  #{r.id} · {r.reason}
                </Text>
                <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: colors.mutedForeground, marginTop: 2 }}>
                  Target: {r.targetType} #{r.targetId} · {formatDate(r.createdAt)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}
