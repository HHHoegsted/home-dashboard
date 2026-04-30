const configuredApiBaseUrl = String(import.meta.env.VITE_API_BASE_URL ?? "");

export function getApiBaseUrl(): string {
  if (configuredApiBaseUrl === "auto") {
    return `${window.location.protocol}//${window.location.hostname}:8010`;
  }

  if (!configuredApiBaseUrl) {
    throw new Error("VITE_API_BASE_URL is not configured.");
  }

  return configuredApiBaseUrl;
}
