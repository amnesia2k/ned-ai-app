import { Redirect } from "expo-router";

import { useAuthStore } from "@/modules/auth/useAuthStore";

export default function Index() {
  const hydrated = useAuthStore((state) => state.hydrated);
  const bootstrapped = useAuthStore((state) => state.bootstrapped);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  if (!hydrated || !bootstrapped) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Redirect
      href={user?.profileCompletion.isComplete ? "/(app)" : "/(app)/onboarding"}
    />
  );
}
