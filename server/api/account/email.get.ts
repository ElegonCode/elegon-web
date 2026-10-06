export default defineEventHandler(async (event) => {
  const session = await getAccountSession(event);
  if (!session) throw createError({ statusCode: 401, statusMessage: "Please sign in" });
  return await feedbackRequest<{ email: string | null; pending_email: string | null }>(event, "/website/email");
});
