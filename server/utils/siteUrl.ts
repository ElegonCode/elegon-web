import type { H3Event } from "h3";

/** Canonical site origin (no trailing slash), preferring NUXT_PUBLIC_SITE_URL. */
export function getSiteUrl(event: H3Event) {
  const configured = useRuntimeConfig(event).public.siteUrl as string;
  return (configured || getRequestURL(event).origin).replace(/\/+$/, "");
}
