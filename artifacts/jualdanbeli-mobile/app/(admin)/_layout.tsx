import { Feather } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

export default function AdminLayout() {
  const colors = useColors();
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#0f172a" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontFamily: "Inter_700Bold", fontSize: 16 },
        headerLeft: () => (
          <Pressable
            onPress={() => router.back()}
            style={{ paddingHorizontal: 4, paddingVertical: 4 }}
          >
            <Feather name="arrow-left" size={22} color="#fff" />
          </Pressable>
        ),
        headerRight: () => (
          <View style={{
            backgroundColor: "rgba(255,255,255,0.15)",
            paddingHorizontal: 10, paddingVertical: 4,
            borderRadius: 99,
          }}>
            <Text style={{ color: "#fff", fontSize: 11, fontFamily: "Inter_600SemiBold" }}>
              🔒 Admin
            </Text>
          </View>
        ),
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" options={{ title: "Panel Admin" }} />
      <Stack.Screen name="users" options={{ title: "Manajemen Pengguna" }} />
      <Stack.Screen name="orders" options={{ title: "Semua Pesanan" }} />
      <Stack.Screen name="reports" options={{ title: "Laporan & Fraud" }} />
      <Stack.Screen name="monitoring" options={{ title: "Monitoring Realtime" }} />
    </Stack>
  );
}
