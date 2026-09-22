const localeMap = {
  de: "de", es: "es", fr: "fr", pt: "pt-BR", "pt-br": "pt-BR", ru: "ru", zh: "zh-CN", "zh-cn": "zh-CN", "zh-hans": "zh-CN", "zh-sg": "zh-CN",
} as const;

export default defineEventHandler((event) => {
  const path = getRequestURL(event).pathname;
  if (path !== "/" && path !== "/changelog") return;
  const userAgent = getRequestHeader(event, "user-agent") ?? "";
  if (/bot|crawler|spider|facebookexternalhit|slurp/i.test(userAgent)) return;
  const saved = getCookie(event, "elegon_locale")?.toLowerCase();
  if (saved === "en") return;

  const preferredLanguages = (getRequestHeader(event, "accept-language") ?? "")
    .split(",")
    .map((item) => {
      const [language = "", quality = ""] = item.trim().split(";");
      const q = quality.startsWith("q=") ? Number(quality.slice(2)) : 1;
      return { language: language.toLowerCase(), q: Number.isFinite(q) ? q : 0 };
    })
    .filter(({ language, q }) => language && q > 0)
    .sort((a, b) => b.q - a.q);
  const locale =
    (saved && localeMap[saved]) ||
    preferredLanguages
      .map(({ language }) => localeMap[language] ?? localeMap[language.split("-")[0]])
      .find(Boolean);
  if (!locale) return;
  setResponseHeader(event, "Vary", "Accept-Language");
  return sendRedirect(event, `/${locale}${path === "/" ? "" : path}`, 302);
});
