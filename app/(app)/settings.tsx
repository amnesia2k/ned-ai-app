import Constants from "expo-constants";
import { router } from "expo-router";
import { ChevronLeft, LogOut } from "lucide-react-native";
import React from "react";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuthStore } from "@/modules/auth/useAuthStore";
import { useSyncStore } from "@/modules/sync/useSyncStore";

export default function SettingsScreen() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const sync = useSyncStore((state) => ({
    status: state.status,
    lastSyncedAt: state.lastSyncedAt,
    errorMessage: state.errorMessage,
    chatCount: state.chatCount,
  }));
  const scheme = Constants.expoConfig?.scheme;
  const schemeValue = Array.isArray(scheme)
    ? scheme[0] || "nedaiapp"
    : scheme || "nedaiapp";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingVertical: 16,
        }}
      >
        <Pressable onPress={() => router.back()}>
          <ChevronLeft size={24} color="#0F172A" />
        </Pressable>
        <Text style={{ color: "#0F172A", fontSize: 18, fontWeight: "700" }}>
          Settings
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32, gap: 24 }}
      >
        <View style={{ alignItems: "center", gap: 10, paddingVertical: 12 }}>
          <View
            style={{
              width: 88,
              height: 88,
              borderRadius: 44,
              backgroundColor: "#DBEAFE",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#1D4ED8", fontSize: 28, fontWeight: "700" }}>
              {(user?.name || user?.email || "N").slice(0, 1).toUpperCase()}
            </Text>
          </View>
          <Text style={{ color: "#0F172A", fontSize: 22, fontWeight: "700" }}>
            {user?.name || "NedAI user"}
          </Text>
          <Text style={{ color: "#64748B", fontSize: 15 }}>
            {user?.email || "No email available"}
          </Text>
        </View>

        <Section title="Account">
          <SettingRow label="Email" value={user?.email || "Not available"} />
          <SettingRow label="Role" value={user?.role || "Not available"} />
          <SettingRow
            label="Institution"
            value={user?.institution || "Not available"}
          />
          <SettingRow label="Session mode" value="Server-backed session" />
        </Section>

        <Section title="Sync">
          <SettingRow label="Status" value={sync.status} />
          <SettingRow label="Chats loaded" value={String(sync.chatCount)} />
          <SettingRow
            label="Last synced"
            value={sync.lastSyncedAt || "Not synced yet"}
          />
          <SettingRow
            label="Last sync error"
            value={sync.errorMessage || "No sync errors"}
          />
        </Section>

        <Section title="App">
          <SettingRow
            label="Version"
            value={Constants.expoConfig?.version || "1.0.0"}
          />
          <SettingRow label="Platform" value={Platform.OS} />
          <SettingRow
            label="Scheme"
            value={schemeValue}
          />
        </Section>

        <Pressable
          onPress={() => {
            logout();
            router.replace("/(auth)/login");
          }}
          style={{
            borderColor: "#FCA5A5",
            borderWidth: 1,
            borderRadius: 18,
            paddingVertical: 16,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            gap: 10,
          }}
        >
          <LogOut size={18} color="#B91C1C" />
          <Text style={{ color: "#B91C1C", fontSize: 15, fontWeight: "700" }}>
            Log Out
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={{ gap: 10 }}>
      <Text
        style={{
          color: "#64748B",
          fontSize: 12,
          fontWeight: "700",
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        {title}
      </Text>
      <View
        style={{
          backgroundColor: "#F8FAFC",
          borderRadius: 20,
          borderWidth: 1,
          borderColor: "#E2E8F0",
          overflow: "hidden",
        }}
      >
        {children}
      </View>
    </View>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomColor: "#E2E8F0",
        borderBottomWidth: 1,
      }}
    >
      <Text style={{ color: "#0F172A", fontSize: 14, fontWeight: "600" }}>
        {label}
      </Text>
      <Text style={{ color: "#64748B", fontSize: 13, marginTop: 4, lineHeight: 19 }}>
        {value}
      </Text>
    </View>
  );
}
