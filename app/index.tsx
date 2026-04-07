import { Redirect } from "expo-router";

import { useAuthStore } from "@/modules/auth/useAuthStore";

export default function Index() {
  const hydrated = useAuthStore((state) => state.hydrated);
  const bootstrapped = useAuthStore((state) => state.bootstrapped);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!hydrated || !bootstrapped) {
    return null;
  }

  return <Redirect href={isAuthenticated ? "/(app)" : "/(auth)/login"} />;
}
