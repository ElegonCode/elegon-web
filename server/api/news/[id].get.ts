import { getSteamNews, setNewsCacheHeaders } from "../../utils/steamNewsFeed";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id || !/^\d{1,24}$/.test(id)) {
    throw createError({ statusCode: 404, statusMessage: "Post not found" });
  }

  const posts = await getSteamNews().catch((error: unknown) => {
    console.error("Failed to load Steam news", error);
    throw createError({ statusCode: 502, statusMessage: "Steam news is unavailable right now" });
  });

  const index = posts.findIndex((post) => post.id === id);
  const post = posts[index];
  if (!post) throw createError({ statusCode: 404, statusMessage: "Post not found" });

  const summary = (entry: (typeof posts)[number] | undefined) =>
    entry ? { id: entry.id, title: entry.title, date: entry.date } : null;

  setNewsCacheHeaders(event);
  return { post, newer: summary(posts[index - 1]), older: summary(posts[index + 1]) };
});
