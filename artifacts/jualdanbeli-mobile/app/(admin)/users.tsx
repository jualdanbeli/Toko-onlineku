import { Feather } from "@expo/vector-icons";
import { useAdminGetUsers, useAdminUpdateUserStatus } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  ActivityIndicator, Alert, Pressable, RefreshControl,
  ScrollView, StyleSheet, Text, TextInput, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: "Aktif", color: "#16a34a", bg: "#dcfce7" },
  suspended: { label: "Suspend", color: "#d97706", bg: "#fef3c7" },
  banned: { label: "Banned", color: "#dc2626", bg: "#fee2e2" },
};

const ROLE_LABELS: Record<string, string> = {
  buyer: "Pembeli",
  seller: "Penjual",
  admin: "Admin",
};

export default function AdminUsers() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: usersData, isLoading, refetch, isRefetching } = useAdminGetUsers(
    { q: search || undefined },
    { query: { enabled: !!token } as any }
  );
  const updateStatus = useAdminUpdateUserStatus();

  const users: any[] = (usersData as any)?.users ?? [];

  const handleAction = (userId: number, userName: string, currentStatus: string) => {
    const actions = [];
    if (currentStatus !== "banned") {
      actions.push({
        text: "🚫 Ban Permanen",
        style: "destructive" as const,
        onPress: () => confirmAction(userId, userName, "banned"),
      });
    }
    if (currentStatus !== "suspended") {
      actions.push({
        text: "⏸ Suspend",
        onPress: () => confirmAction(userId, userName, "suspended"),
      });
    }
    if (currentStatus !== "active") {
      actions.push({
        text: "✅ Aktifkan Kembali",
        onPress: () => confirmAction(userId, userName, "active"),
      });
    }
    actions.push({ text: "Batal", style: "cancel" as const });

    Alert.alert(`Kelola: ${userName}`, "Pilih tindakan:", actions);
  };

  const confirmAction = (userId: number, userName: string, newStatus: string) => {
    const labels: Record<string, string> = {
      banned: "ban permanen",
      suspended: "suspend",
      active: "aktifkan kembali",
    };
    Alert.alert(
      "Konfirmasi",
      `${labels[newStatus]} akun ${userName}?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Ya, Lanjutkan",
          style: newStatus === "banned" ? "destructive" : "default",
          onPress: () => {
            updateStatus.mutate(
              { userId, data: { status: newStatus as any, reason: `Admin action via mobile` } },
              {
                onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: ["admin"] });
                  refetch();
                  Alert.alert("Berhasil", `Akun ${userName} berhasil di-${labels[newStatus]}`);
                },
                onError: () => Alert.alert("Gagal", "Terjadi kesalahan, coba lagi."),
              }
            );
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Search */}
      <View style={{
        backgroundColor: colors.card, paddingHorizontal: 16, paddingVertical: 10,
        borderBottomWidth: 1, borderBottomColor: colors.border,
        flexDirection: "row", alignItems: "center", gap: 10,
      }}>
        <Feather name="search" size={18} color={colors.mutedForeground} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Cari nama atau email..."
          placeholderTextColor={colors.mutedForeground}
          style={{ flex: 1, fontFamily: "Inter_400Regular", fontSize: 14, color: colors.foreground }}
          autoCorrect={false}
          autoCapitalize="none"
        />
        {search ? (
          <Pressable onPress={() => setSearch("")}>
            <Feather name="x" size={18} color={colors.mutedForeground} />
          </Pressable>
        ) : null}
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        >
          <Text style={{
            paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8,
            fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground,
          }}>
            {users.length} pengguna ditemukan
          </Text>

          {users.map((u: any) => {
            const statusInfo = STATUS_LABELS[u.status] ?? STATUS_LABELS.active;
            return (
              <Pressable
                key={u.id}
                style={({ pressed }) => ({
                  flexDirection: "row", alignItems: "center", gap: 12,
                  paddingVertical: 12, paddingHorizontal: 16,
                  backgroundColor: pressed ? colors.muted : colors.card,
                  borderBottomWidth: 1, borderBottomColor: colors.border,
                })}
                onPress={() => handleAction(u.id, u.name, u.status)}
              >
                <View style={{
                  width: 44, height: 44, borderRadius: 22,
                  backgroundColor: u.role === "admin" ? "#0f172a" : colors.primary + "20",
                  alignItems: "center", justifyContent: "center",
                }}>
                  <Text style={{ fontSize: 18, fontFamily: "Inter_700Bold", color: u.role === "admin" ? "#fff" : colors.primary }}>
                    {u.name?.charAt(0)?.toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 14, color: colors.foreground }}>
                    {u.name}
                  </Text>
                  <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: colors.mutedForeground, marginTop: 1 }}>
                    {u.email}
                  </Text>
                  <Text style={{ fontFamily: "Inter_400Regular", fontSize: 11, color: colors.mutedForeground }}>
                    {ROLE_LABELS[u.role] ?? u.role}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end", gap: 6 }}>
                  <View style={{
                    paddingHorizontal: 8, paddingVertical: 3,
                    backgroundColor: statusInfo.bg, borderRadius: 99,
                  }}>
                    <Text style={{ fontSize: 11, fontFamily: "Inter_600SemiBold", color: statusInfo.color }}>
                      {statusInfo.label}
                    </Text>
                  </View>
                  {u.role !== "admin" && (
                    <Feather name="more-horizontal" size={16} color={colors.mutedForeground} />
                  )}
                </View>
              </Pressable>
            );
          })}
          {users.length === 0 && (
            <View style={{ alignItems: "center", paddingTop: 60 }}>
              <Feather name="users" size={40} color={colors.mutedForeground} />
              <Text style={{ marginTop: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>
                Tidak ada pengguna ditemukan
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}
