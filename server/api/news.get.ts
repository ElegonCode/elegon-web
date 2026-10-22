import { STEAM_NEWS_URL } from "../utils/steamNews";
import { getSteamNews, setNewsCacheHeaders } from "../utils/steamNewsFeed";

export default defineEventHandler(async (event) => {
  const posts = await getSteamNews().catch((error: unknown) => {
    console.error("Failed to load Steam news", error);
    throw createError({ statusCode: 502, statusMessage: "Steam news is unavailable right now" });
  });

  setNewsCacheHeaders(event);
  return {
    steamUrl: STEAM_NEWS_URL,
    posts: posts.map(({ html: _html, ...post }) => post),
  };
});
