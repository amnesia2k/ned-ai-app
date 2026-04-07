import { router } from "expo-router";
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Mail,
  Trash2,
  User,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuthStore } from "@/modules/auth/useAuthStore";

export default function EditProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const clearError = useAuthStore((state) => state.clearError);
  const errorMessage = useAuthStore((state) => state.errorMessage);
  const status = useAuthStore((state) => state.status);
  const isSubmitting = status === "loading";
  const [name, setName] = useState(user?.name ?? "");
  const [localError, setLocalError] = useState<string | null>(null);
  const activeError = localError || errorMessage;

  useEffect(() => {
    setName(user?.name ?? "");
  }, [user?.name]);

  async function handleSave() {
    clearError();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setLocalError("Full name is required.");
      return;
    }

    if (trimmedName.length < 2) {
      setLocalError("Name must be at least 2 characters.");
      return;
    }

    if (trimmedName === (user?.name ?? "").trim()) {
      router.back();
      return;
    }

    setLocalError(null);

    try {
      await updateProfile({ name: trimmedName });
      router.back();
    } catch {}
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-slate-50">
        <Pressable onPress={() => router.back()} className="p-1">
          <ChevronLeft size={24} color="#0F172A" />
        </Pressable>
        <Text className="text-lg font-bold text-slate-900">Edit Profile</Text>
        <Pressable disabled={isSubmitting} onPress={() => void handleSave()}>
          <Text className={`text-base font-bold ${isSubmitting ? "text-slate-400" : "text-blue-500"}`}>
            {isSubmitting ? "Saving..." : "Save"}
          </Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar Section */}
          <View className="items-center py-8">
            <View className="relative">
              <View className="h-32 w-32 rounded-full p-0.5">
                <View className="h-full w-full overflow-hidden rounded-full bg-slate-100 items-center justify-center">
                  {user?.image ? (
                    <Image
                      source={{ uri: user.image }}
                      className="h-full w-full"
                    />
                  ) : (
                    <View className="h-full w-full items-center justify-center bg-slate-200">
                      <User size={48} color="#94A3B8" />
                    </View>
                  )}
                </View>
              </View>
              <Pressable className="absolute bottom-1 right-1 h-9 w-9 items-center justify-center rounded-full bg-blue-500 border-4 border-white">
                <Camera size={16} color="white" />
              </Pressable>
            </View>
            <Pressable className="mt-3">
              <Text className="text-sm font-bold text-blue-500">Change Photo</Text>
            </Pressable>
          </View>

          {/* Form Fields */}
          <View className="px-5 space-y-6">
            <View>
              <Text className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                Full Name
              </Text>
              <View className="flex-row items-center rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3.5">
                <User size={20} color="#94A3B8" className="mr-3" />
                <TextInput
                  value={name}
                  onChangeText={(value) => {
                    setName(value);
                    setLocalError(null);
                    clearError();
                  }}
                  placeholder="Your full name"
                  className="flex-1 text-base text-slate-900"
                />
              </View>
            </View>

            <View className="mt-6">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Email Address
                </Text>
                <Pressable>
                  <Text className="text-xs font-bold text-blue-500">Change</Text>
                </Pressable>
              </View>
              <View className="flex-row items-center rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3.5 opacity-60">
                <Mail size={20} color="#94A3B8" className="mr-3" />
                <TextInput
                  value={user?.email || "alexander@nedai.app"}
                  editable={false}
                  className="flex-1 text-base text-slate-500"
                />
              </View>
            </View>

            {activeError ? (
              <Text className="mt-6 text-sm text-red-600">{activeError}</Text>
            ) : null}

            {/* Delete Account Button */}
            <View className="mt-12">
              <Pressable
                onPress={() => {}}
                className="flex-row items-center justify-between rounded-2xl border border-red-50 bg-red-50/30 p-4 active:bg-red-50"
              >
                <View className="flex-row items-center">
                  <Trash2 size={20} color="#EF4444" className="mr-3" />
                  <Text className="text-base font-bold text-red-500">Delete Account</Text>
                </View>
                <ChevronRight size={20} color="#FCA5A5" />
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
