function trimTrailingSlashes(value: string) {
  return value.replace(/\/+$/, "");
}

function deriveServerOrigin(apiBaseUrl: string) {
  const normalizedApiBaseUrl = trimTrailingSlashes(apiBaseUrl);

  return normalizedApiBaseUrl.replace(/\/api\/v1$/, "");
}

function deriveUploadThingUrl(serverOrigin: string, apiBaseUrl: string) {
  if (serverOrigin) {
    return `${trimTrailingSlashes(serverOrigin)}/api/uploadthing`;
  }

  const normalizedApiBaseUrl = trimTrailingSlashes(apiBaseUrl);

  if (/\/api\/v1$/.test(normalizedApiBaseUrl)) {
    return normalizedApiBaseUrl.replace(/\/api\/v1$/, "/api/uploadthing");
  }

  return "";
}

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL?.trim() ?? "";
export const SERVER_ORIGIN = trimTrailingSlashes(
  process.env.EXPO_PUBLIC_SERVER_URL?.trim() ?? deriveServerOrigin(API_BASE_URL),
);
export const UPLOADTHING_URL = deriveUploadThingUrl(SERVER_ORIGIN, API_BASE_URL);
