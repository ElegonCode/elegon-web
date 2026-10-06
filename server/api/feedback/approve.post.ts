export default defineEventHandler(async (event) => {
  privateAccountResponse(event);
  requireAccountOrigin(event);
  const session = await getAccountSession(event);
  if (!session) throw createError({ statusCode: 401, statusMessage: "Please sign in" });
  const request = feedbackRequestId((await readBody(event))?.request);
  if (!request) throw createError({ statusCode: 404, statusMessage: "This sign-in link has expired.", data: { error: "request_expired" } });
  return await feedbackRequest<{ redirect: string }>(event, "/website/oauth/approve", { method: "POST", body: { request } });
});
