import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import * as NavigationBar from "expo-navigation-bar";
import { Stack } from "expo-router";
import * as ExpoSplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { Platform } from "react-native";
import "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./globals.css";

import { SplashScreen } from "@/components/SplashScreen";
import { useAuthStore } from "@/modules/auth/useAuthStore";

void ExpoSplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: "(app)",
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider value={DefaultTheme}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: "#F8FAFC" },
            }}
          >
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(app)" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="dark" />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
