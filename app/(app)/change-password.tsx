import { router } from "expo-router";
import { ChevronLeft, Eye, EyeOff } from "lucide-react-native";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { KeyboardScreenView } from "@/components/KeyboardScreenView";
import { useAuthStore } from "@/modules/auth/useAuthStore";

export default function ChangePasswordScreen() {
  const insets = useSafeAreaInsets();
  const changePassword = useAuthStore((state) => state.changePassword);
  const clearError = useAuthStore((state) => state.clearError);
  const errorMessage = useAuthStore((state) => state.errorMessage);
  const status = useAuthStore((state) => state.status);
  const isSubmitting = status === "loading";
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const activeError = localError || errorMessage;

  async function handleSubmit() {
    clearError();

    if (!currentPassword || !newPassword || !confirmPassword) {
      setLocalError("All password fields are required.");
      return;
    }

    if (newPassword.length < 8) {
      setLocalError("Password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setLocalError("New passwords do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setLocalError("New password must be different from current password.");
      return;
    }

    setLocalError(null);

    try {
      await changePassword({
        oldPassword: currentPassword,
        newPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      router.back();
    } catch {}
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <View className="flex-row items-center border-b border-slate-50 px-5 py-4">
        <Pressable onPress={() => router.back()} className="p-1">
          <ChevronLeft size={24} color="#0F172A" />
        </Pressable>
        <Text className="ml-4 text-lg font-bold text-slate-900">
          Change Password
        </Text>
      </View>

      <KeyboardScreenView>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingTop: 24, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View className="px-5">
            <View>
              <Text className="mb-2 text-sm font-bold text-slate-800">
                Current Password
              </Text>
              <View className="flex-row items-center rounded-2xl border border-slate-200 bg-white px-4 py-3.5 focus-within:border-blue-500">
                <TextInput
                  value={currentPassword}
                  onChangeText={(value) => {
                    setCurrentPassword(value);
                    setLocalError(null);
                    clearError();
                  }}
                  placeholder="Enter current password"
                  secureTextEntry={!showCurrent}
                  className="flex-1 text-base text-slate-900"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Pressable onPress={() => setShowCurrent(!showCurrent)}>
                  {showCurrent ? (
                    <EyeOff size={20} color="#94A3B8" />
                  ) : (
                    <Eye size={20} color="#94A3B8" />
                  )}
                </Pressable>
              </View>
            </View>

            <View className="mt-6">
              <Text className="mb-2 text-sm font-bold text-slate-800">
                New Password
              </Text>
              <View className="flex-row items-center rounded-2xl border border-slate-200 bg-white px-4 py-3.5 focus-within:border-blue-500">
                <TextInput
                  value={newPassword}
                  onChangeText={(value) => {
                    setNewPassword(value);
                    setLocalError(null);
                    clearError();
                  }}
                  placeholder="Enter new password"
                  secureTextEntry={!showNew}
                  className="flex-1 text-base text-slate-900"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Pressable onPress={() => setShowNew(!showNew)}>
                  {showNew ? (
                    <EyeOff size={20} color="#94A3B8" />
                  ) : (
                    <Eye size={20} color="#94A3B8" />
                  )}
                </Pressable>
              </View>
              <Text className="mt-2 text-xs leading-5 text-slate-500">
                Password must be at least 8 characters long and include a mix of
                letters, numbers, and symbols.
              </Text>
            </View>

            <View className="mt-6">
              <Text className="mb-2 text-sm font-bold text-slate-800">
                Confirm New Password
              </Text>
              <View className="flex-row items-center rounded-2xl border border-slate-200 bg-white px-4 py-3.5 focus-within:border-blue-500">
                <TextInput
                  value={confirmPassword}
                  onChangeText={(value) => {
                    setConfirmPassword(value);
                    setLocalError(null);
                    clearError();
                  }}
                  placeholder="Re-enter new password"
                  secureTextEntry={!showConfirm}
                  className="flex-1 text-base text-slate-900"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Pressable onPress={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? (
                    <EyeOff size={20} color="#94A3B8" />
                  ) : (
                    <Eye size={20} color="#94A3B8" />
                  )}
                </Pressable>
              </View>
            </View>

            {activeError ? (
              <Text className="mt-6 text-sm text-red-600">{activeError}</Text>
            ) : null}
          </View>
        </ScrollView>

        <View
          className="border-t border-slate-100 bg-white px-5 pt-4"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          <Pressable
            onPress={() => void handleSubmit()}
            disabled={isSubmitting}
            className={`items-center justify-center rounded-2xl py-4 shadow-sm ${isSubmitting ? "bg-slate-400" : "bg-blue-600 active:bg-blue-700"}`}
          >
            <Text className="text-base font-bold text-white">
              {isSubmitting ? "Updating..." : "Update Password"}
            </Text>
          </Pressable>
        </View>
      </KeyboardScreenView>
    </SafeAreaView>
  );
}
