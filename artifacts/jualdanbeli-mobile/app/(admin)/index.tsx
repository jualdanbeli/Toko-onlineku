import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import {
  ActivityIndicator, Alert, Pressable, RefreshControl,
  ScrollView, Text, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

function useMonitoring() {
  const { token } = useAuth();
  return useQuery<any>({
    queryKey: ["admin-monitoring-mobile"],
    queryFn: async () => {
      const base = `https://${process.env.EXPO_PUBLIC_DOMAIN ?? "jual-beli-aman.replit.app"}`;
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
  gradient: [string, string];
}

function StatCard({ label, value, icon, gradient }: StatCardProps) {
  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 16, padding: 16, minHeight: 100 }}
      >
        <Feather name={icon as any} size={22} color="rgba(255,255,255,0.9)" />
        <Text style={{
          fontSize: 26, fontFamily: "Inter_700Bold", color: "#fff",
          marginTop: 12, letterSpacing: -0.5,
        }}>
          {value}
        </Text>
        <Text style={{
          fontSize: 11, color: "rgba(255,255,255,0.75)",
          fontFamily: "Inter_500Medium", marginTop: 2, lineHeight: 15,
        }}>
          {label}
        </Text>
      </LinearGradient>
    </View>
  );
}

interface MenuItemProps {
  icon: string;
  label: string;
  desc: string;
  badge?: number;
  onPress: () => void;
  iconBg: string;
  iconColor: string;
  badgeColor?: string;
}

function AdminMenuItem({ icon, label, desc, badge, onPress, iconBg, iconColor, badgeColor = "#ef4444" }: MenuItemProps) {
  const colors = useColors();
  return (
    <Pressable
      style={({ pressed }) => ({
        flexDirection: "row", alignItems: "center", gap: 14,
        paddingVertical: 15, paddingHorizontal: 18,
        backgroundColor: pressed ? colors.muted : colors.card,
        borderBottomWidth: 1, borderBottomColor: colors.border,
      })}
      onPress={onPress}
    >
      <View style={{
        width: 46, height: 46, borderRadius: 14,
        backgroundColor: iconBg, alignItems: "center", justifyContent: "center",
      }}>
        <Feather name={icon as any} size={20} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.foreground }}>{label}</Text>
        <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 2 }}>{desc}</Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {badge && badge > 0 ? (
          <View style={{
            backgroundColor: badgeColor, borderRadius: 99,
            minWidth: 22, height: 22, alignItems: "center", justifyContent: "center",
            paddingHorizontal: 6,
          }}>
            <Text style={{ color: "#fff", fontSize: 11, fontFamily: "Inter_700Bold" }}>
              {badge > 99 ? "99+" : badge}
            </Text>
          </View>
        ) : null}
        <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
      </View>
    </Pressable>
  );
}

