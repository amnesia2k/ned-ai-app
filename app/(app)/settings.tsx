import { Href, router } from "expo-router";
import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Info,
  Lock,
  LogOut,
  Moon,
  Shield,
  Smartphone,
} from "lucide-react-native";
import React, { useState } from "react";
import { Image, Pressable, ScrollView, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuthStore } from "@/modules/auth/useAuthStore";

export default function SettingsScreen() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [darkMode, setDarkMode] = useState(false);
  const [hapticFeedback, setHapticFeedback] = useState(true);

  const handleLogout = () => {
    logout();
    router.replace("/(auth)/login");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-slate-50">
        <Pressable onPress={() => router.back()} className="p-1">
          <ArrowLeft size={24} color="#3B82F6" />
        </Pressable>
        <Text className="text-lg font-bold text-slate-900">Settings</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <View className="items-center py-8">
          <View className="relative">
            <View className="h-24 w-24 rounded-full border-2 border-slate-100 p-1">
              <View className="h-full w-full overflow-hidden rounded-full bg-slate-100 items-center justify-center">
                {user?.image ? (
                  <Image
                    source={{ uri: user.image }}
                    className="h-full w-full"
                  />
                ) : (
                  <Text className="text-3xl font-bold text-slate-400">
                    {(user?.name || "N").slice(0, 1).toUpperCase()}
                  </Text>
                )}
              </View>
            </View>
            <View className="absolute bottom-0 right-0 h-7 w-7 items-center justify-center rounded-full bg-blue-500 border-2 border-white">
              <Pencil size={14} color="white" />
            </View>
          </View>

          <Text className="mt-4 text-xl font-bold text-slate-900">
            {user?.name || "Alex Rivera"}
          </Text>
          <Text className="text-sm text-slate-500">
            {user?.email || "alex.rivera@ai-assistant.io"}
          </Text>

          <Pressable
            onPress={() => router.push("/(app)/edit-profile" as Href)}
            className="mt-5 rounded-full border border-slate-200 px-6 py-2"
          >
            <Text className="text-sm font-bold text-slate-900">
              Edit Profile
            </Text>
          </Pressable>
        </View>

        {/* Account Section */}
        <Section title="Account">
          <SettingRow
            icon={<Lock size={20} color="#3B82F6" />}
            label="Change Password"
            onPress={() => router.push("/(app)/change-password" as Href)}
          />
          <SettingRow
            icon={<Shield size={20} color="#3B82F6" />}
            label="Data & Privacy"
            onPress={() => {}}
          />
        </Section>

        {/* App Settings Section */}
        <Section title="App Settings">
          <SettingRow
            icon={<Moon size={20} color="#3B82F6" />}
            label="Dark Mode"
            rightElement={
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: "#E2E8F0", true: "#3B82F6" }}
                thumbColor="#FFFFFF"
              />
            }
          />
          <SettingRow
            icon={<Smartphone size={20} color="#3B82F6" />}
            label="Haptic Feedback"
            rightElement={
              <Switch
                value={hapticFeedback}
                onValueChange={setHapticFeedback}
                trackColor={{ false: "#E2E8F0", true: "#3B82F6" }}
                thumbColor="#FFFFFF"
              />
            }
          />
        </Section>

        {/* About Section */}
        <Section title="About">
          <SettingRow
            icon={<Info size={20} color="#3B82F6" />}
            label="Version"
            rightElement={
              <Text className="text-sm text-slate-500">2.4.0 (Build 108)</Text>
            }
          />
          <SettingRow
            icon={<ClipboardList size={20} color="#3B82F6" />}
            label="Terms of Service"
            onPress={() => {}}
          />
        </Section>

        {/* Log Out Button */}
        <View className="mt-8 px-5">
          <Pressable
            onPress={handleLogout}
            className="flex-row items-center justify-center rounded-2xl border border-red-100 bg-white py-4 active:bg-red-50"
          >
            <LogOut size={20} color="#EF4444" className="mr-2" />
            <Text className="text-base font-bold text-red-500">Log Out</Text>
          </Pressable>
        </View>
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
    <View className="mt-6 px-5">
      <Text className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
        {title}
      </Text>
      <View className="overflow-hidden rounded-2xl bg-slate-50/50 border border-slate-100">
        {children}
      </View>
    </View>
  );
}

function SettingRow({
  icon,
  label,
  value,
  onPress,
  rightElement,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}) {
  const Container = onPress ? Pressable : View;

  return (
    <Container
      onPress={onPress}
      className={`flex-row items-center justify-between p-4 ${onPress ? "active:bg-slate-100" : ""}`}
    >
      <View className="flex-row items-center">
        <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-blue-50/50">
          {icon}
        </View>
        <Text className="text-base font-medium text-slate-700">{label}</Text>
      </View>
      <View className="flex-row items-center">
        {value && <Text className="mr-2 text-sm text-slate-500">{value}</Text>}
        {rightElement}
        {onPress && !rightElement && <ChevronRight size={20} color="#CBD5E1" />}
      </View>
    </Container>
  );
}

const Pencil = ({ size, color }: { size: number; color: string }) => (
  <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
    <Text style={{ fontSize: size, color }}>✎</Text>
  </View>
);

const ArrowLeft = ({ size, color }: { size: number; color: string }) => (
  <ChevronLeft size={size} color={color} />
);
