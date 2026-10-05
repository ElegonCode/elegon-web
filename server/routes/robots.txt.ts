export default defineEventHandler((event) => {
  setResponseHeader(event, "Content-Type", "text/plain; charset=utf-8");
  setResponseHeader(event, "Cache-Control", "public, max-age=3600, s-maxage=86400");

  return ["User-agent: *", "Allow: /", "Disallow: /api/", "Disallow: /auth/", "Disallow: /account", "", `Sitemap: ${getSiteUrl(event)}/sitemap.xml`, ""].join(
    "\n",
  );
});
