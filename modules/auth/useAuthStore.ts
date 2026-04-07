import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { isApiClientError } from "@/lib/http";
import * as AuthApi from "@/modules/auth/auth.api";
import type { AuthState, AuthUser } from "@/modules/contracts";

type LoginCredentials = {
  email: string;
  password: string;
};

type SignupCredentials = LoginCredentials & {
  name: string;
};

type AuthStoreStatus = "idle" | "loading" | "authenticated" | "error";

type PersistedAuthStore = Pick<
  AuthStore,
  "user" | "accessToken" | "isAuthenticated"
>;

type AuthStore = AuthState & {
  bootstrapped: boolean;
  status: AuthStoreStatus;
  errorMessage: string | null;
  bootstrapSession: () => Promise<void>;
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signUp: (credentials: SignupCredentials) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  markHydrated: () => void;
  markBootstrapped: () => void;
};

function buildAuthErrorMessage(error: unknown) {
  if (isApiClientError(error)) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

function applyAuthenticatedSession(
  set: (
    partial:
      | Partial<AuthStore>
      | ((state: AuthStore) => Partial<AuthStore>),
  ) => void,
  session: {
    accessToken: string;
    user: AuthUser;
  },
) {
  set({
    user: session.user,
    accessToken: session.accessToken,
    isAuthenticated: true,
    status: "authenticated",
    errorMessage: null,
  });
}

function clearSession(
  set: (
    partial:
      | Partial<AuthStore>
      | ((state: AuthStore) => Partial<AuthStore>),
  ) => void,
) {
  set({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    status: "idle",
    errorMessage: null,
  });
}

export const useAuthStore = create<AuthStore>()(
  persist<AuthStore, [], [], PersistedAuthStore>(
    (set, get) => ({
      user: null,
      accessToken: null,
      hydrated: false,
      bootstrapped: false,
      isAuthenticated: false,
      status: "idle",
      errorMessage: null,
      bootstrapSession: async () => {
        const token = get().accessToken;

        if (!token) {
          clearSession(set);
          set({ bootstrapped: true });
          return;
        }

        set({
          status: "loading",
          errorMessage: null,
        });

        try {
          const response = await AuthApi.getCurrentUser(token);

          applyAuthenticatedSession(set, {
            accessToken: token,
            user: response.user,
          });
          set({ bootstrapped: true });
        } catch (error) {
          if (isApiClientError(error) && error.status === 401) {
            clearSession(set);
            set({ bootstrapped: true });
            return;
          }

          set({
            status: "error",
            errorMessage: buildAuthErrorMessage(error),
            bootstrapped: true,
          });
        }
      },
      signIn: async (credentials) => {
        set({
          status: "loading",
          errorMessage: null,
        });

        try {
          const response = await AuthApi.login({
            email: credentials.email.trim().toLowerCase(),
            password: credentials.password,
          });

          applyAuthenticatedSession(set, response);
          set({ bootstrapped: true });
        } catch (error) {
          clearSession(set);
          set({
            status: "error",
            errorMessage: buildAuthErrorMessage(error),
            bootstrapped: true,
          });
          throw error;
        }
      },
      signUp: async (credentials) => {
        set({
          status: "loading",
          errorMessage: null,
        });

        try {
          const response = await AuthApi.register({
            name: credentials.name.trim(),
            email: credentials.email.trim().toLowerCase(),
            password: credentials.password,
          });

          applyAuthenticatedSession(set, response);
          set({ bootstrapped: true });
        } catch (error) {
          clearSession(set);
          set({
            status: "error",
            errorMessage: buildAuthErrorMessage(error),
            bootstrapped: true,
          });
          throw error;
        }
      },
      logout: () => clearSession(set),
      clearError: () => set({ errorMessage: null, status: "idle" }),
      markHydrated: () => set({ hydrated: true }),
      markBootstrapped: () => set({ bootstrapped: true }),
    }),
    {
      name: "nedai-auth-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      },
    },
  ),
);
