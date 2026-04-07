import axios from "axios";
import type { AxiosError, AxiosRequestConfig } from "axios";

import { API_BASE_URL } from "@/lib/env";
import type { ApiErrorPayload, ApiResponse } from "@/modules/contracts";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  token?: string | null;
  headers?: Record<string, string>;
};

export class ApiClientError extends Error {
  status: number;
  data?: ApiErrorPayload["data"];

  constructor(status: number, message: string, data?: ApiErrorPayload["data"]) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.data = data;
  }
}

function ensureApiBaseUrl() {
  if (!API_BASE_URL) {
    throw new ApiClientError(
      500,
      "Missing EXPO_PUBLIC_API_URL. Update nedai-app/.env and restart Expo.",
    );
  }
}

const httpClient = axios.create({
  baseURL: API_BASE_URL || undefined,
  headers: {
    Accept: "application/json",
  },
});

function getAxiosErrorPayload(error: AxiosError<ApiErrorPayload>) {
  const responseData = error.response?.data;

  if (
    responseData &&
    typeof responseData === "object" &&
    "message" in responseData
  ) {
    return responseData;
  }

  return null;
}

export async function request<T>(path: string, options: RequestOptions = {}) {
  ensureApiBaseUrl();

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...options.headers,
  };

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const config: AxiosRequestConfig = {
    url: path,
    method: options.method ?? "GET",
    headers,
    data: options.body,
  };

  try {
    const response = await httpClient.request<ApiResponse<T>>(config);
    const envelope = response.data;

    if (!envelope || typeof envelope !== "object" || !("data" in envelope)) {
      throw new ApiClientError(response.status, "Invalid server response");
    }

    if (envelope.success === false) {
      throw new ApiClientError(response.status, envelope.message, undefined);
    }

    return envelope.data;
  } catch (error) {
    if (axios.isAxiosError<ApiErrorPayload>(error)) {
      const payload = getAxiosErrorPayload(error);

      throw new ApiClientError(
        error.response?.status ?? 0,
        payload?.message || "Unable to reach the server",
        payload?.data,
      );
    }

    if (error instanceof ApiClientError) {
      throw error;
    }

    throw new ApiClientError(0, "Unable to reach the server");
  }
}

export function isApiClientError(error: unknown): error is ApiClientError {
  return error instanceof ApiClientError;
}
