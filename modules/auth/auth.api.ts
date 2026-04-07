import { request } from "@/lib/http";
import type {
  ServerAuthResponse,
  ServerCurrentUserResponse,
} from "@/modules/contracts";

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = LoginPayload & {
  name: string;
};

export function register(payload: RegisterPayload) {
  return request<ServerAuthResponse>("/auth/register", {
    method: "POST",
    body: payload,
  });
}

export function login(payload: LoginPayload) {
  return request<ServerAuthResponse>("/auth/login", {
    method: "POST",
    body: payload,
  });
}

export function getCurrentUser(token: string) {
  return request<ServerCurrentUserResponse>("/me", {
    token,
  });
}
