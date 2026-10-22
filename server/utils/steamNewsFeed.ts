import { STEAM_NEWS_FEED_URL, parseSteamNewsRss } from "./steamNews";

/** The Steam RSS feed, refreshed at most every 10 minutes and served stale while it refreshes. */
export const getSteamNews = defineCachedFunction(
  async () => {
    const xml = await $fetch<string>(STEAM_NEWS_FEED_URL, {
      responseType: "text",
      timeout: 10_000,
      headers: { Accept: "application/rss+xml, application/xml, text/xml" },
    });
    return parseSteamNewsRss(xml);
  },
  { name: "steam-news", getKey: () => "feed", maxAge: 600, swr: true },
);

export function setNewsCacheHeaders(event: Parameters<typeof setResponseHeader>[0]) {
  setResponseHeader(
    event,
    "Cache-Control",
    "public, max-age=300, s-maxage=600, stale-while-revalidate=3600",
  );
}
