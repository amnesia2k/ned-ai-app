import { Redirect, Stack, useSegments } from "expo-router";
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
  const segments = useSegments();

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
    return <Redirect href="/(auth)/login" />;
  }

  const activeSegment = segments[segments.length - 1] ?? "index";
  const isOnboardingRoute = activeSegment === "onboarding";

  if (user && !user.profileCompletion.isComplete && !isOnboardingRoute) {
    return <Redirect href="/(app)/onboarding" />;
  }

  if (user?.profileCompletion.isComplete && isOnboardingRoute) {
    return <Redirect href="/(app)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="knowledge-vault" />
      <Stack.Screen name="timetable" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="change-password" />
    </Stack>
  );
}
