export default defineEventHandler(async (event) => {
  privateAccountResponse(event);
  requireAccountOrigin(event);
  const session = await getAccountSession(event);
  if (!session) throw createError({ statusCode: 401, statusMessage: "Please sign in" });
  const body = await readBody(event);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  if (!email || email.length > 254) throw createError({ statusCode: 400, statusMessage: "Enter a valid email address." });
  return await feedbackRequest<{ pending_email: string }>(event, "/website/email/start", { method: "POST", body: { email } });
});
