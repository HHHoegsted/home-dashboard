const configuredApiBaseUrl = String(import.meta.env.VITE_API_BASE_URL ?? "");

export function getApiBaseUrl(): string {
  if (configuredApiBaseUrl === "auto") {
    return "";
  }

  if (!configuredApiBaseUrl) {
    throw new Error("VITE_API_BASE_URL is not configured.");
  }

  return configuredApiBaseUrl;
}
