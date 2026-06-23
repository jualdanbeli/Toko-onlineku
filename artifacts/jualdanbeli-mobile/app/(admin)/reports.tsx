import { Feather } from "@expo/vector-icons";
import { useGetReports, GetReportsStatus } from "@workspace/api-client-react";
import React, { useState } from "react";
import {
  ActivityIndicator, Alert, Pressable, RefreshControl,
  ScrollView, Text, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Pending", color: "#d97706", bg: "#fef3c7" },
  investigating: { label: "Ditinjau", color: "#2563eb", bg: "#dbeafe" },
  resolved: { label: "Selesai", color: "#16a34a", bg: "#dcfce7" },
  dismissed: { label: "Ditolak", color: "#6b7280", bg: "#f3f4f6" },
};

const TARGET_LABELS: Record<string, string> = {
  user: "Pengguna",
  product: "Produk",
  order: "Pesanan",
  seller: "Penjual",
};

const FILTER_TABS = [
  { key: "pending", label: "Pending" },
  { key: "investigating", label: "Ditinjau" },
  { key: "resolved", label: "Selesai" },
  { key: "all", label: "Semua" },
];

export default function AdminReports() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const [activeFilter, setActiveFilter] = useState("pending");

  const { data: reportsRaw, isLoading, refetch, isRefetching } = useGetReports(
    activeFilter !== "all" ? { status: activeFilter as typeof GetReportsStatus[keyof typeof GetReportsStatus] } : {},
    { query: { enabled: !!token } as any }
  );
  const reports: any[] = Array.isArray(reportsRaw) ? reportsRaw : (reportsRaw as any)?.reports ?? [];

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  };

  const handleReport = (report: any) => {
    Alert.alert(
      `Laporan #${report.id}`,
      `Target: ${TARGET_LABELS[report.targetType] ?? report.targetType} #${report.targetId}\n\nAlasan: ${report.reason}\n\n${report.description ?? ""}`,
      [{ text: "Tutup" }]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Filter Tabs */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        style={{ backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border }}
        contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 10, gap: 8, flexDirection: "row" }}
      >
        {FILTER_TABS.map(tab => (
          <Pressable
            key={tab.key}
            onPress={() => setActiveFilter(tab.key)}
            style={{
              paddingHorizontal: 14, paddingVertical: 6, borderRadius: 99,
              backgroundColor: activeFilter === tab.key ? "#0f172a" : colors.muted,
            }}
          >
            <Text style={{
              fontFamily: "Inter_600SemiBold", fontSize: 13,
              color: activeFilter === tab.key ? "#fff" : colors.foreground,
            }}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        >
          <Text style={{
            paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6,
            fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground,
          }}>
            {reports.length} laporan
          </Text>

          {reports.map((report: any) => {
            const sc = STATUS_CONFIG[report.status] ?? STATUS_CONFIG.pending;
            return (
              <Pressable
                key={report.id}
                style={({ pressed }) => ({
                  backgroundColor: pressed ? colors.muted : colors.card,
                  marginHorizontal: 16, marginBottom: 10,
                  borderRadius: 12, borderWidth: 1, borderColor: colors.border,
                  padding: 14,
                })}
                onPress={() => handleReport(report)}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: "Inter_700Bold", fontSize: 14, color: colors.foreground }}>
                      Laporan #{report.id}
                    </Text>
                    <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: colors.mutedForeground, marginTop: 2 }}>
                      Target: {TARGET_LABELS[report.targetType] ?? report.targetType} #{report.targetId}
                    </Text>
                  </View>
                  <View style={{
                    paddingHorizontal: 8, paddingVertical: 3,
                    backgroundColor: sc.bg, borderRadius: 99,
                  }}>
                    <Text style={{ fontSize: 11, fontFamily: "Inter_600SemiBold", color: sc.color }}>
                      {sc.label}
                    </Text>
                  </View>
                </View>

                <View style={{
                  backgroundColor: colors.muted, borderRadius: 8,
                  padding: 10, marginBottom: 8,
                }}>
                  <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 13, color: colors.foreground }}>
                    {report.reason}
                  </Text>
                  {report.description ? (
                    <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: colors.mutedForeground, marginTop: 4, lineHeight: 18 }}
                      numberOfLines={2}
                    >
                      {report.description}
                    </Text>
                  ) : null}
                </View>

                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>
                    Oleh User #{report.reporterId}
                  </Text>
                  <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>
                    {formatDate(report.createdAt)}
                  </Text>
                </View>
              </Pressable>
            );
          })}

          {reports.length === 0 && (
            <View style={{ alignItems: "center", paddingTop: 60 }}>
              <Feather name="flag" size={40} color={colors.mutedForeground} />
              <Text style={{ marginTop: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>
                Tidak ada laporan {activeFilter !== "all" ? activeFilter : ""}
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}
