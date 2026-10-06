export default defineEventHandler(async (event) => {
  const session = await getAccountSession(event);
  if (!session) throw createError({ statusCode: 401, statusMessage: "Please sign in" });
  return await feedbackRequest<{ stats: { posts: number; comments: number; votes: number } | null }>(event, "/website/feedback-stats");
});
