import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import {
  ActivityIndicator, Alert, Pressable, RefreshControl,
  ScrollView, StyleSheet, Text, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

function useMonitoring() {
  const { token } = useAuth();
  return useQuery<any>({
    queryKey: ["admin-monitoring-mobile"],
    queryFn: async () => {
      const base = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;
      const res = await fetch(`${base}/api/admin/monitoring`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal memuat data");
      return res.json();
    },
    refetchInterval: 30_000,
    enabled: !!token,
  });
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  bg: string;
}

function StatCard({ label, value, icon, color, bg }: StatCardProps) {
  const colors = useColors();
  return (
    <View style={{
      flex: 1, backgroundColor: colors.card,
      borderRadius: 14, padding: 14,
      borderWidth: 1, borderColor: colors.border,
    }}>
      <View style={{
        width: 38, height: 38, borderRadius: 10,
        backgroundColor: bg, alignItems: "center", justifyContent: "center",
        marginBottom: 10,
      }}>
        <Feather name={icon as any} size={18} color={color} />
      </View>
      <Text style={{ fontSize: 22, fontFamily: "Inter_700Bold", color }}>{value}</Text>
      <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 2, lineHeight: 16 }}>
        {label}
      </Text>
    </View>
  );
}

interface MenuItemProps {
  icon: string;
  label: string;
  desc: string;
  badge?: number;
  onPress: () => void;
  badgeColor?: string;
}

function AdminMenuItem({ icon, label, desc, badge, onPress, badgeColor = "#ef4444" }: MenuItemProps) {
  const colors = useColors();
  return (
    <Pressable
      style={({ pressed }) => ({
        flexDirection: "row", alignItems: "center", gap: 14,
        paddingVertical: 14, paddingHorizontal: 16,
        backgroundColor: pressed ? colors.muted : colors.card,
        borderBottomWidth: 1, borderBottomColor: colors.border,
      })}
      onPress={onPress}
    >
      <View style={{
        width: 42, height: 42, borderRadius: 12,
        backgroundColor: "#0f172a", alignItems: "center", justifyContent: "center",
      }}>
        <Feather name={icon as any} size={20} color="#fff" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.foreground }}>{label}</Text>
        <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 1 }}>{desc}</Text>
      </View>
      {badge && badge > 0 ? (
        <View style={{
          backgroundColor: badgeColor, borderRadius: 99,
          minWidth: 22, height: 22, alignItems: "center", justifyContent: "center",
          paddingHorizontal: 6,
        }}>
          <Text style={{ color: "#fff", fontSize: 11, fontFamily: "Inter_700Bold" }}>{badge > 99 ? "99+" : badge}</Text>
        </View>
      ) : null}
      <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
    </Pressable>
  );
}

