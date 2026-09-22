import { SUPPORTED_LOCALES } from "../../shared/locales";

const localeMap: Record<string, (typeof SUPPORTED_LOCALES)[number]> = {
  de: "de", es: "es", fr: "fr", pt: "pt-BR", "pt-br": "pt-BR", ru: "ru", zh: "zh-CN", "zh-cn": "zh-CN", "zh-hans": "zh-CN", "zh-sg": "zh-CN",
};

export default defineEventHandler((event) => {
  const path = getRequestURL(event).pathname;
  if (path !== "/" && path !== "/changelog") return;
  const userAgent = getRequestHeader(event, "user-agent") ?? "";
  if (/bot|crawler|spider|facebookexternalhit|slurp/i.test(userAgent)) return;
  const preferred = (getRequestHeader(event, "accept-language") ?? "").split(",")[0]?.split(";")[0]?.toLowerCase();
  const locale = preferred && localeMap[preferred] || preferred?.split("-")[0] && localeMap[preferred.split("-")[0]];
  if (!locale) return;
  setResponseHeader(event, "Vary", "Accept-Language");
  return sendRedirect(event, `/${locale}${path === "/" ? "" : path}`, 302);
});
