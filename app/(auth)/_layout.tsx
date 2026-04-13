import { Redirect, Stack } from "expo-router";

import { useAuthStore } from "@/modules/auth/useAuthStore";

export default function AuthLayout() {
  const hydrated = useAuthStore((state) => state.hydrated);
  const bootstrapped = useAuthStore((state) => state.bootstrapped);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  if (!hydrated || !bootstrapped) {
    return null;
  }

  if (isAuthenticated) {
    const isComplete = user?.profileCompletion?.isComplete;
    return <Redirect href={isComplete ? "/" : "/onboarding"} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}
