import { Stack, router, useSegments } from "expo-router";
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

  useEffect(() => {
    if (!hydrated || !bootstrapped || !isAuthenticated || !user) {
      return;
    }

    const activeSegment = segments[segments.length - 1] ?? "index";
    const isOnboardingRoute = activeSegment === "onboarding";
    const isComplete = user.profileCompletion?.isComplete;

    if (!isComplete && !isOnboardingRoute) {
      router.replace("/(app)/onboarding");
    } else if (isComplete && isOnboardingRoute) {
      router.replace("/(app)");
    }
  }, [hydrated, bootstrapped, isAuthenticated, user, segments]);

  useEffect(() => {
    if (hydrated && bootstrapped && !isAuthenticated) {
      router.replace("/(auth)/login");
    }
  }, [hydrated, bootstrapped, isAuthenticated]);

  if (!hydrated || !bootstrapped) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
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
