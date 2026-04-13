import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Keyboard,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { KeyboardScreenView } from "@/components/KeyboardScreenView";
import { useAuthStore } from "@/modules/auth/useAuthStore";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function SignupScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"STUDENT" | "LECTURER">("STUDENT");
  const [localError, setLocalError] = useState<string | null>(null);
  const signUp = useAuthStore((state) => state.signUp);
  const clearError = useAuthStore((state) => state.clearError);
  const errorMessage = useAuthStore((state) => state.errorMessage);
  const status = useAuthStore((state) => state.status);
  const isSubmitting = status === "loading";
  const activeError = localError || errorMessage;

  async function handleSignup() {
    clearError();

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setLocalError("Full name, role, email, and password are required.");
      return;
    }

    if (fullName.trim().length < 2) {
      setLocalError("Full name must be at least 2 characters.");
      return;
    }

    if (!isValidEmail(email)) {
      setLocalError("Enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setLocalError("Password must be at least 8 characters.");
      return;
    }

    setLocalError(null);

    try {
      await signUp({ fullName, role, email, password });
    } catch {}
  }

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <StatusBar style="dark" />

      <KeyboardScreenView>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            <View className="flex-1 items-center px-6 pb-10 pt-10">
              <View className="mb-4 h-20 w-20 items-center justify-center">
                <Image
                  source={require("../../assets/images/nedai-logo.png")}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="contain"
                />
              </View>

              <Text className="mb-10 text-3xl font-bold text-slate-900">
                NedAI
              </Text>

              <Text
                className="mb-2 text-2xl font-bold text-slate-900"
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                Create account
              </Text>
              <Text className="mb-10 px-4 text-center text-slate-500">
                Set up your account and continue building from the app shell.
              </Text>

              <View className="w-full">
                <View className="mb-5">
                  <Text className="mb-2 ml-1 text-sm font-semibold text-slate-700">
                    Full Name
                  </Text>
                  <View className="h-14 flex-row items-center rounded-xl border border-slate-200 bg-slate-50 px-4">
                    <Ionicons name="person-outline" size={20} color="#64748B" />
                    <TextInput
                      placeholder="John Doe"
                      placeholderTextColor="#94A3B8"
                      className="ml-3 flex-1 text-base text-slate-900"
                      value={fullName}
                      onChangeText={(value) => {
                        setFullName(value);
                        setLocalError(null);
                        clearError();
                      }}
                    />
                  </View>
                </View>

                <View className="mb-5">
                  <Text className="mb-2 ml-1 text-sm font-semibold text-slate-700">
                    Role
                  </Text>
                  <View className="flex-row">
                    {(
                      [
                        { label: "Student", value: "STUDENT" },
                        { label: "Lecturer", value: "LECTURER" },
                      ] as const
                    ).map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        activeOpacity={0.8}
                        onPress={() => {
                          setRole(option.value);
                          setLocalError(null);
                          clearError();
                        }}
                        className={`mr-3 flex-1 rounded-xl px-4 py-3 ${role === option.value ? "bg-blue-600" : "bg-slate-100"}`}
                      >
                        <Text
                          className={`text-center text-sm font-semibold ${role === option.value ? "text-white" : "text-slate-700"}`}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View className="mb-5">
                  <Text className="mb-2 ml-1 text-sm font-semibold text-slate-700">
                    Email Address
                  </Text>
                  <View className="h-14 flex-row items-center rounded-xl border border-slate-200 bg-slate-50 px-4">
                    <Ionicons name="mail-outline" size={20} color="#64748B" />
                    <TextInput
                      placeholder="name@company.com"
                      placeholderTextColor="#94A3B8"
                      className="ml-3 flex-1 text-base text-slate-900"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={email}
                      onChangeText={(value) => {
                        setEmail(value);
                        setLocalError(null);
                        clearError();
                      }}
                    />
                  </View>
                </View>

                <View className="mb-5">
                  <Text className="mb-2 ml-1 text-sm font-semibold text-slate-700">
                    Password
                  </Text>
                  <View className="h-14 flex-row items-center rounded-xl border border-slate-200 bg-slate-50 px-4">
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color="#64748B"
                    />
                    <TextInput
                      placeholder="........"
                      placeholderTextColor="#94A3B8"
                      secureTextEntry={!showPassword}
                      className="ml-3 flex-1 text-base text-slate-900"
                      value={password}
                      onChangeText={(value) => {
                        setPassword(value);
                        setLocalError(null);
                        clearError();
                      }}
                    />
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setShowPassword((value) => !value)}
                    >
                      <Ionicons
                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                        size={20}
                        color="#64748B"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {activeError ? (
                  <Text className="mb-2 px-1 text-sm text-red-600">
                    {activeError}
                  </Text>
                ) : null}

                <TouchableOpacity
                  className={`mt-8 h-14 items-center justify-center rounded-xl shadow-sm ${isSubmitting ? "bg-slate-400" : "bg-slate-900"}`}
                  onPress={() => {
                    void handleSignup();
                  }}
                  activeOpacity={isSubmitting ? 1 : 0.85}
                  disabled={isSubmitting}
                >
                  <Text className="text-lg font-bold text-white">
                    {isSubmitting ? "Creating account..." : "Create Account"}
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="mb-6 mt-auto flex-row pt-10">
                <Text className="text-slate-500">
                  Already have an account?{" "}
                </Text>
                <Link href="/login" asChild>
                  <TouchableOpacity activeOpacity={0.7}>
                    <Text className="font-bold text-blue-600">Log in</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardScreenView>
    </SafeAreaView>
  );
}