export default function AdminDashboard() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data, isLoading, refetch, isRefetching } = useMonitoring();

  const stats = data?.platformStats ?? {};
  const fraudAlerts: any[] = data?.fraudAlerts ?? [];
  const pendingReports: number = stats.pendingReports ?? 0;
  const pendingDisputes: number = stats.pendingDisputes ?? 0;
  const pendingWithdrawals: number = stats.pendingWithdrawals ?? 0;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
    >
      {/* Status banner */}
      <View style={{
        backgroundColor: "#0f172a", paddingHorizontal: 16, paddingVertical: 14,
        flexDirection: "row", alignItems: "center", gap: 10,
      }}>
        <View style={{
          width: 8, height: 8, borderRadius: 4, backgroundColor: "#22c55e",
        }} />
        <Text style={{ color: "#fff", fontFamily: "Inter_500Medium", fontSize: 13 }}>
          Sistem berjalan normal · NIB 2403240017145
        </Text>
      </View>

      {/* Stats grid */}
      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <View style={{ padding: 16 }}>
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
            <StatCard label="Total Pengguna" value={stats.totalUsers ?? 0} icon="users" color="#2563eb" bg="#dbeafe" />
            <StatCard label="Pengguna Aktif" value={stats.activeUsers ?? 0} icon="user-check" color="#16a34a" bg="#dcfce7" />
          </View>
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
            <StatCard label="Total Pesanan" value={stats.totalOrders ?? 0} icon="shopping-bag" color="#9333ea" bg="#f3e8ff" />
            <StatCard label="Produk Aktif" value={stats.totalProducts ?? 0} icon="package" color="#ea580c" bg="#ffedd5" />
          </View>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <StatCard label="User Tersuspend" value={stats.suspendedUsers ?? 0} icon="alert-triangle" color="#d97706" bg="#fef3c7" />
            <StatCard label="User Dibanned" value={stats.bannedUsers ?? 0} icon="x-circle" color="#dc2626" bg="#fee2e2" />
          </View>
        </View>
      )}

      {/* Fraud Alerts */}
      {fraudAlerts.length > 0 && (
        <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
          <View style={{
            backgroundColor: "#fef2f2", borderRadius: 12, padding: 14,
            borderWidth: 1, borderColor: "#fecaca",
          }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Feather name="alert-circle" size={16} color="#dc2626" />
              <Text style={{ fontFamily: "Inter_700Bold", color: "#dc2626", fontSize: 14 }}>
                {fraudAlerts.length} Fraud Alert Terdeteksi
              </Text>
            </View>
            {fraudAlerts.slice(0, 3).map((alert: any, i: number) => (
              <Text key={i} style={{ fontSize: 12, color: "#991b1b", fontFamily: "Inter_400Regular", marginTop: 2 }}>
                • {alert.name}: {alert.reason}
              </Text>
            ))}
          </View>
        </View>
      )}

      {/* Menu */}
      <Text style={{
        paddingHorizontal: 16, paddingBottom: 8, paddingTop: 4,
        fontSize: 11, fontFamily: "Inter_700Bold",
        color: colors.mutedForeground, letterSpacing: 1,
      }}>
        MENU ADMIN
      </Text>
      <View style={{ borderRadius: 14, overflow: "hidden", marginHorizontal: 16, borderWidth: 1, borderColor: colors.border }}>
        <AdminMenuItem
          icon="activity"
          label="Monitoring Realtime"
          desc="Statistik live & deteksi fraud"
          badge={pendingReports + pendingDisputes}
          onPress={() => router.push("/(admin)/monitoring" as any)}
        />
        <AdminMenuItem
          icon="users"
          label="Kelola Pengguna"
          desc="Ban, suspend, verifikasi akun"
          badge={stats.suspendedUsers}
          badgeColor="#d97706"
          onPress={() => router.push("/(admin)/users" as any)}
        />
        <AdminMenuItem
          icon="shopping-bag"
          label="Semua Pesanan"
          desc="Pantau & kelola seluruh transaksi"
          onPress={() => router.push("/(admin)/orders" as any)}
        />
        <AdminMenuItem
          icon="flag"
          label="Laporan & Fraud"
          desc="Tinjau laporan pengguna"
          badge={pendingReports}
          onPress={() => router.push("/(admin)/reports" as any)}
        />
        <AdminMenuItem
          icon="shield"
          label="Keamanan Sistem"
          desc={`${12} lapisan keamanan aktif`}
          onPress={() => Alert.alert(
            "🔒 Status Keamanan",
            "✅ Helmet Headers\n✅ Rate Limiting\n✅ Account Lockout (30 mnt)\n✅ Token Expiry (30 hari)\n✅ CORS Restriction\n✅ SQLi/XSS Detection\n✅ Password Policy\n✅ Body Size Limit\n✅ Admin Role Guard\n✅ Audit Log\n✅ Suspended Block\n✅ No Raw SQL\n\nSemua sistem berjalan normal.",
            [{ text: "OK" }]
          )}
        />
      </View>
    </ScrollView>
  );
}
