import changelog from "../generated/changelog.json";
import { SUPPORTED_LOCALES } from "../../app/utils/locales";

export default defineEventHandler((event) => {
  const siteUrl = getSiteUrl(event);
  const lastUpdate = changelog.entries.reduce(
    (latest, entry) => (entry.date > latest ? entry.date : latest),
    "",
  );

  const pages = SUPPORTED_LOCALES.flatMap((locale) => [
    { path: locale === "en" ? "/" : `/${locale}`, changefreq: "weekly", priority: locale === "en" ? "1.0" : "0.9", locale },
    { path: locale === "en" ? "/changelog" : `/${locale}/changelog`, changefreq: "daily", priority: locale === "en" ? "0.8" : "0.7", locale },
  ]);

  const urls = pages
    .map(
      (page) => `  <url>
    <loc>${siteUrl}${page.path}</loc>
    ${SUPPORTED_LOCALES.map((locale) => `    <xhtml:link rel="alternate" hreflang="${locale}" href="${siteUrl}${locale === "en" ? page.path.replace(/^\/(de|es|fr|pt-BR|ru|zh-CN)(?=\/|$)/, "") : `/${locale}${page.path.replace(/^\/(de|es|fr|pt-BR|ru|zh-CN)(?=\/|$)/, "")}`}" />`).join("\n")}
    <xhtml:link rel="alternate" hreflang="x-default" href="${siteUrl}${page.path.replace(/^\/(de|es|fr|pt-BR|ru|zh-CN)(?=\/|$)/, "")}" />${lastUpdate ? `\n    <lastmod>${lastUpdate}</lastmod>` : ""}
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`,
    )
    .join("\n");

  setResponseHeader(event, "Content-Type", "application/xml; charset=utf-8");
  setResponseHeader(event, "Cache-Control", "public, max-age=3600, s-maxage=86400");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;
});
