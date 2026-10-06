export default defineEventHandler(async (event) => {
  privateAccountResponse(event);
  requireAccountOrigin(event);
  const session = await getAccountSession(event);
  if (!session) throw createError({ statusCode: 401, statusMessage: "Please sign in" });
  const body = await readBody(event);
  const code = typeof body?.code === "string" ? body.code.replace(/\s+/g, "") : "";
  if (!/^\d{6}$/.test(code)) throw createError({ statusCode: 400, statusMessage: "Enter the 6-digit code from the email." });
  return await feedbackRequest<{ email: string }>(event, "/website/email/verify", { method: "POST", body: { code } });
});
