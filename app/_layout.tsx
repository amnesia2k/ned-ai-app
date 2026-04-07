import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import * as NavigationBar from "expo-navigation-bar";
import { Stack } from "expo-router";
import * as ExpoSplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { Platform } from "react-native";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./globals.css";

import { SplashScreen } from "@/components/SplashScreen";
import { useAuthStore } from "@/modules/auth/useAuthStore";

void ExpoSplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: "index",
};

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const hydrated = useAuthStore((state) => state.hydrated);
  const bootstrapped = useAuthStore((state) => state.bootstrapped);
  const bootstrapSession = useAuthStore((state) => state.bootstrapSession);

  useEffect(() => {
    async function prepare() {
      try {
        if (Platform.OS === "android") {
          await NavigationBar.setButtonStyleAsync("dark");
        }

        await new Promise((resolve) => setTimeout(resolve, 1200));
      } catch (error) {
        console.warn(error);
      } finally {
        setAppIsReady(true);
      }
    }

    void prepare();
  }, []);

  useEffect(() => {
    if (!hydrated || bootstrapped) {
      return;
    }

    void bootstrapSession();
  }, [bootstrapped, bootstrapSession, hydrated]);

  useEffect(() => {
    if (appIsReady) {
      void ExpoSplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady || !hydrated || !bootstrapped) {
    return <SplashScreen />;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider value={DefaultTheme}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#FFFFFF" },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(app)" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="dark" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
