import { request } from "@/lib/http";
import type {
  ServerAuthResponse,
  ServerChangePasswordResponse,
  ServerCurrentUserResponse,
  ServerUpdateCurrentUserResponse,
} from "@/modules/contracts";

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = LoginPayload & {
  name: string;
};

type UpdateProfilePayload = {
  name: string;
};

type ChangePasswordPayload = {
  oldPassword: string;
  newPassword: string;
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

export function updateCurrentUser(token: string, payload: UpdateProfilePayload) {
  return request<ServerUpdateCurrentUserResponse>("/me", {
    method: "PATCH",
    token,
    body: payload,
  });
}

export function changeCurrentPassword(
  token: string,
  payload: ChangePasswordPayload,
) {
  return request<ServerChangePasswordResponse>("/me/password", {
    method: "PATCH",
    token,
    body: payload,
  });
}
