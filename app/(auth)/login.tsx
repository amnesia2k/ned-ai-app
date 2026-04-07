import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Link, type Href } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuthStore } from "@/modules/auth/useAuthStore";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const signIn = useAuthStore((state) => state.signIn);
  const clearError = useAuthStore((state) => state.clearError);
  const errorMessage = useAuthStore((state) => state.errorMessage);
  const status = useAuthStore((state) => state.status);
  const isSubmitting = status === "loading";
  const activeError = localError || errorMessage;

  async function handleLogin() {
    clearError();

    if (!email.trim() || !password.trim()) {
      setLocalError("Email and password are required.");
      return;
    }

    if (!isValidEmail(email)) {
      setLocalError("Enter a valid email address.");
      return;
    }

    setLocalError(null);

    try {
      await signIn({ email, password });
    } catch {}
  }

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
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
                Welcome back
              </Text>
              <Text className="mb-10 px-4 text-center text-slate-500">
                Sign in to continue with your workspace.
              </Text>

              <View className="w-full">
                <View className="mb-6">
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

                <View className="mb-6">
                  <View className="mx-1 mb-2 flex-row items-center justify-between">
                    <Text className="text-sm font-semibold text-slate-700">
                      Password
                    </Text>
                    <TouchableOpacity activeOpacity={0.7}>
                      <Text className="text-sm font-medium text-blue-600">
                        Forgot Password?
                      </Text>
                    </TouchableOpacity>
                  </View>
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
                    void handleLogin();
                  }}
                  activeOpacity={isSubmitting ? 1 : 0.85}
                  disabled={isSubmitting}
                >
                  <Text className="text-lg font-bold text-white">
                    {isSubmitting ? "Signing in..." : "Continue"}
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="mb-6 mt-auto flex-row pt-10">
                <Text className="text-slate-500">
                  Don&apos;t have an account?{" "}
                </Text>
                <Link href={"/(auth)/signup" as Href} asChild>
                  <TouchableOpacity activeOpacity={0.7}>
                    <Text className="font-bold text-blue-600">Sign up</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
