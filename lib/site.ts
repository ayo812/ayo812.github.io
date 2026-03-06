const DEFAULT_PRODUCTION_BASE_URL = "https://scaveng.io";
const DEFAULT_LOCAL_BASE_URL = "http://localhost:3000";

function normalizeBaseUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed.replace(/\/$/, "");
  }

  return `https://${trimmed.replace(/\/$/, "")}`;
}

export function getAppBaseUrl() {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  const explicitBaseUrl = process.env.APP_BASE_URL ?? process.env.NEXT_PUBLIC_APP_BASE_URL;
  if (explicitBaseUrl) {
    return normalizeBaseUrl(explicitBaseUrl);
  }

  const vercelProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelProductionUrl) {
    return normalizeBaseUrl(vercelProductionUrl);
  }

  const vercelPreviewUrl = process.env.VERCEL_URL;
  if (vercelPreviewUrl) {
    return normalizeBaseUrl(vercelPreviewUrl);
  }

  return process.env.NODE_ENV === "production" ? DEFAULT_PRODUCTION_BASE_URL : DEFAULT_LOCAL_BASE_URL;
}

export function getMetadataBase() {
  return new URL(getAppBaseUrl());
}

export function toAbsoluteUrl(pathOrUrl: string, baseUrl = getAppBaseUrl()) {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  return new URL(pathOrUrl, `${baseUrl.replace(/\/$/, "")}/`).toString();
}