export default function AdminDashboard() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data, isLoading, refetch, isRefetching } = useMonitoring();
  const { user } = useAuth();

  const stats = data?.platformStats ?? {};
  const fraudAlerts: any[] = data?.fraudAlerts ?? [];
  const pendingReports: number = stats.pendingReports ?? 0;
  const pendingDisputes: number = stats.pendingDisputes ?? 0;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#fff" />}
    >
      {/* Header Hero */}
      <LinearGradient
        colors={["#0f172a", "#1e3a5f"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: 20, paddingBottom: 28, paddingHorizontal: 20 }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <View>
            <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, fontFamily: "Inter_400Regular" }}>
              Panel Administrator
            </Text>
            <Text style={{ color: "#fff", fontSize: 20, fontFamily: "Inter_700Bold", marginTop: 2 }}>
              Selamat datang, {user?.name?.split(" ")[0] ?? "Admin"} 👋
            </Text>
          </View>
          <View style={{
            backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 12,
            paddingHorizontal: 12, paddingVertical: 8,
            flexDirection: "row", alignItems: "center", gap: 6,
          }}>
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: "#22c55e" }} />
            <Text style={{ color: "#fff", fontSize: 11, fontFamily: "Inter_600SemiBold" }}>Live</Text>
          </View>
        </View>

        {/* Alert strip */}
        {fraudAlerts.length > 0 && (
          <Pressable
            style={{
              backgroundColor: "rgba(239,68,68,0.2)", borderRadius: 12,
              borderWidth: 1, borderColor: "rgba(239,68,68,0.4)",
              paddingHorizontal: 14, paddingVertical: 10,
              flexDirection: "row", alignItems: "center", gap: 10,
            }}
            onPress={() => router.push("/(admin)/monitoring" as any)}
          >
            <Feather name="alert-circle" size={16} color="#fca5a5" />
            <Text style={{ color: "#fca5a5", fontFamily: "Inter_600SemiBold", fontSize: 13, flex: 1 }}>
              {fraudAlerts.length} fraud alert terdeteksi · Tap untuk lihat
            </Text>
            <Feather name="chevron-right" size={14} color="#fca5a5" />
          </Pressable>
        )}
      </LinearGradient>

      {/* Stats Grid */}
      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <View style={{ padding: 16, gap: 10 }}>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <StatCard
              label="Total Pengguna"
              value={stats.totalUsers ?? 0}
              icon="users"
              gradient={["#2563eb", "#1d4ed8"]}
            />
            <StatCard
              label="Pengguna Aktif"
              value={stats.activeUsers ?? 0}
              icon="user-check"
              gradient={["#059669", "#047857"]}
            />
          </View>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <StatCard
              label="Total Pesanan"
              value={stats.totalOrders ?? 0}
              icon="shopping-bag"
              gradient={["#7c3aed", "#6d28d9"]}
            />
            <StatCard
              label="Produk Aktif"
              value={stats.totalProducts ?? 0}
              icon="package"
              gradient={["#ea580c", "#c2410c"]}
            />
          </View>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <StatCard
              label="Tersuspend"
              value={stats.suspendedUsers ?? 0}
              icon="pause-circle"
              gradient={["#d97706", "#b45309"]}
            />
            <StatCard
              label="Dibanned"
              value={stats.bannedUsers ?? 0}
              icon="x-circle"
              gradient={["#dc2626", "#b91c1c"]}
            />
          </View>
        </View>
      )}

      {/* Menu Admin */}
      <View style={{ paddingHorizontal: 16, marginBottom: 10, marginTop: 4 }}>
        <Text style={{
          fontSize: 11, fontFamily: "Inter_700Bold",
          color: colors.mutedForeground, letterSpacing: 1.2,
        }}>
          MENU ADMIN
        </Text>
      </View>

      <View style={{
        borderRadius: 16, overflow: "hidden",
        marginHorizontal: 16, borderWidth: 1,
        borderColor: colors.border,
      }}>
        <AdminMenuItem
          icon="activity"
          label="Monitoring Realtime"
          desc="Statistik live & deteksi fraud"
          badge={pendingReports + pendingDisputes}
          iconBg="#dbeafe"
          iconColor="#2563eb"
          onPress={() => router.push("/(admin)/monitoring" as any)}
        />
        <AdminMenuItem
          icon="users"
          label="Kelola Pengguna"
          desc="Ban, suspend, verifikasi akun"
          badge={stats.suspendedUsers}
          badgeColor="#d97706"
          iconBg="#fef3c7"
          iconColor="#d97706"
          onPress={() => router.push("/(admin)/users" as any)}
        />
        <AdminMenuItem
          icon="shopping-bag"
          label="Semua Pesanan"
          desc="Pantau & kelola seluruh transaksi"
          iconBg="#ede9fe"
          iconColor="#7c3aed"
          onPress={() => router.push("/(admin)/orders" as any)}
        />
        <AdminMenuItem
          icon="flag"
          label="Laporan & Fraud"
          desc="Tinjau laporan pengguna"
          badge={pendingReports}
          iconBg="#fee2e2"
          iconColor="#dc2626"
          onPress={() => router.push("/(admin)/reports" as any)}
        />
        <AdminMenuItem
          icon="shield"
          label="Keamanan Sistem"
          desc="12 lapisan keamanan aktif"
          iconBg="#dcfce7"
          iconColor="#16a34a"
          onPress={() => Alert.alert(
            "🔒 Status Keamanan",
            "✅ Helmet Headers\n✅ Rate Limiting\n✅ Account Lockout (30 mnt)\n✅ Token Expiry (30 hari)\n✅ CORS Restriction\n✅ SQLi/XSS Detection\n✅ Password Policy\n✅ Body Size Limit\n✅ Admin Role Guard\n✅ Audit Log\n✅ Suspended Block\n✅ No Raw SQL\n\nSemua sistem berjalan normal.",
            [{ text: "OK" }]
          )}
        />
      </View>

      {/* System footer */}
      <View style={{
        marginHorizontal: 16, marginTop: 20,
        backgroundColor: colors.card, borderRadius: 14,
        padding: 14, borderWidth: 1, borderColor: colors.border,
        flexDirection: "row", alignItems: "center", gap: 10,
      }}>
        <View style={{
          width: 36, height: 36, borderRadius: 10,
          backgroundColor: "#dcfce7", alignItems: "center", justifyContent: "center",
        }}>
          <Feather name="server" size={16} color="#16a34a" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 13, color: colors.foreground }}>
            Sistem berjalan normal
          </Text>
          <Text style={{ fontFamily: "Inter_400Regular", fontSize: 11, color: colors.mutedForeground }}>
            NIB 2403240017145 · Auto-refresh 30 dtk
          </Text>
        </View>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#22c55e" }} />
      </View>
    </ScrollView>
  );
}
