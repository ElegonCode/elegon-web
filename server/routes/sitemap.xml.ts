import changelog from "../generated/changelog.json";

export default defineEventHandler((event) => {
  const siteUrl = getSiteUrl(event);
  const lastUpdate = changelog.entries.reduce(
    (latest, entry) => (entry.date > latest ? entry.date : latest),
    "",
  );

  const pages = [
    { path: "/", changefreq: "weekly", priority: "1.0" },
    { path: "/changelog", changefreq: "daily", priority: "0.8" },
  ];

  const urls = pages
    .map(
      (page) => `  <url>
    <loc>${siteUrl}${page.path}</loc>${lastUpdate ? `\n    <lastmod>${lastUpdate}</lastmod>` : ""}
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`,
    )
    .join("\n");

  setResponseHeader(event, "Content-Type", "application/xml; charset=utf-8");
  setResponseHeader(event, "Cache-Control", "public, max-age=3600, s-maxage=86400");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
});
