import { Redirect, Stack, usePathname } from "expo-router";
import { useEffect } from "react";

import { useAuthStore } from "@/modules/auth/useAuthStore";
import { useChatStore } from "@/modules/chat/useChatStore";
import { useDocumentStore } from "@/modules/documents/useDocumentStore";
import { useTimetableStore } from "@/modules/timetable/useTimetableStore";

export default function AppLayout() {
  const hydrated = useAuthStore((state) => state.hydrated);
  const bootstrapped = useAuthStore((state) => state.bootstrapped);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const resetChat = useChatStore((state) => state.reset);
  const resetDocuments = useDocumentStore((state) => state.resetSession);
  const resetTimetable = useTimetableStore((state) => state.reset);
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated) {
      resetChat();
      resetDocuments();
      resetTimetable();
    }
  }, [isAuthenticated, resetChat, resetDocuments, resetTimetable]);

  if (!hydrated || !bootstrapped) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  if (!user) {
    return null;
  }

  const isOnboardingRoute = pathname === "/onboarding";
  const isComplete = user.profileCompletion?.isComplete;

  if (!isComplete && !isOnboardingRoute) {
    return <Redirect href="/onboarding" />;
  }

  if (isComplete && isOnboardingRoute) {
    return <Redirect href="/" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="change-password" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
