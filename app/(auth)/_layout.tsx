import { Stack, router } from "expo-router";
import { useEffect } from "react";

import { useAuthStore } from "@/modules/auth/useAuthStore";

export default function AuthLayout() {
  const hydrated = useAuthStore((state) => state.hydrated);
  const bootstrapped = useAuthStore((state) => state.bootstrapped);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!hydrated || !bootstrapped || !isAuthenticated) {
      return;
    }

    const isComplete = user?.profileCompletion?.isComplete;
    router.replace(isComplete ? "/(app)" : "/(app)/onboarding");
  }, [hydrated, bootstrapped, isAuthenticated, user]);

  if (!hydrated || !bootstrapped) {
    return null;
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}
